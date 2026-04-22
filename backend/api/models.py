from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    full_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    major = models.CharField(max_length=255, blank=True)
    study_year = models.PositiveIntegerField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_tutor = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name or self.user.username


class Subject(models.Model):
    name = models.CharField(max_length=120, unique=True)

    def __str__(self):
        return self.name


class TutorService(models.Model):
    FORMAT_ONLINE = 'online'
    FORMAT_OFFLINE = 'offline'
    FORMAT_BOTH = 'both'

    FORMAT_CHOICES = [
        (FORMAT_ONLINE, 'Online'),
        (FORMAT_OFFLINE, 'Offline'),
        (FORMAT_BOTH, 'Both'),
    ]

    tutor = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='services'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name='services'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default=FORMAT_ONLINE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} - {self.tutor.full_name}'


class TutorAvailabilitySlot(models.Model):
    FORMAT_ONLINE = 'online'
    FORMAT_OFFLINE = 'offline'
    FORMAT_BOTH = 'both'

    FORMAT_CHOICES = [
        (FORMAT_ONLINE, 'Online'),
        (FORMAT_OFFLINE, 'Offline'),
        (FORMAT_BOTH, 'Both'),
    ]

    tutor_service = models.ForeignKey(
        TutorService,
        on_delete=models.CASCADE,
        related_name='slots'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default=FORMAT_ONLINE)
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['tutor_service', 'date', 'start_time', 'end_time', 'format'],
                name='unique_tutor_service_slot'
            )
        ]

    def __str__(self):
        return f'{self.tutor_service_id}: {self.date} {self.start_time}-{self.end_time}'


class TutorReview(models.Model):
    tutor = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer_name = models.CharField(max_length=255)
    reviewer_major = models.CharField(max_length=255, blank=True)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reviewer_name} -> {self.tutor_id} ({self.rating})'


