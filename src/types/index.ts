export type PetType = 'cat' | 'dog' | 'rabbit' | 'hamster' | 'snake' | 'bird' | 'fox' | 'panda';

export interface NestItemLayout {
  x: number;
  y: number;
  placed: boolean;
}

export interface NestLayout {
  petX: number;
  petY: number;
  items: Record<string, NestItemLayout>;
}

export interface User {
  id: string;
  userCode: string;
  nickname: string;
  petType: PetType;
  petName: string;
  petMood: number;
  petHunger: number;
  petLevel: number;
  petExp: number;
  coins: number;
  furniture: string[];
  outfits: string[];
  equippedOutfit: string | null;
  nestLayout: NestLayout;
  bio: string;
  checkInStreak: number;
  lastCheckInDate: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  visibility: 'public' | 'friends' | 'private';
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface CommentSticker {
  id: string;
  emoji: string;
  label: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  emoji?: string;
  stickers?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friendship {
  id: string;
  userIds: [string, string];
  createdAt: string;
}

export interface GameInvite {
  id: string;
  fromId: string;
  toId: string;
  gameType: 'guess' | 'race' | 'memory';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface PetFurniture {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'bed' | 'toy' | 'food' | 'decor';
}

export interface PetOutfit {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

export interface PetEncyclopediaEntry {
  petType: PetType;
  name: string;
  description: string;
  traits: string[];
  unlockLevel: number;
}

export interface AppState {
  currentUserId: string | null;
  users: User[];
  posts: Post[];
  messages: Message[];
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  gameInvites: GameInvite[];
}

export type CheckInResult =
  | { type: 'coins'; amount: number; day: number }
  | { type: 'bonus'; itemType: 'furniture' | 'outfit'; itemId: string; itemName: string; day: number };

export type GomokuDifficulty = 'easy' | 'medium' | 'hard';

export type PetInteraction =
  | { kind: 'feed'; foodId: string; emoji: string; name: string }
  | { kind: 'play'; gameId: string; emoji: string; name: string }
  | { kind: 'dress'; action: 'equip' | 'unequip' | 'buy'; outfitId: string; emoji: string; name: string }
  | null;
