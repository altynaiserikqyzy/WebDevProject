from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Conversation, ConversationParticipant, Message, Profile, Subject, TutorService


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']

    def get_full_name(self, obj):
        return getattr(getattr(obj, 'profile', None), 'full_name', '') or obj.username

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'full_name',
            'bio',
            'major',
            'study_year',
            'avatar',
            'is_tutor',
        ]

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class TutorServiceSerializer(serializers.ModelSerializer):
    tutor = ProfileSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=False,
        allow_null=True,
    )
    subject_name = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = TutorService
        fields = [
            'id',
            'tutor',
            'subject',
            'subject_id',
            'subject_name',
            'title',
            'description',
            'price_per_hour',
            'format',
            'is_active',
            'created_at',
        ]

    def validate(self, attrs):
        subject = attrs.get('subject')
        subject_name = self.initial_data.get('subject_name', '')

        if not subject and not str(subject_name).strip():
            raise serializers.ValidationError({'subject_name': 'Select a subject or enter one manually.'})

        return attrs

    def create(self, validated_data):
        subject_name = str(validated_data.pop('subject_name', self.initial_data.get('subject_name', ''))).strip()
        subject = validated_data.get('subject')

        if subject is None:
            subject, _ = Subject.objects.get_or_create(name=subject_name)
            validated_data['subject'] = subject

        return super().create(validated_data)

class ConversationParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ConversationParticipant
        fields = ['id', 'user', 'joined_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'text', 'created_at']
        read_only_fields = ['sender', 'created_at', 'conversation']


class ConversationSerializer(serializers.ModelSerializer):
    participants = ConversationParticipantSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if not last_message:
            return None
        return MessageSerializer(last_message).data
class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    full_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    def validate_email(self, value):
        if not value.endswith('@kbtu.kz'):
            raise serializers.ValidationError('Only KBTU email addresses are allowed.')
        return value
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
