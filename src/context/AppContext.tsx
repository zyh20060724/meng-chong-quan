import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Post, Message, PetType, Comment, CheckInResult } from '../types';
import {
  loadState, saveState, createUser, pickCheckInBonus,
  getTodayDateStr, getYesterdayDateStr, type AppState,
} from '../storage';
import {
  generateId, POST_REWARD_COINS, CHECKIN_COIN_REWARDS,
} from '../constants';
import {
  CAPTAIN_ID, createCaptainFriendship, createCaptainWelcomeMessage,
  getCaptainChatReply, getCaptainCommentReply, isCaptain,
} from '../constants/captain';
import type { NestLayout } from '../types';

type Action =
  | { type: 'REGISTER'; nickname: string; petType: PetType; petName: string }
  | { type: 'LOGIN'; userId: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; userId: string; updates: Partial<User> }
  | { type: 'ADD_POST'; post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'> }
  | { type: 'DELETE_POST'; postId: string; userId: string }
  | { type: 'LIKE_POST'; postId: string; userId: string }
  | { type: 'ADD_COMMENT'; postId: string; comment: Omit<Comment, 'id' | 'createdAt'> }
  | { type: 'SEND_MESSAGE'; message: Omit<Message, 'id' | 'createdAt' | 'read'> }
  | { type: 'MARK_READ'; userId: string; friendId: string }
  | { type: 'SEND_FRIEND_REQUEST'; fromId: string; toId: string }
  | { type: 'ACCEPT_FRIEND_REQUEST'; requestId: string }
  | { type: 'REJECT_FRIEND_REQUEST'; requestId: string }
  | { type: 'SEND_GAME_INVITE'; fromId: string; toId: string; gameType: 'guess' | 'race' | 'memory' }
  | { type: 'RESPOND_GAME_INVITE'; inviteId: string; accept: boolean }
  | { type: 'FEED_PET'; userId: string }
  | { type: 'PLAY_WITH_PET'; userId: string }
  | { type: 'BUY_FURNITURE'; userId: string; furnitureId: string; price: number }
  | { type: 'BUY_OUTFIT'; userId: string; outfitId: string; price: number }
  | { type: 'EQUIP_OUTFIT'; userId: string; outfitId: string | null }
  | { type: 'GOMOKU_WIN'; userId: string; coins: number }
  | { type: 'GUESS_CORRECT'; userId: string; coins: number }
  | { type: 'UPDATE_NEST_LAYOUT'; userId: string; layout: NestLayout }
  | { type: 'STORE_FURNITURE'; userId: string; furnitureId: string }
  | { type: 'PLACE_FURNITURE'; userId: string; furnitureId: string }
  | { type: 'DAILY_CHECKIN'; userId: string };

function applyCheckIn(user: User): { user: User; result: CheckInResult | null } {
  const today = getTodayDateStr();
  if (user.lastCheckInDate === today) {
    return { user, result: null };
  }

  let streak = user.checkInStreak;
  if (user.lastCheckInDate === getYesterdayDateStr()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const dayInCycle = ((streak - 1) % 7) + 1;

  if (dayInCycle === 7) {
    const bonus = pickCheckInBonus(user);
    const updates: User = {
      ...user,
      lastCheckInDate: today,
      checkInStreak: 0,
    };
    if (bonus.itemType === 'furniture') {
      const alreadyOwned = user.furniture.includes(bonus.itemId);
      updates.furniture = alreadyOwned ? user.furniture : [...user.furniture, bonus.itemId];
      if (!alreadyOwned) {
        const count = user.furniture.length;
        updates.nestLayout = {
          ...user.nestLayout,
          items: {
            ...user.nestLayout.items,
            [bonus.itemId]: {
              x: 15 + (count % 4) * 20,
              y: 60 + Math.floor(count / 4) * 10,
              placed: true,
            },
          },
        };
      }
    } else {
      updates.outfits = user.outfits.includes(bonus.itemId)
        ? user.outfits
        : [...user.outfits, bonus.itemId];
    }
    return {
      user: updates,
      result: { type: 'bonus', itemType: bonus.itemType, itemId: bonus.itemId, itemName: bonus.itemName, day: 7 },
    };
  }

  const coins = CHECKIN_COIN_REWARDS[dayInCycle - 1];
  return {
    user: {
      ...user,
      coins: user.coins + coins,
      lastCheckInDate: today,
      checkInStreak: streak,
    },
    result: { type: 'coins', amount: coins, day: dayInCycle },
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REGISTER': {
      const user = createUser(action.nickname, action.petType, action.petName);
      return {
        ...state,
        users: [...state.users, user],
        currentUserId: user.id,
        friendships: [...state.friendships, createCaptainFriendship(user.id)],
        messages: [...state.messages, createCaptainWelcomeMessage(user.id)],
      };
    }
    case 'LOGIN':
      return { ...state, currentUserId: action.userId };
    case 'LOGOUT':
      return { ...state, currentUserId: null };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.userId ? { ...u, ...action.updates } : u
        ),
      };
    case 'ADD_POST': {
      const post: Post = {
        ...action.post,
        id: generateId(),
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        posts: [post, ...state.posts],
        users: state.users.map(u =>
          u.id === action.post.authorId
            ? { ...u, coins: u.coins + POST_REWARD_COINS }
            : u
        ),
      };
    }
    case 'DELETE_POST': {
      const post = state.posts.find(p => p.id === action.postId);
      if (!post || post.authorId !== action.userId) return state;
      return {
        ...state,
        posts: state.posts.filter(p => p.id !== action.postId),
      };
    }
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.postId) return p;
          const liked = p.likes.includes(action.userId);
          return {
            ...p,
            likes: liked
              ? p.likes.filter(id => id !== action.userId)
              : [...p.likes, action.userId],
          };
        }),
      };
    case 'ADD_COMMENT': {
      const comment: Comment = {
        ...action.comment,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const post = state.posts.find(p => p.id === action.postId);
      const comments = [...(post?.comments ?? []), comment];

      if (post && isCaptain(post.authorId) && !isCaptain(action.comment.authorId)) {
        comments.push({
          id: generateId(),
          authorId: CAPTAIN_ID,
          content: getCaptainCommentReply(),
          createdAt: new Date().toISOString(),
        });
      }

      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.postId ? { ...p, comments } : p
        ),
      };
    }
    case 'SEND_MESSAGE': {
      const msg: Message = {
        ...action.message,
        id: generateId(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      const messages: Message[] = [...state.messages, msg];

      if (isCaptain(action.message.toId)) {
        messages.push({
          id: generateId(),
          fromId: CAPTAIN_ID,
          toId: action.message.fromId,
          content: getCaptainChatReply(action.message.content),
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      return { ...state, messages };
    }
    case 'MARK_READ':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.fromId === action.friendId && m.toId === action.userId
            ? { ...m, read: true }
            : m
        ),
      };
    case 'SEND_FRIEND_REQUEST':
      return {
        ...state,
        friendRequests: [
          ...state.friendRequests,
          {
            id: generateId(),
            fromId: action.fromId,
            toId: action.toId,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    case 'ACCEPT_FRIEND_REQUEST': {
      const req = state.friendRequests.find(r => r.id === action.requestId);
      if (!req) return state;
      return {
        ...state,
        friendRequests: state.friendRequests.map(r =>
          r.id === action.requestId ? { ...r, status: 'accepted' } : r
        ),
        friendships: [
          ...state.friendships,
          {
            id: generateId(),
            userIds: [req.fromId, req.toId] as [string, string],
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
    case 'REJECT_FRIEND_REQUEST':
      return {
        ...state,
        friendRequests: state.friendRequests.map(r =>
          r.id === action.requestId ? { ...r, status: 'rejected' } : r
        ),
      };
    case 'SEND_GAME_INVITE':
      return {
        ...state,
        gameInvites: [
          ...state.gameInvites,
          {
            id: generateId(),
            fromId: action.fromId,
            toId: action.toId,
            gameType: action.gameType,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    case 'RESPOND_GAME_INVITE':
      return {
        ...state,
        gameInvites: state.gameInvites.map(inv =>
          inv.id === action.inviteId
            ? { ...inv, status: action.accept ? 'accepted' : 'declined' }
            : inv
        ),
      };
    case 'FEED_PET':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId) return u;
          const hunger = Math.min(100, u.petHunger + 25);
          const exp = u.petExp + 10;
          const levelUp = exp >= 100;
          return {
            ...u,
            petHunger: hunger,
            petMood: Math.min(100, u.petMood + 5),
            petExp: levelUp ? exp - 100 : exp,
            petLevel: levelUp ? u.petLevel + 1 : u.petLevel,
            coins: Math.max(0, u.coins - 5),
          };
        }),
      };
    case 'PLAY_WITH_PET':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId) return u;
          const exp = u.petExp + 15;
          const levelUp = exp >= 100;
          return {
            ...u,
            petMood: Math.min(100, u.petMood + 20),
            petHunger: Math.max(0, u.petHunger - 10),
            petExp: levelUp ? exp - 100 : exp,
            petLevel: levelUp ? u.petLevel + 1 : u.petLevel,
            coins: u.coins + 10,
          };
        }),
      };
    case 'BUY_FURNITURE':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId || u.coins < action.price) return u;
          if (u.furniture.includes(action.furnitureId)) return u;
          const count = u.furniture.length;
          const newItems = {
            ...u.nestLayout.items,
            [action.furnitureId]: {
              x: 15 + (count % 4) * 20,
              y: 60 + Math.floor(count / 4) * 10,
              placed: true,
            },
          };
          return {
            ...u,
            coins: u.coins - action.price,
            furniture: [...u.furniture, action.furnitureId],
            nestLayout: { ...u.nestLayout, items: newItems },
          };
        }),
      };
    case 'BUY_OUTFIT':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId || u.coins < action.price) return u;
          if (u.outfits.includes(action.outfitId)) return u;
          return {
            ...u,
            coins: u.coins - action.price,
            outfits: [...u.outfits, action.outfitId],
          };
        }),
      };
    case 'EQUIP_OUTFIT':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.userId ? { ...u, equippedOutfit: action.outfitId } : u
        ),
      };
    case 'GOMOKU_WIN':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.userId ? { ...u, coins: u.coins + action.coins } : u
        ),
      };
    case 'GUESS_CORRECT':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.userId ? { ...u, coins: u.coins + action.coins } : u
        ),
      };
    case 'UPDATE_NEST_LAYOUT':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.userId ? { ...u, nestLayout: action.layout } : u
        ),
      };
    case 'STORE_FURNITURE':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId) return u;
          const item = u.nestLayout.items[action.furnitureId];
          if (!item) return u;
          return {
            ...u,
            nestLayout: {
              ...u.nestLayout,
              items: {
                ...u.nestLayout.items,
                [action.furnitureId]: { ...item, placed: false },
              },
            },
          };
        }),
      };
    case 'PLACE_FURNITURE':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId) return u;
          const item = u.nestLayout.items[action.furnitureId];
          const count = Object.values(u.nestLayout.items).filter(i => i.placed).length;
          return {
            ...u,
            nestLayout: {
              ...u.nestLayout,
              items: {
                ...u.nestLayout.items,
                [action.furnitureId]: item
                  ? { ...item, placed: true }
                  : {
                      x: 15 + (count % 4) * 20,
                      y: 60 + Math.floor(count / 4) * 10,
                      placed: true,
                    },
              },
            },
          };
        }),
      };
    case 'DAILY_CHECKIN':
      return {
        ...state,
        users: state.users.map(u => {
          if (u.id !== action.userId) return u;
          return applyCheckIn(u).user;
        }),
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentUser: User | null;
  getUser: (id: string) => User | undefined;
  getUserByCode: (code: string) => User | undefined;
  isFriend: (userId: string, otherId: string) => boolean;
  getFriends: (userId: string) => User[];
  performCheckIn: (userId: string) => CheckInResult | null;
  hasCheckedInToday: (user: User) => boolean;
  getCheckInDay: (user: User) => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;

  const getUser = useCallback(
    (id: string) => state.users.find(u => u.id === id),
    [state.users]
  );

  const getUserByCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      return state.users.find(u => u.userCode.toUpperCase() === normalized);
    },
    [state.users]
  );

  const isFriend = useCallback(
    (userId: string, otherId: string) =>
      state.friendships.some(
        f => f.userIds.includes(userId) && f.userIds.includes(otherId)
      ),
    [state.friendships]
  );

  const getFriends = useCallback(
    (userId: string) => {
      const friendIds = state.friendships
        .filter(f => f.userIds.includes(userId))
        .map(f => f.userIds.find(id => id !== userId)!);
      return state.users.filter(u => friendIds.includes(u.id));
    },
    [state.friendships, state.users]
  );

  const hasCheckedInToday = useCallback(
    (user: User) => user.lastCheckInDate === getTodayDateStr(),
    []
  );

  const getCheckInDay = useCallback((user: User): number => {
    if (hasCheckedInToday(user)) {
      const streak = user.checkInStreak === 0 ? 7 : user.checkInStreak;
      return ((streak - 1) % 7) + 1;
    }
    const nextStreak = user.lastCheckInDate === getYesterdayDateStr()
      ? user.checkInStreak + 1
      : 1;
    return ((nextStreak - 1) % 7) + 1;
  }, [hasCheckedInToday]);

  const performCheckIn = useCallback((userId: string): CheckInResult | null => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return null;
    const { result } = applyCheckIn(user);
    if (!result) return null;
    dispatch({ type: 'DAILY_CHECKIN', userId });
    return result;
  }, [state.users]);

  return (
    <AppContext.Provider value={{
      state, dispatch, currentUser, getUser, getUserByCode,
      isFriend, getFriends, performCheckIn, hasCheckedInToday, getCheckInDay,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
