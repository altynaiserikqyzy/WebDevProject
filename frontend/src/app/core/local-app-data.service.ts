import { Injectable, computed, signal } from '@angular/core';

import {
  AuthUser,
  ChatPreview,
  LocalChatMessage,
  LocalChatThread,
  SignupRequest,
  StoredUser,
  UserSearchResult,
} from './models';

const USERS_KEY = 'noretake.users';
const CURRENT_USER_KEY = 'noretake.currentUserId';
const THREADS_KEY = 'noretake.chatThreads';
const MESSAGES_KEY = 'noretake.chatMessages';

@Injectable({ providedIn: 'root' })
export class LocalAppDataService {
  private readonly usersState = signal<StoredUser[]>(this.read<StoredUser[]>(USERS_KEY, []));
  private readonly currentUserIdState = signal<number | null>(this.read<number | null>(CURRENT_USER_KEY, null));
  private readonly threadsState = signal<LocalChatThread[]>(this.read<LocalChatThread[]>(THREADS_KEY, []));
  private readonly messagesState = signal<LocalChatMessage[]>(this.read<LocalChatMessage[]>(MESSAGES_KEY, []));

  readonly users = computed(() => this.usersState());
  readonly currentUser = computed<AuthUser | null>(() => {
    const userId = this.currentUserIdState();
    if (!userId) {
      return null;
    }
    return this.toPublicUser(this.usersState().find((item) => item.id === userId) ?? null);
  });
  readonly isLoggedIn = computed(() => this.currentUserIdState() !== null);

  signup(payload: SignupRequest): { ok: true; user: AuthUser } | { ok: false; error: string } {
    const username = payload.username.trim().toLowerCase();
    const email = payload.email.trim().toLowerCase();

    if (this.usersState().some((item) => item.username.toLowerCase() === username)) {
      return { ok: false, error: 'This username is already taken.' };
    }

    if (this.usersState().some((item) => item.email.toLowerCase() === email)) {
      return { ok: false, error: 'This email is already registered.' };
    }

    const user: StoredUser = {
      id: Date.now(),
      fullName: payload.fullName.trim() || 'KBTU Student',
      username,
      email,
      password: payload.password,
      bio: 'Add your profile details here.',
      major: 'Computer Science',
      studyYear: 1,
      avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(username)}`,
      isTutor: false,
    };

    this.usersState.update((items) => [...items, user]);
    this.persistUsers();
    this.setCurrentUser(user.id);
    return { ok: true, user: this.toPublicUser(user)! };
  }

  login(username: string, password: string): { ok: true; user: AuthUser } | { ok: false; error: string } {
    const normalizedUsername = username.trim().toLowerCase();
    const user = this.usersState().find(
      (item) => item.username.toLowerCase() === normalizedUsername && item.password === password
    );

    if (!user) {
      return { ok: false, error: 'Invalid username or password.' };
    }

    this.setCurrentUser(user.id);
    return { ok: true, user: this.toPublicUser(user)! };
  }

  logout() {
    this.currentUserIdState.set(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  updateProfile(patch: Partial<Pick<AuthUser, 'fullName' | 'bio' | 'major' | 'studyYear' | 'avatar'>>) {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId) {
      return;
    }

    this.usersState.update((items) =>
      items.map((item) => (item.id === currentUserId ? { ...item, ...patch } : item))
    );
    this.persistUsers();
  }

  becomeTutor() {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId) {
      return;
    }

    this.usersState.update((items) =>
      items.map((item) => (item.id === currentUserId ? { ...item, isTutor: true } : item))
    );
    this.persistUsers();
  }

  searchUsers(query: string): UserSearchResult[] {
    const normalizedQuery = query.trim().toLowerCase();
    const currentUserId = this.currentUserIdState();

    return this.usersState()
      .filter((item) => item.id !== currentUserId)
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }
        return `${item.fullName} ${item.username} ${item.email}`.toLowerCase().includes(normalizedQuery);
      })
      .map((item) => this.toSearchResult(item));
  }

  listThreads(): ChatPreview[] {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId) {
      return [];
    }

    return this.threadsState()
      .filter((thread) => thread.participantIds.includes(currentUserId))
      .map((thread) => {
        const otherUserId = thread.participantIds.find((item) => item !== currentUserId)!;
        const otherUser = this.usersState().find((item) => item.id === otherUserId);
        const lastMessage = this.messagesState()
          .filter((message) => message.threadId === thread.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .at(-1);

        return {
          id: thread.id,
          otherUser: this.toSearchResult(otherUser!),
          lastMessage: lastMessage?.text ?? 'Start your conversation.',
          updatedAt: thread.updatedAt,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getThreadMessages(threadId: number) {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId) {
      return [];
    }

    return this.messagesState()
      .filter((message) => message.threadId === threadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((message) => ({
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        isMine: message.senderId === currentUserId,
      }));
  }

  startOrOpenChat(otherUserId: number): ChatPreview | null {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId || currentUserId === otherUserId) {
      return null;
    }

    const [firstId, secondId] = [currentUserId, otherUserId].sort((a, b) => a - b);
    let thread = this.threadsState().find(
      (item) => item.participantIds[0] === firstId && item.participantIds[1] === secondId
    );

    if (!thread) {
      const now = new Date().toISOString();
      thread = {
        id: Date.now(),
        participantIds: [firstId, secondId],
        createdAt: now,
        updatedAt: now,
      };
      this.threadsState.update((items) => [...items, thread!]);
      this.persistThreads();
    }

    return this.listThreads().find((item) => item.id === thread.id) ?? null;
  }

  sendMessage(threadId: number, text: string) {
    const currentUserId = this.currentUserIdState();
    if (!currentUserId) {
      return;
    }

    const now = new Date().toISOString();
    const message: LocalChatMessage = {
      id: Date.now(),
      threadId,
      senderId: currentUserId,
      text: text.trim(),
      createdAt: now,
    };

    this.messagesState.update((items) => [...items, message]);
    this.threadsState.update((items) =>
      items.map((item) => (item.id === threadId ? { ...item, updatedAt: now } : item))
    );
    this.persistMessages();
    this.persistThreads();
  }

  private setCurrentUser(userId: number) {
    this.currentUserIdState.set(userId);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userId));
  }

  private persistUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.usersState()));
  }

  private persistThreads() {
    localStorage.setItem(THREADS_KEY, JSON.stringify(this.threadsState()));
  }

  private persistMessages() {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(this.messagesState()));
  }

  private toPublicUser(user: StoredUser | null): AuthUser | null {
    if (!user) {
      return null;
    }

    const { password: _password, ...rest } = user;
    return rest;
  }

  private toSearchResult(user: StoredUser): UserSearchResult {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };
  }

  private read<T>(key: string, fallback: T): T {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  }
}
