from datetime import datetime

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Booking, Profile, Subject, TutorAvailabilitySlot, TutorReview, TutorService


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

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.avatar and instance.avatar.name.startswith(('http://', 'https://')):
            data['avatar'] = instance.avatar.name

        return data

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']


class TutorAvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorAvailabilitySlot
        fields = [
            'id',
            'date',
            'start_time',
            'end_time',
            'format',
            'is_booked',
            'created_at',
        ]
        read_only_fields = ['id', 'is_booked', 'created_at']

    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({'end_time': 'End time must be later than start time.'})
        return attrs


class TutorAvailabilitySlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorAvailabilitySlot
        fields = ['id', 'date', 'start_time', 'end_time', 'format']
        read_only_fields = ['id']

    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({'end_time': 'End time must be later than start time.'})
        return attrs


class TutorReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorReview
        fields = ['id', 'reviewer_name', 'reviewer_major', 'rating', 'comment', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class TutorServiceSerializer(serializers.ModelSerializer):
    tutor = ProfileSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_name = serializers.SerializerMethodField(read_only=True)
    service_title = serializers.CharField(source='title', required=False, allow_blank=False)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=True,
    )
    slots = TutorAvailabilitySlotCreateSerializer(many=True, write_only=True, required=False)
    availability_slots = TutorAvailabilitySlotSerializer(many=True, source='slots', read_only=True)

    class Meta:
        model = TutorService
        fields = [
            'id',
            'tutor',
            'subject',
            'subject_name',
            'subject_id',
            'service_title',
            'title',
            'description',
            'price_per_hour',
            'format',
            'is_active',
            'created_at',
            'updated_at',
            'availability_slots',
            'slots',
        ]
        read_only_fields = ['id', 'tutor', 'subject', 'title', 'created_at', 'updated_at', 'availability_slots']

    def validate(self, attrs):
        title = attrs.get('title')
        if not title:
            legacy_title = str(self.initial_data.get('title', '')).strip()
            if legacy_title:
                attrs['title'] = legacy_title
            else:
                raise serializers.ValidationError({'service_title': 'Service title is required.'})

        price_per_hour = attrs.get('price_per_hour')
        if price_per_hour is not None and price_per_hour <= 0:
            raise serializers.ValidationError({'price_per_hour': 'Price per hour must be greater than 0.'})

        slots = attrs.get('slots', [])
        if slots:
            keys = set()
            for slot_data in slots:
                key = (
                    slot_data['date'],
                    slot_data['start_time'],
                    slot_data['end_time'],
                    slot_data['format'],
                )
                if key in keys:
                    raise serializers.ValidationError({'slots': 'Duplicate slots are not allowed for one service.'})
                keys.add(key)
        return attrs

    def get_subject_name(self, obj):
        return obj.subject.name

    def create(self, validated_data):
        slots_data = validated_data.pop('slots', [])
        with transaction.atomic():
            service = super().create(validated_data)
            if slots_data:
                TutorAvailabilitySlot.objects.bulk_create(
                    [TutorAvailabilitySlot(tutor_service=service, **slot_data) for slot_data in slots_data]
                )
        return service



