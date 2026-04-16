
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

    def __str__(self):
        return f'{self.title} - {self.tutor.full_name}'


class Conversation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Conversation #{self.id}'


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_participations'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f'{self.user.username} in chat {self.conversation_id}'


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender.username} in chat {self.conversation_id}'
