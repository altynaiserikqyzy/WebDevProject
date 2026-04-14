import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Subject, TutorProfile

User = get_user_model()

# Create test user if it doesn't exist
if not User.objects.filter(username='testuser').exists():
    user = User.objects.create_user(username='testuser', password='testpass123')
    print(f"Created test user: {user.username}")
else:
    user = User.objects.get(username='testuser')
    print(f"Test user already exists: {user.username}")

# Create tutor profile
tutor_profile, created = TutorProfile.objects.get_or_create(user=user, defaults={'bio': 'Experienced tutor'})
if created:
    print(f"Created tutor profile for {user.username}")
else:
    print(f"Tutor profile already exists for {user.username}")

# Create some sample subjects
subjects = ['Mathematics', 'Physics', 'Programming', 'Chemistry', 'English']
for name in subjects:
    Subject.objects.get_or_create(name=name)

print(f"Created/verified {len(subjects)} subjects")

print("\nTest credentials:")
print("Username: testuser")
print("Password: testpass123")