class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    full_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError('Username is required.')
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError('Username already exists.')
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if not email.endswith('@kbtu.kz'):
            raise serializers.ValidationError('Only KBTU email addresses are allowed.')
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Email already exists.')
        return email

    def create(self, validated_data):
        with transaction.atomic():
            user = User(
                username=validated_data['username'],
                email=validated_data['email'],
            )
            user.set_password(validated_data['password'])
            user.save()

            Profile.objects.create(
                user=user,
                full_name=validated_data['full_name'].strip() or user.username,
            )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if not email.endswith('@kbtu.kz'):
            raise serializers.ValidationError('Use your KBTU email (@kbtu.kz).')
        return email


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    service_title = serializers.CharField(source='service.title', read_only=True)
    allowed_actions = serializers.SerializerMethodField()
    cancellation_deadline_at = serializers.DateTimeField(read_only=True)
    can_payment_be_initiated = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'status',
            'student_name',
            'teacher_name',
            'subject_name',
            'service_title',
            'scheduled_start_at',
            'scheduled_end_at',
            'format',
            'number_of_sessions',
            'total_price',
            'meet_link',
            'cancelled_by',
            'cancel_reason',
            'rejection_reason',
            'no_show_marked_by',
            'no_show_marked_at',
            'completed_at',
            'status_changed_by',
            'status_changed_at',
            'cancellation_deadline_at',
            'allowed_actions',
            'can_payment_be_initiated',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        profile = getattr(obj.student, 'profile', None)
        return (getattr(profile, 'full_name', '') or obj.student.username) if obj.student_id else 'Student'

    def get_teacher_name(self, obj):
        return obj.tutor.full_name if obj.tutor_id else 'Tutor'

    def get_subject_name(self, obj):
        return obj.service.subject.name if obj.service_id else ''

    def get_allowed_actions(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return obj.allowed_actions_for(user, at_time=timezone.now())

    def get_can_payment_be_initiated(self, obj):
        return obj.payment_ready


class BookingCreateSerializer(serializers.Serializer):
    service_id = serializers.IntegerField(required=True)
    slot_id = serializers.IntegerField(required=True)

    def validate(self, attrs):
        request = self.context['request']
        service_id = attrs['service_id']
        slot_id = attrs['slot_id']

        try:
            service = (
                TutorService.objects
                .select_related('tutor__user', 'subject')
                .get(id=service_id, is_active=True)
            )
        except TutorService.DoesNotExist:
            raise serializers.ValidationError({'service_id': 'Service not found or inactive.'})

        if service.tutor.user_id == request.user.id:
            raise serializers.ValidationError({'service_id': 'You cannot book your own service.'})

        try:
            slot = TutorAvailabilitySlot.objects.select_related('tutor_service').get(
                id=slot_id,
                tutor_service_id=service.id
            )
        except TutorAvailabilitySlot.DoesNotExist:
            raise serializers.ValidationError({'slot_id': 'Selected slot does not belong to this service.'})

        if slot.is_booked:
            raise serializers.ValidationError({'slot_id': 'This slot is already booked.'})

        scheduled_start = timezone.make_aware(datetime.combine(slot.date, slot.start_time))
        scheduled_end = timezone.make_aware(datetime.combine(slot.date, slot.end_time))
        if scheduled_start >= scheduled_end:
            raise serializers.ValidationError({'slot_id': 'Slot has invalid time range.'})
        if scheduled_start <= timezone.now():
            raise serializers.ValidationError({'slot_id': 'Cannot book a slot in the past.'})

        attrs['service'] = service
        attrs['slot'] = slot
        attrs['scheduled_start_at'] = scheduled_start
        attrs['scheduled_end_at'] = scheduled_end
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        service = validated_data['service']
        slot_id = validated_data['slot'].id

        with transaction.atomic():
            slot = TutorAvailabilitySlot.objects.select_for_update().get(id=slot_id)
            if slot.is_booked:
                raise serializers.ValidationError({'slot_id': 'This slot was booked by another user.'})

            slot.is_booked = True
            slot.save(update_fields=['is_booked'])

            booking = Booking.objects.create(
                student=request.user,
                tutor=service.tutor,
                service=service,
                slot=slot,
                status=Booking.STATUS_PENDING,
                scheduled_start_at=validated_data['scheduled_start_at'],
                scheduled_end_at=validated_data['scheduled_end_at'],
                format=slot.format if slot.format in dict(Booking.FORMAT_CHOICES) else Booking.FORMAT_ONLINE,
                number_of_sessions=1,
                total_price=service.price_per_hour,
                meet_link='',
                status_changed_by=request.user,
                status_changed_at=timezone.now(),
            )
        return booking


class BookingReasonSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)
