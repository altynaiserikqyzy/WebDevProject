from django.contrib.auth.models import User 
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Conversation, ConversationParticipant, Message, Profile, Subject, TutorService
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    ProfileSerializer,
    SubjectSerializer,
    TutorServiceSerializer,
    UserSerializer, SignupSerializer, LoginSerializer,
)

class SubjectListAPIView(generics.ListAPIView):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class TutorServiceDetailAPIView(generics.RetrieveAPIView):
    queryset = TutorService.objects.select_related('tutor__user', 'subject')
    serializer_class = TutorServiceSerializer
    permission_classes = [permissions.AllowAny]


class MyProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        )
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        )

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class TutorServiceListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        services = TutorService.objects.select_related('tutor__user', 'subject').filter(is_active=True)
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
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        )
        if not profile.is_tutor:
            profile.is_tutor = True
            profile.save()
        serializer = TutorServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(tutor=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserSearchAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response([])

        users = User.objects.filter(
            username__icontains=query
        ).exclude(id=request.user.id)

        profile_users = User.objects.filter(
            profile__full_name__icontains=query
        ).exclude(id=request.user.id)

        email_users = User.objects.filter(
            email__icontains=query
        ).exclude(id=request.user.id)

        users = (users | profile_users | email_users).distinct()

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class StartConversationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get('user_id')

        if not other_user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if other_user.id == request.user.id:
            return Response({'detail': 'You cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        conversations = Conversation.objects.filter(participants__user=request.user).filter(participants__user=other_user).distinct()

        conversation = None
        for item in conversations:
            if item.participants.count() == 2:
                conversation = item
                break

        if conversation is None:
            conversation = Conversation.objects.create()
            ConversationParticipant.objects.create(conversation=conversation, user=request.user)
            ConversationParticipant.objects.create(conversation=conversation, user=other_user)

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)


class MyConversationListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(participants__user=request.user).distinct().order_by('-updated_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class ConversationMessagesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id, participants__user=request.user)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        messages = conversation.messages.select_related('sender').order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id, participants__user=request.user)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(conversation=conversation, sender=request.user)

        conversation.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SignupAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        full_name = serializer.validated_data['full_name']
        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'Username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'Email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        Profile.objects.create(
            user=user,
            full_name=full_name
        )
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
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'full_name': request.user.username},
        )

        is_tutor = request.data.get('is_tutor')
        if is_tutor is None:
            return Response(
                {'detail': 'is_tutor is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.is_tutor = bool(is_tutor)
        profile.save(update_fields=['is_tutor'])

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

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username = username , password = password)
        if user is None:
            return Response({
                "detail":"Incorrect username or password"
            } , status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)

        return Response({
            "detail":"Login successfully",
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_200_OK)
class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
