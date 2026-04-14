import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing-page',
  imports: [RouterLink],
  template: `
    <section class="section-wrap grid items-center gap-10 md:grid-cols-2">
      <div class="space-y-6">
        <p class="inline-flex rounded-full border border-brand-300/30 bg-brand-500/15 px-3 py-1 text-sm text-brand-100">KBTU tutoring marketplace</p>
        <h1 class="text-4xl font-bold leading-tight md:text-6xl">NoRetake KBTU helps you <span class="text-brand-300">learn smarter</span>.</h1>
        <p class="max-w-xl text-slate-300">Find trusted tutors from the KBTU community, book sessions that fit your schedule, and turn difficult courses into confident grades.</p>
        <div class="flex flex-wrap gap-3">
          <a routerLink="/auth" class="btn-primary">Start Learning Today</a>
          <a routerLink="/tutors" class="btn-secondary">Find Tutors</a>
        </div>
      </div>
      <div class="glass p-8">
        <div class="grid gap-4 md:grid-cols-2">
          <article class="rounded-xl bg-slate-900/80 p-4">
            <h3 class="font-semibold text-white">Find Tutors</h3>
            <p class="mt-1 text-sm text-slate-300">Discover by subject, rating and format.</p>
          </article>
          <article class="rounded-xl bg-slate-900/80 p-4">
            <h3 class="font-semibold text-white">Chat & Communicate</h3>
            <p class="mt-1 text-sm text-slate-300">Message tutors before booking.</p>
          </article>
          <article class="rounded-xl bg-slate-900/80 p-4">
            <h3 class="font-semibold text-white">Book Sessions</h3>
            <p class="mt-1 text-sm text-slate-300">Plan one-time or recurring lessons.</p>
          </article>
          <article class="rounded-xl bg-slate-900/80 p-4">
            <h3 class="font-semibold text-white">Become a Tutor</h3>
            <p class="mt-1 text-sm text-slate-300">Share knowledge and earn income.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="section-wrap">
      <h2 class="text-2xl font-bold text-white md:text-3xl">Student testimonials</h2>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        @for (text of testimonials; track text.name) {
          <article class="glass p-5">
            <p class="text-slate-200">"{{ text.comment }}"</p>
            <p class="mt-4 text-sm text-brand-200">{{ text.name }} · {{ text.faculty }}</p>
          </article>
        }
      </div>
    </section>
    <section class="section-wrap">
      <div class="rounded-3xl border border-brand-200/25 bg-gradient-to-r from-brand-700/40 to-brand-500/30 p-8 text-center">
        <h3 class="text-3xl font-bold text-white">Ready to improve your grades?</h3>
        <p class="mx-auto mt-2 max-w-2xl text-slate-200">Join thousands of KBTU students who are already using NoRetake.</p>
        <a routerLink="/auth" class="btn-primary mt-5 inline-flex">Start Learning Today</a>
      </div>
    </section>
  `
})
export class LandingPage {
  readonly testimonials = [
    { name: 'Amina K.', faculty: 'FIT', comment: 'My calculus score jumped from C to A- in 4 weeks.' },
    { name: 'Yernar T.', faculty: 'BS', comment: 'Flexible scheduling before finals saved my semester.' },
    { name: 'Dana S.', faculty: 'ISE', comment: 'The chat flow is smooth and tutors are super responsive.' }
  ];
}
