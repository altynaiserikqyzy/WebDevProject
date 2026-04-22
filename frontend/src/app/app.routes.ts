import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.page').then((m) => m.LandingPage), title: 'NoRetake KBTU' },
  { path: 'auth', loadComponent: () => import('./features/auth/auth.page').then((m) => m.AuthPage), title: 'Auth' },
  { path: 'explore', canActivate: [authGuard], loadComponent: () => import('./features/explore/explore.page').then((m) => m.ExplorePage), title: 'Explore' },
  { path: 'tutors', canActivate: [authGuard], loadComponent: () => import('./features/tutors/tutors.page').then((m) => m.TutorsPage), title: 'Tutors' },
  { path: 'tutor/:id', redirectTo: 'tutors/:id', pathMatch: 'full' },
  { path: 'tutors/:id', canActivate: [authGuard], loadComponent: () => import('./features/tutor-detail/tutor-detail.page').then((m) => m.TutorDetailPage), title: 'Tutor profile' },
  { path: 'booking', canActivate: [authGuard], loadComponent: () => import('./features/booking/booking.page').then((m) => m.BookingPage), title: 'Booking' },
  { path: 'calendar', canActivate: [authGuard], loadComponent: () => import('./features/calendar/calendar.page').then((m) => m.CalendarPage), title: 'Calendar' },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage), title: 'Profile' },
  { path: 'profile/create-service', canActivate: [authGuard], loadComponent: () => import('./features/profile/create-service.page').then((m) => m.CreateServicePage), title: 'Create service' },
  { path: '**', redirectTo: '' }
];
