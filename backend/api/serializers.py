from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Booking, ChatMessage, Review, Subject, TutorAvailability, TutorProfile, TutoringService


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'icon']


class TutoringServiceSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source='tutor.user.username', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    tutor_photo = serializers.ImageField(source='tutor.photo', read_only=True)
    tutor_rating = serializers.DecimalField(source='tutor.rating', read_only=True, max_digits=3, decimal_places=2)
    tutor_study_year = serializers.IntegerField(source='tutor.study_year', read_only=True)

    class Meta:
        model = TutoringService
        fields = [
            'id',
            'tutor',
            'tutor_username',
            'tutor_photo',
            'tutor_rating',
            'tutor_study_year',
            'subject',
            'subject_name',
            'title',
            'description',
            'price_per_hour',
            'format',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['tutor', 'created_at']


class TutorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    photo = serializers.ImageField(read_only=True)

    class Meta:
        model = TutorProfile
        fields = ['id', 'username', 'bio', 'photo', 'study_year', 'course', 'rating', 'total_reviews', 'google_meet_link']


class TutorProfileDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    photo = serializers.ImageField(read_only=True)
    services = TutoringServiceSerializer(many=True, read_only=True)

    class Meta:
        model = TutorProfile
        fields = ['id', 'username', 'bio', 'photo', 'study_year', 'course', 'rating', 'total_reviews', 'google_meet_link', 'services']


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    tutor_username = serializers.CharField(source='service.tutor.user.username', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'service',
            'service_title',
            'student',
            'student_username',
            'tutor_username',
            'scheduled_for',
            'notes',
            'status',
            'number_of_sessions',
            'total_price',
            'event_color',
            'created_at',
        ]
        read_only_fields = ['student', 'created_at', 'status', 'total_price']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'booking', 'sender', 'sender_username', 'text', 'created_at']
        read_only_fields = ['sender', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'tutor', 'reviewer', 'reviewer_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['reviewer', 'created_at']


class TutorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorAvailability
        fields = ['id', 'tutor', 'weekday', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['tutor']
