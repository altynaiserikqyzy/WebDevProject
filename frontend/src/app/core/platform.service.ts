import { Injectable, computed, signal } from '@angular/core';

import { Booking, Review, Subject, TutorProfile, TutorService } from './models';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly subjects = signal<Subject[]>([
    { id: 1, name: 'Calculus |', icon: '∫' },
    { id: 2, name: 'Linear Algebra for Engineers', icon: 'A' },
    { id: 3, name: 'Theoretical Mechanics', icon: 'F' },
    { id: 4, name: 'Programming Principles |', icon: '</>' },
    { id: 5, name: 'Statistics', icon: 'σ' },
    { id: 6, name: 'Accounting', icon: '$' }
  ]);

  readonly tutors = signal<TutorProfile[]>([
    {
      id: 1,
      name: 'Dias Nurbolov',
      quote: 'I make hard math feel simple.',
      bio: '4th year student mentoring Calculus and Linear Algebra for two years.',
      avatar: 'https://i.pravatar.cc/160?img=12',
      studyYear: 4,
      major: 'Mathematics in Economics',
      rating: 4.9,
      reviewsCount: 67,
      responseSpeed: 'Replies in 10 min',
      languages: ['English', 'Kazakh', 'Russian'],
      formats: ['online', 'offline'],
      service: {
        id: 201,
        subjectId: 1,
        title: 'Calculus Crash Prep',
        description: 'Weekly practice, exam drills and personal weak-point plan.',
        pricePerHour: 7000,
        format: 'both',
        teachingStyle: 'Problem-driven and concise.'
      },
      availability: ['Mon 18:00', 'Wed 20:00', 'Fri 17:00']
    },
    {
      id: 2,
      name: 'Aigerim Omarova',
      quote: 'Programming with confidence.',
      bio: 'Software engineering student helping first-years in C++, Python, and algorithms.',
      avatar: 'https://i.pravatar.cc/160?img=32',
      studyYear: 3,
      major: 'Software Engineering',
      rating: 4.8,
      reviewsCount: 41,
      responseSpeed: 'Replies in 20 min',
      languages: ['English', 'Russian'],
      formats: ['online'],
      service: {
        id: 202,
        subjectId: 4,
        title: 'Programming Fundamentals',
        description: 'Hands-on coding with clean explanations and mini projects.',
        pricePerHour: 8000,
        format: 'online',
        teachingStyle: 'Practice-first with live feedback.'
      },
      availability: ['Tue 19:00', 'Thu 18:00', 'Sat 12:00']
    }
  ]);

  readonly reviews = signal<Review[]>([
    { id: 1, studentName: 'Madi', rating: 5, date: '2026-03-02', comment: 'Super clear explanations before midterm.' },
    { id: 2, studentName: 'Nazerke', rating: 5, date: '2026-03-18', comment: 'Finally understood matrices and passed confidently.' }
  ]);

  readonly bookings = signal<Booking[]>([
    {
      id: 1,
      tutorId: 1,
      subjectName: 'Calculus',
      date: '2026-04-19',
      time: '18:00',
      format: 'online',
      sessionsCount: 2,
      totalPrice: 14000,
      status: 'confirmed',
      eventColor: '#8b5cf6',
      meetLink: 'https://meet.google.com/nrt-kbtu-calc'
    }
  ]);

  readonly upcomingSessions = computed(() => this.bookings().filter((booking) => booking.status !== 'cancelled'));

  addBooking(booking: Omit<Booking, 'id' | 'status'>) {
    this.bookings.update((items) => [...items, { id: Date.now(), status: 'pending', ...booking }]);
  }

  addTutorService(service: TutorService) {
    this.tutors.update((items) => [
      ...items,
      {
        id: Date.now(),
        name: 'You',
        quote: service.title,
        bio: service.description,
        avatar: 'https://i.pravatar.cc/160?img=9',
        studyYear: 3,
        major: 'Information Systems',
        rating: 5,
        reviewsCount: 0,
        responseSpeed: 'New tutor',
        languages: ['English', 'Russian'],
        formats: service.format === 'both' ? ['online', 'offline'] : [service.format],
        service,
        availability: ['Mon 19:00', 'Thu 19:00']
      }
    ]);
  }

}
