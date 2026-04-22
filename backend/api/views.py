import time

from django.contrib.auth import authenticate
from django.contrib.auth.models import User 
from django.db import OperationalError
from django.db.models.deletion import ProtectedError
from django.db.models import Avg, Case, Count, IntegerField, Q, Value, When
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Booking, Profile, Subject, TutorAvailabilitySlot, TutorReview, TutorService
from .serializers import (
    BookingCreateSerializer,
    BookingReasonSerializer,
    BookingSerializer,
    ProfileSerializer,
    SubjectSerializer,
    TutorAvailabilitySlotCreateSerializer,
    TutorReviewSerializer,
    TutorServiceSerializer,
    UserSerializer, SignupSerializer, LoginSerializer,
)


def with_db_retry(operation, retries=5, delay=0.15):
    last_error = None
    for attempt in range(retries):
        try:
            return operation()
        except OperationalError as exc:
            if 'database is locked' not in str(exc).lower():
                raise
            last_error = exc
            if attempt == retries - 1:
                raise
            time.sleep(delay)
    raise last_error

DISCIPLINE_SUBJECTS = [
    'Calculus',
    'Linear Algebra for Engineers',
    'Theoretical Mechanics',
    'Programming Principles I',
    'Statistics',
    'Accounting',
]

class SubjectListAPIView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        existing_names = set(
            Subject.objects.filter(name__in=DISCIPLINE_SUBJECTS).values_list('name', flat=True)
        )
        for name in DISCIPLINE_SUBJECTS:
            if name not in existing_names:
                with_db_retry(lambda subject_name=name: Subject.objects.create(name=subject_name))

        order_case = Case(
            *[When(name=name, then=Value(index)) for index, name in enumerate(DISCIPLINE_SUBJECTS)],
            output_field=IntegerField(),
        )
        return Subject.objects.filter(name__in=DISCIPLINE_SUBJECTS).annotate(_order=order_case).order_by('_order')


class TutorServiceDetailAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        try:
            service = TutorService.objects.select_related('tutor__user', 'subject').prefetch_related('slots').get(pk=pk)
        except TutorService.DoesNotExist:
            return Response({'detail': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TutorServiceSerializer(service)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            service = TutorService.objects.select_related('tutor__user').get(pk=pk)
        except TutorService.DoesNotExist:
            return Response({'detail': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)

        if service.tutor.user_id != request.user.id:
            return Response({'detail': 'You can delete only your own service.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            with_db_retry(lambda: service.delete())
        except ProtectedError:
            return Response(
                {
                    'detail': (
                        'This service cannot be deleted because it already has bookings. '
                        'Cancel or complete related bookings first.'
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.select_related('user').filter(user=request.user).first()
        if profile is None:
            profile, _ = with_db_retry(lambda: Profile.objects.get_or_create(
                user=request.user,
                defaults={'full_name': request.user.username},
            ))
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = with_db_retry(lambda: Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        ))

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        with_db_retry(lambda: serializer.save())

        return Response(serializer.data)

class MyServicesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        services = TutorService.objects.select_related('tutor__user', 'subject').prefetch_related('slots').filter(
            tutor__user=request.user
        ).order_by('-created_at')
        serializer = TutorServiceSerializer(services, many=True)
        return Response(serializer.data)


class TutorServiceSlotCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            service = TutorService.objects.select_related('tutor__user').get(pk=pk)
        except TutorService.DoesNotExist:
            return Response({'detail': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)

        if service.tutor.user_id != request.user.id:
            return Response({'detail': 'You can add slots only to your own service.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TutorAvailabilitySlotCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        slot_data = serializer.validated_data
        if TutorAvailabilitySlot.objects.filter(
            tutor_service=service,
            date=slot_data['date'],
            start_time=slot_data['start_time'],
            end_time=slot_data['end_time'],
            format=slot_data['format'],
        ).exists():
            return Response(
                {'detail': 'This slot already exists for the selected service.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        slot = with_db_retry(lambda: TutorAvailabilitySlot.objects.create(tutor_service=service, **slot_data))
        return Response(TutorAvailabilitySlotCreateSerializer(slot).data, status=status.HTTP_201_CREATED)

class TutorServiceListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        services = TutorService.objects.select_related('tutor__user', 'subject').prefetch_related('slots').filter(is_active=True)
        search = request.query_params.get('search')
        subject_id = request.query_params.get('subject')
        format_value = request.query_params.get('format')
        max_price = request.query_params.get('max_price')
        min_price = request.query_params.get('min_price')

        if subject_id:
            services = services.filter(subject_id=subject_id)
        if format_value:
            services = services.filter(format=format_value)
        if min_price:
            services = services.filter(price_per_hour__gte=min_price)
        if max_price:
            services = services.filter(price_per_hour__lte=max_price)
        if search:
            services_by_title = services.filter(title__icontains=search)
            services_by_description = services.filter(description__icontains=search)
            services_by_subject = services.filter(subject__name__icontains=search)
            services_by_tutor_name = services.filter(tutor__full_name__icontains=search)
            services_by_username = services.filter(tutor__user__username__icontains=search)
            services = (
                services_by_title
                | services_by_description
                | services_by_subject
                | services_by_tutor_name
                | services_by_username
            ).distinct()
        serializer = TutorServiceSerializer(services.order_by('-created_at'), many=True)
        return Response(serializer.data)

    def post(self, request):
        profile, _ = with_db_retry(lambda: Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        ))
        if not profile.is_tutor:
            profile.is_tutor = True
            with_db_retry(lambda: profile.save())
        serializer = TutorServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with_db_retry(lambda: serializer.save(tutor=profile))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TutorProfileListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profiles = (
            Profile.objects.select_related('user')
            .prefetch_related('services__subject', 'services__slots', 'reviews')
            .filter(is_tutor=True)
            .annotate(avg_rating=Avg('reviews__rating'), reviews_count=Count('reviews'))
        )

        if request.user.is_authenticated:
            profiles = profiles.exclude(user=request.user)

        profiles = profiles.order_by('full_name')

        return Response([self._serialize_profile(profile) for profile in profiles])

    def _serialize_profile(self, profile):
        services = profile.services.all().order_by('-created_at')

        return {
            **ProfileSerializer(profile).data,
            'services': TutorServiceSerializer(services, many=True).data,
            'rating': float(profile.avg_rating or 0),
            'reviews_count': int(profile.reviews_count or 0),
        }

class TutorProfileDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            profile = (
                Profile.objects.select_related('user')
                .prefetch_related('services__subject', 'services__slots', 'reviews')
                .annotate(avg_rating=Avg('reviews__rating'), reviews_count=Count('reviews'))
                .get(pk=pk, is_tutor=True)
            )
        except Profile.DoesNotExist:
            return Response({'detail': 'Tutor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        services = profile.services.all().order_by('-created_at')

        return Response({
            **ProfileSerializer(profile).data,
            'services': TutorServiceSerializer(services, many=True).data,
            'rating': float(profile.avg_rating or 0),
            'reviews_count': int(profile.reviews_count or 0),
            'reviews': TutorReviewSerializer(profile.reviews.all(), many=True).data,
        })


class SignupAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = with_db_retry(lambda: serializer.save())
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'detail': 'User registered successfully.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            },
            status=status.HTTP_201_CREATED
        )
class TutorStatusAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile, _ = with_db_retry(lambda: Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        ))

        is_tutor = request.data.get('is_tutor')
        if is_tutor is None:
            return Response(
                {'detail': 'is_tutor is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.is_tutor = bool(is_tutor)
        with_db_retry(lambda: profile.save(update_fields=['is_tutor']))

        if not profile.is_tutor:
            TutorService.objects.filter(
                tutor=profile,
                is_active=True
            ).update(is_active=False)

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self , request):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            return Response({
                "detail":"Incorrect email or password"
            } , status=status.HTTP_401_UNAUTHORIZED)

        authenticated_user = authenticate(request, username=user.username, password=password)
        if authenticated_user is None:
            return Response({
                "detail":"Incorrect email or password"
            } , status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(authenticated_user)

        return Response({
            "detail":"Login successfully",
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': authenticated_user.id,
            'username': authenticated_user.username,
            'email': authenticated_user.email,
        }, status=status.HTTP_200_OK)
class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BookingViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects
            .select_related(
                'student',
                'student__profile',
                'tutor',
                'tutor__user',
                'service',
                'service__subject',
                'slot',
                'status_changed_by',
                'cancelled_by',
                'no_show_marked_by',
            )
            .filter(Q(student=self.request.user) | Q(tutor__user=self.request.user))
            .order_by('-scheduled_start_at', '-id')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        output = BookingSerializer(booking, context={'request': request})
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        return self._transition(request, pk, 'confirm')

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        return self._transition(request, pk, 'reject', with_reason=True)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        return self._transition(request, pk, 'cancel', with_reason=True)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        return self._transition(request, pk, 'complete')

    @action(detail=True, methods=['post'], url_path='no-show')
    def no_show(self, request, pk=None):
        return self._transition(request, pk, 'mark_no_show')

    def _transition(self, request, pk, method_name, with_reason=False):
        booking = self.get_object()
        reason = ''
        if with_reason:
            payload = BookingReasonSerializer(data=request.data)
            payload.is_valid(raise_exception=True)
            reason = payload.validated_data.get('reason', '')

        try:
            if with_reason:
                getattr(booking, method_name)(request.user, reason=reason)
            else:
                getattr(booking, method_name)(request.user)
        except DjangoValidationError as exc:
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            return Response({'detail': detail}, status=status.HTTP_400_BAD_REQUEST)

        output = BookingSerializer(booking, context={'request': request})
        return Response(output.data, status=status.HTTP_200_OK)
