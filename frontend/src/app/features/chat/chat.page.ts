import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ChatPreview, ChatViewMessage, UserSearchResult } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="grid h-[75vh] gap-4" [class]="activeThread() ? 'grid-cols-1' : 'lg:grid-cols-[320px,1fr]'">
        @if (!activeThread()) {
          <aside class="glass flex flex-col gap-4 rounded-2xl p-4">
            <div>
              <p class="text-sm uppercase tracking-widest text-brand-200">Conversations</p>
              <input
                [(ngModel)]="threadSearch"
                class="mt-3 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2"
                placeholder="Search your chats"
              />
            </div>

            <div>
              <p class="text-sm uppercase tracking-widest text-brand-200">Find registered users</p>
              <input
                [(ngModel)]="userSearch"
                (ngModelChange)="refreshUserSearch()"
                class="mt-3 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-2"
                placeholder="Start typing a name, username or email"
              />
              @if (!hasUserSearch()) {
                <p class="mt-3 rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-400">
                  Search for a user to start a conversation.
                </p>
              }
              <div class="mt-3 max-h-44 space-y-2 overflow-y-auto">
                @for (user of foundUsers(); track user.id) {
                  <button class="w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left transition hover:bg-slate-800" (click)="openChatWith(user)">
                    <p class="font-medium">{{ user.fullName }}</p>
                    <p class="text-xs text-slate-400">@{{ user.username }} · {{ user.email }}</p>
                  </button>
                } @empty {
                  @if (hasUserSearch()) {
                    <p class="rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-400">
                      No users matched your search.
                    </p>
                  }
                }
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto">
              <div class="space-y-2">
                @for (thread of filteredThreads(); track thread.id) {
                  <button
                    class="w-full rounded-xl bg-slate-900/80 p-3 text-left transition hover:bg-slate-800"
                    (click)="selectThread(thread.id)"
                  >
                    <p class="font-medium">{{ thread.otherUser.fullName }}</p>
                    <p class="text-xs text-slate-400">@{{ thread.otherUser.username }}</p>
                    <p class="mt-1 truncate text-sm text-slate-300">{{ thread.lastMessage }}</p>
                  </button>
                } @empty {
                  <p class="rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-400">No chats yet. Start one from the registered users list.</p>
                }
              </div>
            </div>
          </aside>
        }

          <article class="glass flex rounded-2xl p-4" [class]="activeThread() ? 'glass flex min-h-[75vh] rounded-2xl p-4' : 'glass flex rounded-2xl p-4'">
          @if (activeThread(); as thread) {
            <div class="flex w-full flex-col">
              <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p class="text-lg font-semibold">{{ thread.otherUser.fullName }}</p>
                  <p class="text-sm text-slate-400">@{{ thread.otherUser.username }} · {{ thread.otherUser.email }}</p>
                </div>
                <button class="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900" (click)="closeThread()">X</button>
              </div>

              <div class="flex-1 space-y-3 overflow-y-auto py-4">
                @for (message of activeMessages(); track message.id) {
                  <div [class]="message.isMine ? 'ml-auto w-fit max-w-[80%] rounded-2xl bg-brand-500 px-4 py-2' : 'w-fit max-w-[80%] rounded-2xl bg-slate-800 px-4 py-2'">
                    <p>{{ message.text }}</p>
                    <p class="mt-1 text-[11px] opacity-70">{{ formatDate(message.createdAt) }}</p>
                  </div>
                } @empty {
                  <p class="text-slate-300">No messages yet. Start the conversation.</p>
                }
              </div>

              <div class="mt-3 flex gap-2">
                <input
                  [(ngModel)]="draft"
                  class="flex-1 rounded-xl border border-white/20 bg-slate-900 px-4 py-2"
                  placeholder="Type your message..."
                  (keydown.enter)="send()"
                />
                <button class="btn-primary px-4 py-2" (click)="send()">Send</button>
              </div>
            </div>
          } @else {
            <div class="m-auto max-w-md text-center text-slate-300">
              <p class="text-2xl font-semibold text-white">Your personal chats</p>
              <p class="mt-3">Search registered users on the left and open a conversation. One pair of users gets one shared chat, so duplicates do not repeat.</p>
            </div>
          }
        </article>
      </div>
    </section>
  `,
})
export class ChatPage {
  threadSearch = '';
  userSearch = '';
  draft = '';
  readonly foundUsers = signal<UserSearchResult[]>([]);
  readonly threads = signal<ChatPreview[]>([]);
  readonly activeThread = signal<ChatPreview | null>(null);
  readonly activeMessages = signal<ChatViewMessage[]>([]);

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService,
    private readonly route: ActivatedRoute
  ) {
    if (this.auth.user()) {
      this.loadConversations();
    } else {
      this.auth.loadProfile(() => this.loadConversations());
    }

    this.route.queryParamMap.subscribe((params) => {
      const userId = Number(params.get('userId'));
      if (userId) {
        this.openChatWith({
          id: userId,
          username: '',
          email: '',
          fullName: 'Loading...',
          avatar: '',
        });
      }
    });
  }

  filteredThreads() {
    const query = this.threadSearch.trim().toLowerCase();
    return this.threads().filter((thread) => {
      if (!query) {
        return true;
      }
      return `${thread.otherUser.fullName} ${thread.otherUser.username} ${thread.lastMessage}`.toLowerCase().includes(query);
    });
  }

  refreshUserSearch() {
    const query = this.userSearch.trim();
    if (!query) {
      this.foundUsers.set([]);
      return;
    }

    this.api.searchUsers(query).subscribe({
      next: (users) => {
        this.foundUsers.set(users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name || user.username,
          avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(user.username)}`,
        })));
      },
      error: () => {
        this.foundUsers.set([]);
      },
    });
  }

  openChatWith(user: UserSearchResult) {
    this.api.startConversation(user.id).subscribe({
      next: (conversation) => {
        this.activeThread.set(this.mapConversationToThread(conversation, user.id, user));
        this.loadMessages(conversation.id);
        this.loadConversations();
      },
      error: (err) => {
        console.error('Failed to open chat:', err);
      },
    });
  }

  selectThread(threadId: number) {
    const thread = this.threads().find((item) => item.id === threadId) ?? null;
    this.activeThread.set(thread);
    if (thread) {
      this.loadMessages(thread.id);
    }
  }

  closeThread() {
    this.activeThread.set(null);
    this.activeMessages.set([]);
    this.draft = '';
  }

  send() {
    const thread = this.activeThread();
    if (!thread || !this.draft.trim()) {
      return;
    }

    this.api.sendConversationMessage(thread.id, this.draft).subscribe({
      next: () => {
        this.draft = '';
        this.loadMessages(thread.id);
        this.loadConversations();
      },
    });
  }

  formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  hasUserSearch() {
    return this.userSearch.trim().length > 0;
  }

  private loadConversations() {
    this.api.listConversations().subscribe({
      next: (conversations) => {
        const threads = conversations.map((conversation) => this.mapConversationToThread(conversation));
        this.threads.set(threads);

        const activeThread = this.activeThread();
        if (activeThread) {
          this.activeThread.set(threads.find((thread) => thread.id === activeThread.id) ?? activeThread);
        }
      },
      error: () => {
        this.threads.set([]);
      },
    });
  }

  private loadMessages(conversationId: number) {
    this.api.getConversationMessages(conversationId).subscribe({
      next: (messages) => {
        const currentUserId = this.auth.user()?.id;
        this.activeMessages.set(messages.map((message) => ({
          id: message.id,
          senderId: message.sender?.id ?? 0,
          text: message.text,
          createdAt: message.created_at,
          isMine: message.sender?.id === currentUserId,
        })));
      },
      error: () => {
        this.activeMessages.set([]);
      },
    });
  }

  private mapConversationToThread(conversation: any, preferredUserId?: number, fallbackUser?: UserSearchResult): ChatPreview {
    const currentUserId = this.auth.user()?.id;
    const participants = conversation.participants ?? [];
    const otherParticipant = preferredUserId
      ? participants.find((participant: any) => participant.user?.id === preferredUserId)
      : participants.find((participant: any) => participant.user?.id !== currentUserId);
    const otherUser = otherParticipant?.user ?? fallbackUser ?? { id: 0, username: 'Unknown', email: '', full_name: 'Unknown' };

    return {
      id: conversation.id,
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        email: otherUser.email,
        fullName: otherUser.full_name || otherUser.fullName || otherUser.username,
        avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(otherUser.username)}`,
      },
      lastMessage: conversation.last_message?.text ?? 'Start your conversation.',
      updatedAt: conversation.updated_at,
    };
  }
}
