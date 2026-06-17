import type { AppState, User, Post, Message, FriendRequest, Friendship, GameInvite, NestLayout } from '../types';
import {
  DEMO_USERS, generateId, generateUserCode, getTodayDateStr, getYesterdayDateStr,
  FURNITURE_SHOP, OUTFIT_SHOP,
} from '../constants';
import {
  CAPTAIN_ID, createCaptainUser, createCaptainPosts,
  createCaptainFriendship, createCaptainWelcomeMessage,
} from '../constants/captain';

const STORAGE_KEY = 'pet-pals-state';

const DEMO_CODES = ['MC100001', 'MC100002', 'MC100003', 'MC100004'];

export function createDefaultNestLayout(furnitureIds: string[] = []): NestLayout {
  const items: NestLayout['items'] = {};
  furnitureIds.forEach((id, i) => {
    items[id] = {
      x: 12 + (i % 4) * 22,
      y: 58 + Math.floor(i / 4) * 12,
      placed: true,
    };
  });
  return { petX: 68, petY: 58, items };
}

function createDemoUser(data: typeof DEMO_USERS[0], index: number): User {
  const furniture = ['bed1'];
  return {
    id: `demo-${index}`,
    userCode: DEMO_CODES[index] ?? generateUserCode(),
    nickname: data.nickname,
    petType: data.petType,
    petName: data.petName,
    petMood: 70 + Math.floor(Math.random() * 30),
    petHunger: 60 + Math.floor(Math.random() * 40),
    petLevel: 1 + index,
    petExp: Math.floor(Math.random() * 80),
    coins: 100 + index * 50,
    furniture,
    outfits: [],
    equippedOutfit: null,
    nestLayout: createDefaultNestLayout(furniture),
    bio: data.bio,
    checkInStreak: 0,
    lastCheckInDate: '',
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  };
}

