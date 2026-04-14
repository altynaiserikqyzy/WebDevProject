from django.contrib import admin

from .models import Booking, ChatMessage, Review, Subject, TutorAvailability, TutorProfile, TutoringService

admin.site.register(TutorProfile)
admin.site.register(Subject)
admin.site.register(TutoringService)
admin.site.register(Booking)
admin.site.register(ChatMessage)
admin.site.register(Review)
admin.site.register(TutorAvailability)
