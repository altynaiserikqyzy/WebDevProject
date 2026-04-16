import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ChatPreview, ChatViewMessage, UserSearchResult } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="section-wrap">
      <div class="grid h-[75vh] gap-4 lg:grid-cols-[320px,1fr]">
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
              @for (user of foundUsers; track user.id) {
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
                  class="w-full rounded-xl p-3 text-left transition"
                  [class]="activeThread?.id === thread.id ? 'bg-brand-500/20 ring-1 ring-brand-300' : 'bg-slate-900/80 hover:bg-slate-800'"
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

        <article class="glass flex rounded-2xl p-4">
          @if (activeThread) {
            <div class="flex w-full flex-col">
              <div class="border-b border-white/10 pb-3">
                <p class="text-lg font-semibold">{{ activeThread.otherUser.fullName }}</p>
                <p class="text-sm text-slate-400">@{{ activeThread.otherUser.username }} · {{ activeThread.otherUser.email }}</p>
              </div>

              <div class="flex-1 space-y-3 overflow-y-auto py-4">
                @for (message of activeMessages; track message.id) {
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
  foundUsers: UserSearchResult[] = [];
  threads: ChatPreview[] = [];
  activeThread: ChatPreview | null = null;
  activeMessages: ChatViewMessage[] = [];

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService
  ) {
    this.loadConversations();
  }

  filteredThreads() {
    const query = this.threadSearch.trim().toLowerCase();
    return this.threads.filter((thread) => {
      if (!query) {
        return true;
      }
      return `${thread.otherUser.fullName} ${thread.otherUser.username} ${thread.lastMessage}`.toLowerCase().includes(query);
    });
  }

  refreshUserSearch() {
    const query = this.userSearch.trim();
    if (!query) {
      this.foundUsers = [];
      return;
    }

    this.api.searchUsers(query).subscribe({
      next: (users) => {
        this.foundUsers = users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.username,
          avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(user.username)}`,
        }));
      },
      error: () => {
        this.foundUsers = [];
      },
    });
  }

  openChatWith(user: UserSearchResult) {
    this.api.startConversation(user.id).subscribe({
      next: (conversation) => {
        this.activeThread = this.mapConversationToThread(conversation);
        this.loadMessages(conversation.id);
        this.loadConversations();
      },
    });
  }

  selectThread(threadId: number) {
    const thread = this.threads.find((item) => item.id === threadId) ?? null;
    this.activeThread = thread;
    if (thread) {
      this.loadMessages(thread.id);
    }
  }

  send() {
    if (!this.activeThread || !this.draft.trim()) {
      return;
    }

    this.api.sendConversationMessage(this.activeThread.id, this.draft).subscribe({
      next: () => {
        this.draft = '';
        this.loadMessages(this.activeThread!.id);
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
        this.threads = conversations.map((conversation) => this.mapConversationToThread(conversation));
        if (!this.activeThread && this.threads.length) {
          this.selectThread(this.threads[0].id);
        }
      },
      error: () => {
        this.threads = [];
      },
    });
  }

  private loadMessages(conversationId: number) {
    this.api.getConversationMessages(conversationId).subscribe({
      next: (messages) => {
        const currentUserId = this.auth.user()?.id;
        this.activeMessages = messages.map((message) => ({
          id: message.id,
          senderId: message.sender?.id ?? 0,
          text: message.text,
          createdAt: message.created_at,
          isMine: message.sender?.id === currentUserId,
        }));
      },
      error: () => {
        this.activeMessages = [];
      },
    });
  }

  private mapConversationToThread(conversation: any): ChatPreview {
    const currentUserId = this.auth.user()?.id;
    const otherParticipant = (conversation.participants ?? []).find((participant: any) => participant.user?.id !== currentUserId);
    const otherUser = otherParticipant?.user ?? { id: 0, username: 'Unknown', email: '' };

    return {
      id: conversation.id,
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        email: otherUser.email,
        fullName: otherUser.username,
        avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(otherUser.username)}`,
      },
      lastMessage: conversation.last_message?.text ?? 'Start your conversation.',
      updatedAt: conversation.updated_at,
    };
  }
}
