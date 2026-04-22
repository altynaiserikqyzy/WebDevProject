
from django.conf import settings
from django.db import models


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


