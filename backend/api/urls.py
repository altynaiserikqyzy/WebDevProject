from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    BookingViewSet,
    MyProfileAPIView,
    SubjectListAPIView,
    TutorServiceDetailAPIView,
    TutorServiceListCreateAPIView,
    TutorStatusAPIView,
    SignupAPIView,
    LoginAPIView,
    MeAPIView,
    MyServicesAPIView,
    TutorProfileDetailAPIView,
    TutorProfileListAPIView,
    TutorServiceSlotCreateAPIView,


)

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('auth/signup/', SignupAPIView.as_view(), name='auth-signup'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('subjects/', SubjectListAPIView.as_view(), name='subject-list'),
    path('services/', TutorServiceListCreateAPIView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', TutorServiceDetailAPIView.as_view(), name='service-detail'),
    path('services/<int:pk>/slots/', TutorServiceSlotCreateAPIView.as_view(), name='service-slot-create'),
    path('tutor-services/', TutorServiceListCreateAPIView.as_view(), name='tutor-service-list-create'),
    path('tutor-services/<int:pk>/', TutorServiceDetailAPIView.as_view(), name='tutor-service-detail'),
    path('tutor-services/<int:pk>/slots/', TutorServiceSlotCreateAPIView.as_view(), name='tutor-service-slot-create'),
    path('my-tutor-services/', MyServicesAPIView.as_view(), name='my-tutor-services'),
    path('profile/me/', MyProfileAPIView.as_view(), name='my-profile'),
    path('profile/tutor-status/', TutorStatusAPIView.as_view(), name='tutor-status'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('auth/me/', MeAPIView.as_view(), name='auth-me'),
    path('profile/create-service/' , TutorServiceListCreateAPIView.as_view() , name='service-create'),
    path('services/my/', MyServicesAPIView.as_view()),
    path('tutors/', TutorProfileListAPIView.as_view(), name='tutor-list'),
    path('tutors/<int:pk>/', TutorProfileDetailAPIView.as_view(), name='tutor-detail'),

]

urlpatterns += router.urls
