from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Booking, ChatMessage, Review, Subject, TutorAvailability, TutorProfile, TutoringService
from .serializers import (
    BookingSerializer,
    ChatMessageSerializer,
    LoginSerializer,
    LogoutSerializer,
    ReviewSerializer,
    SubjectSerializer,
    TutorAvailabilitySerializer,
    TutorProfileDetailSerializer,
    TutorProfileSerializer,
    TutoringServiceSerializer,
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    User = get_user_model()
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    serializer = LogoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        token = RefreshToken(serializer.validated_data['refresh'])
        token.blacklist()
    except Exception:
        return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'id': request.user.id, 'username': request.user.username})


class BookingListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Booking.objects.filter(student=request.user).order_by('-created_at')
        return Response(BookingSerializer(qs, many=True).data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(student=request.user)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class ChatMessageListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id: int):
        qs = ChatMessage.objects.filter(booking_id=booking_id).order_by('created_at')
        return Response(ChatMessageSerializer(qs, many=True).data)

    def post(self, request, booking_id: int):
        payload = dict(request.data)
        payload['booking'] = booking_id
        serializer = ChatMessageSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save(sender=request.user)
        return Response(ChatMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class TutoringServiceViewSet(viewsets.ModelViewSet):
    queryset = TutoringService.objects.select_related('tutor__user', 'subject').order_by('-created_at')
    serializer_class = TutoringServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        tutor_profile, _ = TutorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(tutor=tutor_profile)


class TutorProfileDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, profile_id: int):
        try:
            profile = TutorProfile.objects.get(id=profile_id)
            return Response(TutorProfileDetailSerializer(profile).data)
        except TutorProfile.DoesNotExist:
            return Response({'detail': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)


class ReviewListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tutor_id: int):
        try:
            tutor = TutorProfile.objects.get(id=tutor_id)
            reviews = tutor.reviews.all().order_by('-created_at')
            return Response(ReviewSerializer(reviews, many=True).data)
        except TutorProfile.DoesNotExist:
            return Response({'detail': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, tutor_id: int):
        try:
            tutor = TutorProfile.objects.get(id=tutor_id)
            payload = dict(request.data)
            payload['tutor'] = tutor_id
            serializer = ReviewSerializer(data=payload)
            serializer.is_valid(raise_exception=True)
            review = serializer.save(reviewer=request.user)
            tutor.update_rating()
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except TutorProfile.DoesNotExist:
            return Response({'detail': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)


class TutorAvailabilityListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tutor_id: int):
        try:
            tutor = TutorProfile.objects.get(id=tutor_id)
            availabilities = tutor.availabilities.all().order_by('weekday', 'start_time')
            return Response(TutorAvailabilitySerializer(availabilities, many=True).data)
        except TutorProfile.DoesNotExist:
            return Response({'detail': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, tutor_id: int):
        try:
            tutor = TutorProfile.objects.get(id=tutor_id)
            if tutor.user != request.user:
                return Response({'detail': 'You can only add availability for your own profile'}, status=status.HTTP_403_FORBIDDEN)
            payload = dict(request.data)
            payload['tutor'] = tutor_id
            serializer = TutorAvailabilitySerializer(data=payload)
            serializer.is_valid(raise_exception=True)
            availability = serializer.save()
            return Response(TutorAvailabilitySerializer(availability).data, status=status.HTTP_201_CREATED)
        except TutorProfile.DoesNotExist:
            return Response({'detail': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)
