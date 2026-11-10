export type Role = 'ghost' | 'director' | 'core';
export type RoomId = 'global' | 'rc';
export type ReactionEmoji = '\u{1F44D}' | '\u{1F44E}' | '\u2705' | '\u2764\uFE0F';
export type Delivery = 'sending' | 'sent' | 'failed';
export type DiscussionScope = { kind: 'game'; gameId: string; buildId: string } | { kind: 'general' };
// Message APIs retain the existing buildId argument for compatibility. It is a
// build ID for game reviews, or the reserved 'general-discussion' conversation key.
// General Discussion is never inserted as a GameBuild and cannot receive votes.
export type DiscussionScopeId = string;
export interface Account { id: string; employeeId: string; name: string; role: Role; photo: string }
export interface Room { id: RoomId; name: string; description: string }
export interface Attachment { id: string; name: string; type: string; size: number; width?: number; height?: number; seedUrl?: string }
export interface MessageReference { roomId: RoomId; messageId: string; buildId: DiscussionScopeId; author: Account; createdAt: string; text: string; attachments: Attachment[] }
export interface Message { id: string; roomId: RoomId; buildId: DiscussionScopeId; authorId: string; text: string; createdAt: string; sequence: number; attachments: Attachment[]; replyTo?: string; reference?: MessageReference; reactions: Partial<Record<ReactionEmoji,string[]>>; delivery: Delivery }
export interface GameBuild { id: string; gameId: string; gameName: string; version: string; createdAt: string }
export interface Vote { buildId: string; accountId: string; decision: 'approve' | 'changes'; createdAt: string }
export interface MessagePage { messages: Message[]; hasOlder: boolean; cursor?: number }
export interface SendInput { roomId: RoomId; buildId: DiscussionScopeId; text: string; attachments: Attachment[]; replyTo?: string; reference?: MessageReference }
export interface ReviewEvent { kind: 'message' | 'delivery' | 'reaction' | 'review' | 'read' | 'build'; roomId?: RoomId; buildId?: string; messageId?: string }
export interface ReviewAPI {
 accounts(): Account[]; currentAccount(): Account; switchAccount(id: string): void;
 rooms(): Room[]; builds(): GameBuild[]; listMessages(room: RoomId, build: string, before?: number, limit?: number): Promise<MessagePage>;
 getMessage(id: string): Promise<Message>; send(input: SendInput): Promise<Message>; retry(id: string): Promise<void>;
 attach(file: File): Promise<Attachment>; attachmentURL(attachment: Attachment): Promise<string>; releaseURLs(): void;
 react(id: string, emoji: ReactionEmoji): Promise<void>;
 vote(build: string, decision: Vote['decision']): Promise<void>; votes(build: string): Vote[];
 unread(room: RoomId, build: string): number; read(room: RoomId, build: string, sequence: number): void;
 subscribe(listener: (event: ReviewEvent)=>void): ()=>void;
 failNext(): void; simulateIncoming(room: RoomId, build: string): Promise<void>; addBuild(gameId: string, version: string): Promise<GameBuild>; reset(): Promise<void>;
}

// Verified review-session identity is separate from local demo participants.
export interface AuthenticatedAccount { id: string; employeeId: string; name: string; role: 'ghost' | 'director'; identityMethod: 'employee-id-only' }
export interface ReviewSession { account: AuthenticatedAccount; expiresAt: string }
export interface ReviewSessionAdapter { me(): Promise<ReviewSession>; login(employeeId: string): Promise<ReviewSession>; logout(): Promise<void>; current(): ReviewSession | null; clearLocal(): void; subscribe(listener: () => void): () => void }
