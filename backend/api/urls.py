from django.urls import path

from .views import (
    ConversationMessagesAPIView,
    MyConversationListAPIView,
    MyProfileAPIView,
    StartConversationAPIView,
    SubjectListAPIView,
    TutorServiceDetailAPIView,
    TutorServiceListCreateAPIView,
    TutorStatusAPIView,
    UserSearchAPIView,
    SignupAPIView,
    LoginAPIView,
    MeAPIView,


)

urlpatterns = [
    path('auth/signup/', SignupAPIView.as_view(), name='auth-signup'),
    path('subjects/', SubjectListAPIView.as_view(), name='subject-list'),
    path('services/', TutorServiceListCreateAPIView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', TutorServiceDetailAPIView.as_view(), name='service-detail'),
    path('profile/me/', MyProfileAPIView.as_view(), name='my-profile'),
    path('profile/tutor-status/', TutorStatusAPIView.as_view(), name='tutor-status'),
    path('users/search/', UserSearchAPIView.as_view(), name='user-search'),
    path('conversations/', MyConversationListAPIView.as_view(), name='conversation-list'),
    path('conversations/start/', StartConversationAPIView.as_view(), name='conversation-start'),
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesAPIView.as_view(), name='conversation-messages'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('auth/me/', MeAPIView.as_view(), name='auth-me'),


]
