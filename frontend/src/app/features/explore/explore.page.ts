import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section-wrap space-y-8">
      <div class="rounded-3xl border border-[#c2b99d] bg-[#EEE9D2] px-8 py-6">
        <h1 class="text-3xl font-bold text-[#1f4e34]">Find tutors by disciplines</h1>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        @for (subject of platform.subjects(); track subject.id) {
          <a
            routerLink="/tutors"
            [queryParams]="{ subject: normalizedSubject(subject.name) }"
            class="glass subject-card block rounded-2xl p-5 transition hover:-translate-y-1"
            [class.subject-card-calculus]="subject.name === 'Calculus |'"
            [class.subject-card-linear-algebra]="subject.name === 'Linear Algebra for Engineers'"
            [class.subject-card-theoretical-mechanics]="subject.name === 'Theoretical Mechanics'"
            [class.subject-card-programming]="subject.name === 'Programming Principles |'"
            [class.subject-card-statistics]="subject.name === 'Statistics'"
            [class.subject-card-accounting]="subject.name === 'Accounting'"
          >
            <h3 class="subject-title mt-1 font-semibold text-white">{{ subject.name }}</h3>
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .subject-card {
      min-height: 132px;
      position: relative;
      overflow: hidden;
      border: 2px solid #FBF9E4;
      box-shadow: none;
    }

    .subject-card-calculus {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.26) 0%, rgba(3, 7, 27, 0.68) 100%),
        url('/calculus-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-card-linear-algebra {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.30) 0%, rgba(3, 7, 27, 0.72) 100%),
        url('/linear-algebra-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-card-programming {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.28) 0%, rgba(3, 7, 27, 0.72) 100%),
        url('/programming-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-card-theoretical-mechanics {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.30) 0%, rgba(3, 7, 27, 0.72) 100%),
        url('/theoretical-mechanics-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-card-statistics {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.34) 0%, rgba(3, 7, 27, 0.72) 100%),
        url('/statistics-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-card-accounting {
      background-image:
        linear-gradient(180deg, rgba(3, 7, 27, 0.34) 0%, rgba(3, 7, 27, 0.72) 100%),
        url('/accounting-bg.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(251, 249, 228, 0.10);
    }

    .subject-title {
      position: relative;
      z-index: 1;
    }
  `],
})
export class ExplorePage {
  constructor(public readonly platform: PlatformService) {}

  normalizedSubject(name: string) {
    return String(name ?? '').replace('|', '').trim();
  }
}
