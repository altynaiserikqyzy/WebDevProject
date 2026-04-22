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
            <p class="inline-flex w-fit rounded-full border border-brand-300/30 bg-brand-500/15 px-3 py-1 text-sm text-[#FBF9E4]">
              KBTU tutoring marketplace
            </p>
            <h1 class="max-w-[560px] text-5xl font-bold leading-[1.08] text-[#FBF9E4] md:text-6xl">
              NoRetake KBTU helps you learn smarter.
            </h1>
            <p class="max-w-xl text-lg text-[#FBF9E4]">
              Find trusted tutors from the KBTU community, book sessions that fit your schedule, and turn difficult
              courses into confident grades.
            </p>
            <div class="flex flex-wrap gap-3">
              <a routerLink="/auth" class="btn-primary">Start Learning Today</a>
              <a routerLink="/tutors" class="btn-secondary">Find Tutors</a>
            </div>
          </div>
          <div class="relative overflow-hidden rounded-[2rem] border border-[#FBF9E4]/35 bg-slate-900/70 p-2 shadow-[0_0_80px_rgba(251,249,228,0.36)]">
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

    <section class="w-full bg-[#020B2B]">
      <div class="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
        <div class="rounded-[2rem] border border-[#c2b99d]/40 bg-[#EEE9D2] p-3 md:p-5">
        <div class="grid items-start gap-8 lg:grid-cols-[1fr_1.12fr]">
          <article class="relative w-full overflow-hidden rounded-[2rem] border border-[#c2b99d] bg-[#E6E0C7] p-2 shadow-[0_16px_36px_rgba(80,64,36,0.18)]">
          <img
            src="/meme-photo.png"
            alt="NoRetake KBTU meme poster"
            class="h-[320px] w-full rounded-[1.4rem] object-cover object-center md:h-[420px] lg:h-[500px]"
          />
          <div class="pointer-events-none absolute inset-x-3 bottom-3 h-20 rounded-b-[1.4rem] bg-gradient-to-t from-[#2a1f10]/30 via-[#2a1f10]/10 to-transparent"></div>
        </article>

          <div>
            <div class="mb-4 rounded-2xl border border-[#c2b99d] bg-[#E6E0C7] px-5 py-4">
              <p class="text-sm uppercase tracking-[0.18em] text-[#2b5b3d]">Platform features</p>
              <h2 class="mt-2 text-2xl font-bold text-[#1f4e34] md:text-4xl">Everything you need for exam-season confidence</h2>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              @for (feature of features; track feature.title) {
                <article class="rounded-2xl border border-[#c2b99d] bg-[#E6E0C7] p-5 shadow-md shadow-[#a58a5a]/15 transition duration-300 hover:-translate-y-1">
                  <div class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white">
                    {{ feature.badge }}
                  </div>
                  <h3 class="mt-3 text-lg font-semibold text-[#1f4e34]">{{ feature.title }}</h3>
                  <p class="mt-2 text-sm leading-relaxed text-[#3a6b4d]">{{ feature.text }}</p>
                </article>
              }
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>

    <section class="w-full bg-[#020B2B]">
      <div class="section-wrap">
        <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#010722] via-[#020b2b] to-[#140d3d] p-6 md:p-8">
          <h2 class="text-2xl font-bold text-[#FBF9E4] md:text-3xl">Student Success stories</h2>
          <p class="mt-2 text-sm text-[#FBF9E4]/85">Real experinences. Real results.</p>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            @for (text of testimonials; track text.name) {
              <article class="glass border-2 border-[#FBF9E4] p-5 transition duration-150 hover:-translate-y-1 active:translate-y-[2px] active:scale-[0.99] active:shadow-sm">
                <p class="text-slate-200">"{{ text.comment }}"</p>
                <p class="mt-4 text-sm text-brand-200">{{ text.name }} - {{ text.faculty }}</p>
              </article>
            }
          </div>
        </div>
      </div>
    </section>

    <section class="w-full bg-[#020B2B]">
      <div class="section-wrap">
        <div class="rounded-3xl border border-[#d8d2bd] bg-[#FBF9E4] p-8 text-center shadow-[0_10px_28px_rgba(80,64,36,0.16)]">
          <h3 class="text-3xl font-bold text-[#1f4e34]">Ready to improve your grades?</h3>
          <p class="mx-auto mt-2 max-w-2xl text-[#3a6b4d]">Join thousands of KBTU students who are already using NoRetake.</p>
          <a routerLink="/auth" class="btn-primary mt-5 inline-flex">Start Learning Today</a>
        </div>
      </div>
    </section>
  `
})
export class LandingPage {
  readonly features = [
    { badge: '01', title: 'Find Tutors', text: 'Browse services by subject and find the perfect tutor.' },
    { badge: '02', title: 'Contact via Telegram', text: 'Message tutors via Telegram to discuss details and arrange lessons.' },
    { badge: '03', title: 'Book Sessions', text: 'Schedule study sessions at convenient times and track your progress.' },
    { badge: '04', title: 'Become a Tutor', text: 'Share your knowledge and earn money by tutoring other students.' }
  ];

  readonly testimonials = [
    {
      name: 'Amina K.',
      faculty: 'SITE',
      comment:
        'In just 4 weeks, my calculus grade improved from C to A-. The explanations are clear, and the practice problems really helped me understand the tough topics.',
    },
    {
      name: 'Yernar T.',
      faculty: 'BS',
      comment:
        'The flexible scheduling around my classes made a huge difference during finals. I could book sessions late at night and still get the help I needed.',
    },
    {
      name: 'Dana S.',
      faculty: 'ISE',
      comment:
        'Communication on Telegram is fast and easy, and my tutor always replies quickly. The support is personalized and really makes a difference.',
    }
  ];
}
