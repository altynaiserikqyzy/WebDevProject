from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BookingListCreateAPIView,
    ChatMessageListCreateAPIView,
    MeAPIView,
    ReviewListCreateAPIView,
    SubjectViewSet,
    TutorAvailabilityListCreateAPIView,
    TutorProfileDetailView,
    TutoringServiceViewSet,
    login_view,
    logout_view,
)

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'services', TutoringServiceViewSet, basename='service')

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', MeAPIView.as_view(), name='me'),
    path('tutors/<int:profile_id>/', TutorProfileDetailView.as_view(), name='tutor-detail'),
    path('tutors/<int:tutor_id>/reviews/', ReviewListCreateAPIView.as_view(), name='tutor-reviews'),
    path('tutors/<int:tutor_id>/availability/', TutorAvailabilityListCreateAPIView.as_view(), name='tutor-availability'),
    path('bookings/', BookingListCreateAPIView.as_view(), name='bookings'),
    path('bookings/<int:booking_id>/messages/', ChatMessageListCreateAPIView.as_view(), name='messages'),
    path('', include(router.urls)),
]
