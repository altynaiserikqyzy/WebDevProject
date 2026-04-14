from django.conf import settings
from django.db import models


class TutorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='tutor_photos/', blank=True, null=True)
    study_year = models.IntegerField(blank=True, null=True, help_text='Year of study (1-4)')
    course = models.CharField(max_length=100, blank=True, help_text='Course/major')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    google_meet_link = models.URLField(blank=True, help_text='Google Meet link for online sessions')

    def __str__(self) -> str:
        return f"TutorProfile({self.user.username})"

    def update_rating(self):
        reviews = self.reviews.all()
        if reviews:
            self.rating = sum(r.rating for r in reviews) / len(reviews)
            self.total_reviews = len(reviews)
        else:
            self.rating = 0.0
            self.total_reviews = 0
        self.save()


class Subject(models.Model):
    name = models.CharField(max_length=120, unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Emoji or icon for the subject')

    def __str__(self) -> str:
        return self.name


class TutoringServiceQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)


class TutoringService(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='services')
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name='services')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    format = models.CharField(max_length=50, default='online')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TutoringServiceQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{self.title} ({self.subject.name})"


class Booking(models.Model):
    service = models.ForeignKey(TutoringService, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    scheduled_for = models.DateTimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='planned')
    number_of_sessions = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    event_color = models.CharField(max_length=7, default='#8b5cf6', help_text='Hex color for calendar')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.total_price and self.service:
            self.total_price = self.service.price_per_hour * self.number_of_sessions
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Booking({self.student.username} -> {self.service.title})"


class ChatMessage(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"ChatMessage({self.sender.username}, booking_id={self.booking_id})"


class Review(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(help_text='Rating from 1 to 5')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['tutor', 'reviewer']

    def __str__(self) -> str:
        return f"Review({self.reviewer.username} -> {self.tutor.user.username}, {self.rating}/5)"


class TutorAvailability(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='availabilities')
    weekday = models.IntegerField(help_text='0=Monday, 6=Sunday')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['tutor', 'weekday', 'start_time']

    def __str__(self) -> str:
        return f"{self.tutor.user.username} - {self.get_weekday_display()}"
