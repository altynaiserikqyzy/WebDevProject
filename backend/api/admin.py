from django.contrib import admin

from .models import Profile, Subject, TutorAvailabilitySlot, TutorReview, TutorService

admin.site.register(Profile)
admin.site.register(Subject)
admin.site.register(TutorService)
admin.site.register(TutorAvailabilitySlot)
admin.site.register(TutorReview)
