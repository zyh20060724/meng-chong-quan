import type { User, Post, Message, Friendship } from '../types';

export const CAPTAIN_ID = 'captain-npc';
export const CAPTAIN_USER_CODE = 'MC000001';

export function isCaptain(userId: string) {
  return userId === CAPTAIN_ID;
}

export function createCaptainUser(): User {
  return {
    id: CAPTAIN_ID,
    userCode: CAPTAIN_USER_CODE,
    nickname: '萌宠圈队长',
    petType: 'panda',
    petName: '队长大人',
    petMood: 100,
    petHunger: 100,
    petLevel: 10,
    petExp: 80,
    coins: 9999,
    furniture: ['bed1', 'decor2'],
    outfits: ['crown', 'hat1'],
    equippedOutfit: 'crown',
    nestLayout: {
      petX: 50,
      petY: 55,
      items: {
        bed1: { x: 20, y: 65, placed: true },
        decor2: { x: 70, y: 60, placed: true },
      },
    },
    bio: '萌宠圈官方向导 🎖️ 带你玩转动态、私聊和小游戏！',
    checkInStreak: 7,
    lastCheckInDate: '',
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
  };
}

export function createCaptainPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: 'post-captain-1',
      authorId: CAPTAIN_ID,
      content: '欢迎来到萌宠圈！🎉 我是队长，有任何问题都可以私聊我~ 一起玩游戏还能赚金币哦！',
      visibility: 'public',
      likes: [],
      comments: [],
      createdAt: new Date(now - 7200000).toISOString(),
    },
    {
      id: 'post-captain-2',
      authorId: CAPTAIN_ID,
      content: '今日挑战：和好友玩一局「猜宠物」吧！🎯 答对有惊喜奖励~',
      visibility: 'public',
      likes: [],
      comments: [],
      createdAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: 'post-captain-3',
      authorId: CAPTAIN_ID,
      content: '队长的萌宠小贴士：每天签到可以拿家具和服装，别忘了去宠物页签到哦 📅✨',
      visibility: 'public',
      likes: [],
      comments: [],
      createdAt: new Date(now - 1800000).toISOString(),
    },
  ];
}

export function createCaptainWelcomeMessage(userId: string): Message {
  return {
    id: `msg-captain-welcome-${userId}`,
    fromId: CAPTAIN_ID,
    toId: userId,
    content: '你好呀！我是萌宠圈队长 🎖️ 已自动加你为好友啦~ 来动态看看我的分享，或私聊我、一起玩小游戏吧！',
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function createCaptainFriendship(userId: string): Friendship {
  return {
    id: `friendship-captain-${userId}`,
    userIds: [CAPTAIN_ID, userId],
    createdAt: new Date().toISOString(),
  };
}

const CHAT_REPLIES: { keywords: string[]; reply: string }[] = [
  { keywords: ['你好', '嗨', 'hi', 'hello', '在吗'], reply: '在的在的！队长随时在线~ 今天想玩什么小游戏？🎮' },
  { keywords: ['游戏', '玩', '小游戏'], reply: '去「小游戏」标签页找我，猜宠物、赛跑、记忆配对都可以哦！🏆' },
  { keywords: ['金币', '赚钱', '签到'], reply: '每日签到、发文、和宠物玩耍都能赚金币~ 记得去宠物页签到！💰' },
  { keywords: ['宠物', '喂食', '小窝'], reply: '宠物页可以喂食、玩耍、装扮小窝~ 每种互动都有不同反馈呢 🐾' },
  { keywords: ['好友', '加好友'], reply: '搜索用户 ID 就能加好友啦！我的 ID 是 MC000001，已经是你好友咯~ 👫' },
  { keywords: ['谢谢', '感谢', 'thx'], reply: '不客气！在萌宠圈玩得开心最重要 ✨' },
];

const DEFAULT_REPLIES = [
  '收到！有什么想聊的尽管说~ 🐼',
  '队长记下了！去动态页给我点个赞吧~ ❤️',
  '哈哈，有意思！要不要来一局猜宠物？🎯',
  '队长大人正在巡视萌宠圈，随时为你效劳！🎖️',
];

export function getCaptainChatReply(content: string): string {
  const text = content.toLowerCase();
  for (const item of CHAT_REPLIES) {
    if (item.keywords.some(k => text.includes(k.toLowerCase()))) {
      return item.reply;
    }
  }
  return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
}

const COMMENT_REPLIES = [
  '谢谢互动！队长给你比个心~ ❤️',
  '说得对！继续保持哦 ✨',
  '哈哈，被你发现了~ 🐼',
  '欢迎常来队长动态下留言！',
];

export function getCaptainCommentReply(): string {
  return COMMENT_REPLIES[Math.floor(Math.random() * COMMENT_REPLIES.length)];
}

export const CAPTAIN_GAME_REWARDS = {
  guess: 20,
  race: 15,
  memory: 25,
} as const;