class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'
    STATUS_NO_SHOW = 'no_show'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_NO_SHOW, 'No Show'),
    ]

    FINAL_STATUSES = {STATUS_REJECTED, STATUS_CANCELLED, STATUS_COMPLETED, STATUS_NO_SHOW}

    FORMAT_ONLINE = 'online'
    FORMAT_OFFLINE = 'offline'
    FORMAT_BOTH = 'both'
    FORMAT_CHOICES = [
        (FORMAT_ONLINE, 'Online'),
        (FORMAT_OFFLINE, 'Offline'),
        (FORMAT_BOTH, 'Both'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_bookings',
    )
    tutor = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='received_bookings',
    )
    service = models.ForeignKey(
        TutorService,
        on_delete=models.PROTECT,
        related_name='bookings',
    )
    slot = models.ForeignKey(
        TutorAvailabilitySlot,
        on_delete=models.SET_NULL,
        related_name='bookings',
        null=True,
        blank=True,
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    scheduled_start_at = models.DateTimeField()
    scheduled_end_at = models.DateTimeField()
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default=FORMAT_ONLINE)

    number_of_sessions = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    meet_link = models.URLField(blank=True)

    status_changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booking_status_changes',
    )
    status_changed_at = models.DateTimeField(null=True, blank=True)

    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_bookings',
    )
    cancel_reason = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)

    no_show_marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='no_show_bookings_marked',
    )
    no_show_marked_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_start_at', '-id']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_start_at']),
        ]

    def __str__(self):
        return f'Booking #{self.id} ({self.status})'

    @property
    def cancellation_window_hours(self):
        return int(getattr(settings, 'BOOKING_CANCELLATION_WINDOW_HOURS', 6))

    @property
    def no_show_grace_minutes(self):
        return int(getattr(settings, 'BOOKING_NO_SHOW_GRACE_MINUTES', 15))

    @property
    def cancellation_deadline_at(self):
        return self.scheduled_start_at - timedelta(hours=self.cancellation_window_hours)

    @property
    def payment_ready(self):
        # Placeholder for future payment integration.
        return self.status == self.STATUS_COMPLETED

    def is_final(self):
        return self.status in self.FINAL_STATUSES

    def is_student(self, user):
        return bool(user and user.is_authenticated and self.student_id == user.id)

    def is_tutor(self, user):
        return bool(user and user.is_authenticated and self.tutor.user_id == user.id)

    def can_confirm(self, user):
        return self.status == self.STATUS_PENDING and self.is_tutor(user)

    def can_reject(self, user):
        return self.status == self.STATUS_PENDING and self.is_tutor(user)

    def can_cancel(self, user, at_time=None):
        now = at_time or timezone.now()
        if self.status == self.STATUS_PENDING:
            return self.is_student(user)
        if self.status != self.STATUS_CONFIRMED:
            return False
        if not (self.is_student(user) or self.is_tutor(user)):
            return False
        return now <= self.cancellation_deadline_at

    def can_complete(self, user, at_time=None):
        now = at_time or timezone.now()
        return self.status == self.STATUS_CONFIRMED and self.is_tutor(user) and now >= self.scheduled_end_at

    def can_no_show(self, user, at_time=None):
        now = at_time or timezone.now()
        no_show_available_at = self.scheduled_start_at + timedelta(minutes=self.no_show_grace_minutes)
        return self.status == self.STATUS_CONFIRMED and self.is_tutor(user) and now >= no_show_available_at

    def allowed_actions_for(self, user, at_time=None):
        actions = []
        if self.can_confirm(user):
            actions.append('confirm')
        if self.can_reject(user):
            actions.append('reject')
        if self.can_cancel(user, at_time=at_time):
            actions.append('cancel')
        if self.can_complete(user, at_time=at_time):
            actions.append('complete')
        if self.can_no_show(user, at_time=at_time):
            actions.append('no_show')
        return actions

    def _assert_not_final(self):
        if self.is_final():
            raise ValidationError('No transitions are allowed from final statuses.')

    def _set_status(self, new_status, actor):
        self.status = new_status
        self.status_changed_by = actor
        self.status_changed_at = timezone.now()

    def _release_slot_if_needed(self):
        if self.slot_id and self.slot and self.slot.is_booked:
            self.slot.is_booked = False
            self.slot.save(update_fields=['is_booked'])

    def confirm(self, actor):
        self._assert_not_final()
        if not self.can_confirm(actor):
            raise ValidationError('Only tutor can confirm a pending booking.')
        self._set_status(self.STATUS_CONFIRMED, actor)
        self.save(update_fields=['status', 'status_changed_by', 'status_changed_at', 'updated_at'])

    def reject(self, actor, reason=''):
        self._assert_not_final()
        if not self.can_reject(actor):
            raise ValidationError('Only tutor can reject a pending booking.')
        self.rejection_reason = (reason or '').strip()
        self._set_status(self.STATUS_REJECTED, actor)
        self.save(
            update_fields=['status', 'rejection_reason', 'status_changed_by', 'status_changed_at', 'updated_at']
        )
        self._release_slot_if_needed()

    def cancel(self, actor, reason=''):
        self._assert_not_final()
        now = timezone.now()
        if not self.can_cancel(actor, at_time=now):
            raise ValidationError('Cancellation is not allowed due to role or cancellation deadline.')
        self.cancelled_by = actor
        self.cancel_reason = (reason or '').strip()
        self._set_status(self.STATUS_CANCELLED, actor)
        self.save(
            update_fields=[
                'status',
                'cancelled_by',
                'cancel_reason',
                'status_changed_by',
                'status_changed_at',
                'updated_at',
            ]
        )
        self._release_slot_if_needed()

    def complete(self, actor):
        self._assert_not_final()
        if not self.can_complete(actor):
            raise ValidationError('Booking can be marked completed only by tutor after lesson end.')
        self.completed_at = timezone.now()
        self._set_status(self.STATUS_COMPLETED, actor)
        self.save(
            update_fields=['status', 'completed_at', 'status_changed_by', 'status_changed_at', 'updated_at']
        )

    def mark_no_show(self, actor):
        self._assert_not_final()
        if not self.can_no_show(actor):
            raise ValidationError('No-show can be marked only after grace period by tutor.')
        self.no_show_marked_by = actor
        self.no_show_marked_at = timezone.now()
        self._set_status(self.STATUS_NO_SHOW, actor)
        self.save(
            update_fields=[
                'status',
                'no_show_marked_by',
                'no_show_marked_at',
                'status_changed_by',
                'status_changed_at',
                'updated_at',
            ]
        )


