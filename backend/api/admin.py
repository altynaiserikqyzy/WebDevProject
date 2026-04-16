from django.contrib import admin

from .models import Conversation, ConversationParticipant, Message, Profile, Subject, TutorService

admin.site.register(Profile)
admin.site.register(Subject)
admin.site.register(TutorService)
admin.site.register(Conversation)
admin.site.register(ConversationParticipant)
admin.site.register(Message)
