import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="grid h-[70vh] gap-4 lg:grid-cols-3">
        <aside class="glass rounded-2xl p-4">
          <input class="w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2" placeholder="Search conversations" (input)="search.set(($any($event.target).value || '').toLowerCase())" />
          <div class="mt-4 space-y-2">
            @for (thread of threads(); track thread.id) {
              <button class="w-full rounded-xl bg-slate-900/80 p-3 text-left transition hover:bg-slate-800" (click)="activeThreadId.set(thread.id)">
                <p class="font-medium">{{ thread.tutorName }}</p>
                <p class="text-xs text-slate-400">{{ thread.lastMessage }}</p>
              </button>
            }
          </div>
        </aside>
        <article class="glass flex rounded-2xl p-4 lg:col-span-2">
          <div class="flex w-full flex-col">
            <div class="flex-1 space-y-3 overflow-y-auto">
              @for (message of activeMessages(); track message.id) {
                <div [class]="message.sender === 'me' ? 'ml-auto w-fit max-w-[80%] rounded-2xl bg-brand-500 px-4 py-2' : 'w-fit max-w-[80%] rounded-2xl bg-slate-800 px-4 py-2'">
                  <p>{{ message.content }}</p>
                  <p class="mt-1 text-[11px] opacity-70">{{ message.time }}</p>
                </div>
              } @empty {
                <p class="text-slate-300">No messages yet. Start the conversation.</p>
              }
            </div>
            <div class="mt-3 flex gap-2">
              <input [(ngModel)]="draft" class="flex-1 rounded-xl border border-white/20 bg-slate-900 px-4 py-2" placeholder="Type your message..." />
              <button class="btn-primary px-4 py-2" (click)="send()">Send</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class ChatPage {
  readonly search = signal('');
  draft = '';
  readonly activeThreadId = signal(1);

  readonly threads = computed(() =>
    this.platform.chatThreads().filter((thread) => thread.tutorName.toLowerCase().includes(this.search()))
  );
  readonly activeMessages = computed(() =>
    this.platform.messages().filter((message) => message.threadId === this.activeThreadId())
  );

  constructor(public readonly platform: PlatformService) {}

  send() {
    if (!this.draft.trim()) {
      return;
    }
    this.platform.sendMessage(this.activeThreadId(), this.draft);
    this.draft = '';
  }
}
