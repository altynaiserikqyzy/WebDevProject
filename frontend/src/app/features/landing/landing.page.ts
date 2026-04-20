import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing-page',
  imports: [RouterLink],
  template: `
    <section class="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#010722] via-[#020b2b] to-[#140d3d]">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_66%_43%,rgba(139,92,246,0.34),transparent_36%)]"></div>
      <div class="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1280px] items-center px-5 py-8 md:px-10 md:py-10">
        <div class="grid w-full items-center gap-8 lg:grid-cols-[1fr_1.12fr]">
          <div class="flex flex-col justify-center space-y-6">
            <p class="inline-flex w-fit rounded-full border border-brand-300/30 bg-brand-500/15 px-3 py-1 text-sm text-brand-100">
              KBTU tutoring marketplace
            </p>
            <h1 class="max-w-[560px] text-5xl font-bold leading-[1.08] md:text-6xl">
              NoRetake KBTU helps you learn smarter.
            </h1>
            <p class="max-w-xl text-lg text-slate-300">
              Find trusted tutors from the KBTU community, book sessions that fit your schedule, and turn difficult
              courses into confident grades.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/auth" class="btn-primary">Start Learning Today</a>
              <a routerLink="/tutors" class="btn-secondary">Find Tutors</a>
            </div>
          </div>
          <div class="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/70 p-2 shadow-[0_0_70px_rgba(99,102,241,0.35)]">
            <div class="relative overflow-hidden rounded-[1.5rem]">
              <img
                src="/buzz-hero.png"
                alt="Buzz Lightyear with quote good things happen when you try."
                class="h-[320px] w-full object-cover object-center md:h-[420px] lg:h-[500px]"
              />
              <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 via-slate-950/35 to-transparent"></div>
              <p class="absolute bottom-4 left-4 text-sm text-slate-100/90">Stay consistent. Keep trying</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-wrap pt-2 md:pt-4">
      <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <article class="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/70 p-3 shadow-[0_24px_60px_rgba(2,8,28,0.55)]">
          <img
            src="/meme-photo.png"
            alt="NoRetake KBTU meme poster"
            class="h-full max-h-[720px] w-full rounded-2xl object-cover object-center"
          />
          <div class="pointer-events-none absolute inset-x-3 bottom-3 h-24 rounded-b-2xl bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-transparent"></div>
        </article>

        <div>
          <div class="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p class="text-sm uppercase tracking-[0.18em] text-brand-200/80">Platform features</p>
            <h2 class="mt-2 text-2xl font-bold text-white md:text-4xl">Everything you need for exam-season confidence</h2>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            @for (feature of features; track feature.title) {
              <article class="glass rounded-2xl p-5 shadow-lg shadow-slate-950/35 transition duration-300 hover:-translate-y-1 hover:border-brand-300/30">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-300/35 bg-brand-500/20 text-sm font-semibold text-brand-100">
                  {{ feature.badge }}
                </div>
                <h3 class="mt-3 text-lg font-semibold text-white">{{ feature.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-300">{{ feature.text }}</p>
              </article>
            }
          </div>
        </div>
      </div>
    </section>

    <section class="section-wrap">
      <h2 class="text-2xl font-bold text-white md:text-3xl">Student testimonials</h2>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        @for (text of testimonials; track text.name) {
          <article class="glass p-5">
            <p class="text-slate-200">"{{ text.comment }}"</p>
            <p class="mt-4 text-sm text-brand-200">{{ text.name }} - {{ text.faculty }}</p>
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
  readonly features = [
    { badge: '01', title: 'Find Tutors', text: 'Browse services by subject and find the perfect tutor.' },
    { badge: '02', title: 'Chat & Communicate', text: 'Message tutors directly to discuss details and arrange lessons.' },
    { badge: '03', title: 'Book Sessions', text: 'Schedule study sessions at convenient times and track your progress.' },
    { badge: '04', title: 'Become a Tutor', text: 'Share your knowledge and earn money by tutoring other students.' }
  ];

  readonly testimonials = [
    { name: 'Amina K.', faculty: 'FIT', comment: 'My calculus score jumped from C to A- in 4 weeks.' },
    { name: 'Yernar T.', faculty: 'BS', comment: 'Flexible scheduling before finals saved my semester.' },
    { name: 'Dana S.', faculty: 'ISE', comment: 'The chat flow is smooth and tutors are super responsive.' }
  ];
}