function migrateUser(u: User & Partial<User>): User {
  const furniture = u.furniture ?? [];
  const nestLayout = u.nestLayout ?? createDefaultNestLayout(furniture);
  const mergedItems = { ...nestLayout.items };
  furniture.forEach((id, i) => {
    if (!mergedItems[id]) {
      mergedItems[id] = {
        x: 12 + (i % 4) * 22,
        y: 58 + Math.floor(i / 4) * 12,
        placed: true,
      };
    }
  });
  return {
    id: u.id,
    userCode: u.userCode || generateUserCode(),
    nickname: u.nickname,
    petType: u.petType,
    petName: u.petName,
    petMood: u.petMood ?? 80,
    petHunger: u.petHunger ?? 80,
    petLevel: u.petLevel ?? 1,
    petExp: u.petExp ?? 0,
    coins: u.coins ?? 200,
    furniture,
    outfits: u.outfits ?? [],
    equippedOutfit: u.equippedOutfit ?? null,
    nestLayout: {
      petX: nestLayout.petX ?? 68,
      petY: nestLayout.petY ?? 58,
      items: mergedItems,
    },
    bio: u.bio ?? '',
    checkInStreak: u.checkInStreak ?? 0,
    lastCheckInDate: u.lastCheckInDate ?? '',
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

function ensureCaptain(state: AppState): AppState {
  let users = state.users;
  if (!users.some(u => u.id === CAPTAIN_ID)) {
    users = [createCaptainUser(), ...users];
  } else {
    users = users.map(u => (u.id === CAPTAIN_ID ? createCaptainUser() : u));
  }

  let posts = [...state.posts];
  for (const cp of createCaptainPosts()) {
    if (!posts.some(p => p.id === cp.id)) {
      posts = [cp, ...posts];
    }
  }

  let friendships = [...state.friendships];
  for (const u of users) {
    if (u.id === CAPTAIN_ID) continue;
    const linked = friendships.some(
      f => f.userIds.includes(CAPTAIN_ID) && f.userIds.includes(u.id)
    );
    if (!linked) {
      friendships.push(createCaptainFriendship(u.id));
    }
  }

  let messages = [...state.messages];
  for (const u of users) {
    if (u.id === CAPTAIN_ID) continue;
    const welcomeId = `msg-captain-welcome-${u.id}`;
    if (!messages.some(m => m.id === welcomeId)) {
      messages.push(createCaptainWelcomeMessage(u.id));
    }
  }

  return { ...state, users, posts, friendships, messages };
}

function migrateState(state: AppState): AppState {
  const usedCodes = new Set<string>();
  const users = state.users.map(u => {
    let migrated = migrateUser(u as User & Partial<User>);
    if (!u.userCode) {
      if (u.id.startsWith('demo-')) {
        const idx = parseInt(u.id.replace('demo-', ''), 10);
        migrated.userCode = DEMO_CODES[idx] ?? generateUserCode();
      }
    }
    while (usedCodes.has(migrated.userCode)) {
      migrated = { ...migrated, userCode: generateUserCode() };
    }
    usedCodes.add(migrated.userCode);
    return migrated;
  });
  return ensureCaptain({ ...state, users });
}

function createDemoPosts(users: User[]): Post[] {
  const contents = [
    '今天天气真好，带宠物出去散步啦~ 🌸',
    '刚给小家伙买了新玩具，开心得转圈圈！',
    '有人想一起玩猜宠物游戏吗？',
    '分享一张宠物睡觉的照片，太可爱了呜呜',
    '周末宠物派对，欢迎来我家玩！',
  ];
  return contents.map((content, i) => ({
    id: `post-demo-${i}`,
    authorId: users[i % users.length].id,
    content,
    visibility: 'public' as const,
    likes: i % 2 === 0 ? [users[(i + 1) % users.length].id] : [],
    comments: i === 0 ? [{
      id: 'comment-1',
      authorId: users[1].id,
      content: '好羡慕！我也想去散步',
      emoji: '😍',
      createdAt: new Date().toISOString(),
    }] : [],
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

function getInitialState(): AppState {
  const demoUsers = DEMO_USERS.map((d, i) => createDemoUser(d, i));
  return ensureCaptain({
    currentUserId: null,
    users: demoUsers,
    posts: createDemoPosts(demoUsers),
    messages: [],
    friendRequests: [],
    friendships: [],
    gameInvites: [],
  });
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.users?.length) return migrateState(parsed);
    }
  } catch {
    // ignore
  }
  return getInitialState();
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createUser(
  nickname: string,
  petType: User['petType'],
  petName: string
): User {
  return {
    id: generateId(),
    userCode: generateUserCode(),
    nickname,
    petType,
    petName,
    petMood: 80,
    petHunger: 80,
    petLevel: 1,
    petExp: 0,
    coins: 200,
    furniture: [],
    outfits: [],
    equippedOutfit: null,
    nestLayout: createDefaultNestLayout(),
    bio: '',
    checkInStreak: 0,
    lastCheckInDate: '',
    createdAt: new Date().toISOString(),
  };
}

export function pickCheckInBonus(user: User): { itemType: 'furniture' | 'outfit'; itemId: string; itemName: string } {
  const missingFurniture = FURNITURE_SHOP.filter(f => !user.furniture.includes(f.id));
  const missingOutfits = OUTFIT_SHOP.filter(o => !user.outfits.includes(o.id));

  if (missingFurniture.length > 0 && (missingOutfits.length === 0 || Math.random() > 0.5)) {
    const item = missingFurniture[Math.floor(Math.random() * missingFurniture.length)];
    return { itemType: 'furniture', itemId: item.id, itemName: item.name };
  }
  if (missingOutfits.length > 0) {
    const item = missingOutfits[Math.floor(Math.random() * missingOutfits.length)];
    return { itemType: 'outfit', itemId: item.id, itemName: item.name };
  }
  const fallback = FURNITURE_SHOP[Math.floor(Math.random() * FURNITURE_SHOP.length)];
  return { itemType: 'furniture', itemId: fallback.id, itemName: fallback.name };
}

export { getTodayDateStr, getYesterdayDateStr };
export type { AppState, User, Post, Message, FriendRequest, Friendship, GameInvite };
