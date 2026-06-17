import type { PetType, PetFurniture, PetOutfit, PetEncyclopediaEntry } from '../types';

export const PET_TYPES: { type: PetType; label: string; emoji: string; color: string }[] = [
  { type: 'cat', label: '猫咪', emoji: '🐱', color: '#FFB347' },
  { type: 'dog', label: '狗狗', emoji: '🐶', color: '#DEB887' },
  { type: 'rabbit', label: '兔子', emoji: '🐰', color: '#FFC0CB' },
  { type: 'hamster', label: '仓鼠', emoji: '🐹', color: '#F4A460' },
  { type: 'snake', label: '小蛇', emoji: '🐍', color: '#90EE90' },
  { type: 'bird', label: '小鸟', emoji: '🐦', color: '#87CEEB' },
  { type: 'fox', label: '狐狸', emoji: '🦊', color: '#FF7F50' },
  { type: 'panda', label: '熊猫', emoji: '🐼', color: '#E8E8E8' },
];

export const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👏', '🔥', '🎉', '🐾'];

export const COMMENT_EMOJI_CATEGORIES: { id: string; label: string; emojis: string[] }[] = [
  {
    id: 'common',
    label: '常用',
    emojis: ['❤️', '😂', '😍', '🥰', '😊', '👏', '🔥', '🎉', '🐾', '✨', '💯', '🙏'],
  },
  {
    id: 'happy',
    label: '开心',
    emojis: ['😄', '😆', '🤣', '😁', '😋', '🤩', '🥳', '😎', '🤗', '😇', '🫶', '💖'],
  },
  {
    id: 'surprise',
    label: '惊讶',
    emojis: ['😮', '😲', '🤯', '😱', '👀', '‼️', '❓', '💡', '🫢', '😳', '🙀', '⚡'],
  },
  {
    id: 'sad',
    label: '难过',
    emojis: ['😢', '😭', '🥺', '😿', '💔', '😞', '😔', '🫠', '😥', '🥹', '😪', '💧'],
  },
  {
    id: 'gesture',
    label: '手势',
    emojis: ['👍', '👎', '✌️', '🤞', '👌', '🤙', '💪', '🫰', '🙌', '🤝', '👋', '🫂'],
  },
  {
    id: 'pet',
    label: '萌宠',
    emojis: ['🐱', '🐶', '🐰', '🐹', '🐦', '🐼', '🦊', '🐍', '🐾', '🦴', '🐟', '🌻'],
  },
];

export const COMMENT_STICKER_PACKS: { id: string; label: string; stickers: { id: string; emoji: string; label: string }[] }[] = [
  {
    id: 'pet-daily',
    label: '萌宠日常',
    stickers: [
      { id: 'pet-hug', emoji: '🤗', label: '抱抱' },
      { id: 'pet-sleep', emoji: '😴', label: '困困了' },
      { id: 'pet-eat', emoji: '😋', label: '好吃' },
      { id: 'pet-play', emoji: '🎾', label: '出去玩' },
      { id: 'pet-bath', emoji: '🛁', label: '洗澡澡' },
      { id: 'pet-photo', emoji: '📸', label: '拍一张' },
      { id: 'pet-sun', emoji: '☀️', label: '晒太阳' },
      { id: 'pet-carrot', emoji: '🥕', label: '胡萝卜' },
    ],
  },
  {
    id: 'super-happy',
    label: '超开心',
    stickers: [
      { id: 'happy-yay', emoji: '🎉', label: '耶耶耶' },
      { id: 'happy-dance', emoji: '💃', label: '跳舞' },
      { id: 'happy-star', emoji: '🌟', label: '太棒了' },
      { id: 'happy-heart', emoji: '💕', label: '心动' },
      { id: 'happy-rainbow', emoji: '🌈', label: '彩虹' },
      { id: 'happy-gift', emoji: '🎁', label: '惊喜' },
      { id: 'happy-cake', emoji: '🎂', label: '庆祝' },
      { id: 'happy-clap', emoji: '👏', label: '鼓掌' },
    ],
  },
  {
    id: 'comfort',
    label: '安慰鼓励',
    stickers: [
      { id: 'comfort-hug', emoji: '🫂', label: '抱抱你' },
      { id: 'comfort-tea', emoji: '🍵', label: '喝杯茶' },
      { id: 'comfort-flower', emoji: '🌸', label: '送花花' },
      { id: 'comfort-cheer', emoji: '💪', label: '加油' },
      { id: 'comfort-ok', emoji: '👌', label: '没事的' },
      { id: 'comfort-heart', emoji: '💗', label: '心疼' },
      { id: 'comfort-moon', emoji: '🌙', label: '早点睡' },
      { id: 'comfort-cloud', emoji: '☁️', label: '摸摸头' },
    ],
  },
  {
    id: 'funny',
    label: '搞怪玩梗',
    stickers: [
      { id: 'funny-lol', emoji: '🤣', label: '笑死' },
      { id: 'funny-peek', emoji: '👀', label: '暗中观察' },
      { id: 'funny-shock', emoji: '😱', label: '震惊' },
      { id: 'funny-melt', emoji: '🫠', label: '融化了' },
      { id: 'funny-ghost', emoji: '👻', label: '吓到了' },
      { id: 'funny-clown', emoji: '🤡', label: '小丑竟是我' },
      { id: 'funny-sweat', emoji: '😅', label: '尴尬了' },
      { id: 'funny-zzz', emoji: '💤', label: '无聊' },
    ],
  },
];

const STICKER_MAP = new Map(
  COMMENT_STICKER_PACKS.flatMap(p => p.stickers).map(s => [s.id, s])
);

export function getCommentSticker(id: string) {
  return STICKER_MAP.get(id);
}

export const FURNITURE_SHOP: PetFurniture[] = [
  { id: 'bed1', name: '云朵小床', emoji: '🛏️', price: 50, category: 'bed' },
  { id: 'bed2', name: '蘑菇屋', emoji: '🍄', price: 120, category: 'bed' },
  { id: 'toy1', name: '毛线球', emoji: '🧶', price: 30, category: 'toy' },
  { id: 'toy2', name: '小风车', emoji: '🎡', price: 45, category: 'toy' },
  { id: 'food1', name: '零食碗', emoji: '🥣', price: 25, category: 'food' },
  { id: 'decor1', name: '小盆栽', emoji: '🪴', price: 40, category: 'decor' },
  { id: 'decor2', name: '星星灯', emoji: '✨', price: 80, category: 'decor' },
];

export const OUTFIT_SHOP: PetOutfit[] = [
  { id: 'hat1', name: '派对帽', emoji: '🎩', price: 60 },
  { id: 'hat2', name: '蝴蝶结', emoji: '🎀', price: 45 },
  { id: 'scarf', name: '暖暖围巾', emoji: '🧣', price: 55 },
  { id: 'glasses', name: '圆框眼镜', emoji: '👓', price: 70 },
  { id: 'crown', name: '小皇冠', emoji: '👑', price: 150 },
];

export const PET_ENCYCLOPEDIA: PetEncyclopediaEntry[] = [
  { petType: 'cat', name: '猫咪', description: '优雅又傲娇的小家伙，喜欢晒太阳和蹭人。', traits: ['独立', '好奇', '慵懒'], unlockLevel: 1 },
  { petType: 'dog', name: '狗狗', description: '忠诚热情的好朋友，尾巴摇个不停！', traits: ['忠诚', '活泼', '友善'], unlockLevel: 1 },
  { petType: 'rabbit', name: '兔子', description: '软萌可爱，耳朵长长的，最爱吃胡萝卜。', traits: ['温顺', '胆小', '可爱'], unlockLevel: 1 },
  { petType: 'hamster', name: '仓鼠', description: '圆滚滚的小仓鼠，腮帮子鼓鼓的。', traits: ['勤劳', '囤积', '夜行'], unlockLevel: 2 },
  { petType: 'snake', name: '小蛇', description: '神秘又酷酷的小蛇，喜欢温暖的地方。', traits: ['冷静', '神秘', '独特'], unlockLevel: 3 },
  { petType: 'bird', name: '小鸟', description: '叽叽喳喳的小鸟，歌声甜美。', traits: ['自由', '歌唱', '灵巧'], unlockLevel: 2 },
  { petType: 'fox', name: '狐狸', description: '聪明机灵的小狐狸，尾巴毛茸茸的。', traits: ['聪明', '机灵', '狡黠'], unlockLevel: 4 },
  { petType: 'panda', name: '熊猫', description: '国宝级萌物，最爱吃竹子和打滚。', traits: ['憨厚', '稀有', '治愈'], unlockLevel: 5 },
];

export const QA_QUESTIONS = [
  { q: '你最喜欢什么颜色？', options: ['粉色', '蓝色', '绿色', '黄色'] },
  { q: '周末你喜欢做什么？', options: ['睡觉', '出去玩', '打游戏', '看书'] },
  { q: '你觉得自己像哪种天气？', options: ['晴天', '多云', '雨天', '雪天'] },
  { q: '最想拥有的超能力？', options: ['飞行', '隐身', '瞬移', '读心'] },
];

/** 你问我猜：宠物给出线索，用户猜答案 */
export const GUESS_QUESTIONS = [
  { clue: '圆滚滚、腮帮子鼓鼓，最爱在笼子里囤粮', answer: '仓鼠', options: ['仓鼠', '兔子', '猫咪', '小鸟'] },
  { clue: '忠诚热情，见到主人就摇尾巴', answer: '狗狗', options: ['狗狗', '狐狸', '猫咪', '熊猫'] },
  { clue: '耳朵长长的，最爱吃胡萝卜', answer: '兔子', options: ['兔子', '仓鼠', '小鸟', '小蛇'] },
  { clue: '优雅又傲娇，喜欢晒太阳和蹭人', answer: '猫咪', options: ['猫咪', '狗狗', '狐狸', '熊猫'] },
  { clue: '叽叽喳喳，歌声甜美爱飞翔', answer: '小鸟', options: ['小鸟', '小蛇', '仓鼠', '兔子'] },
  { clue: '黑白相间，最爱吃竹子打滚', answer: '熊猫', options: ['熊猫', '猫咪', '狗狗', '仓鼠'] },
  { clue: '聪明机灵，尾巴毛茸茸的', answer: '狐狸', options: ['狐狸', '狗狗', '猫咪', '兔子'] },
  { clue: '神秘又酷酷，喜欢温暖的地方', answer: '小蛇', options: ['小蛇', '小鸟', '仓鼠', '狐狸'] },
];

export const GUESS_CORRECT_COINS = 25;

export type GomokuDifficulty = 'easy' | 'medium' | 'hard';

export const GOMOKU_DIFFICULTIES: Record<GomokuDifficulty, { label: string; reward: number; desc: string }> = {
  easy: { label: '简单', reward: 30, desc: '宠物偶尔失误，适合新手' },
  medium: { label: '普通', reward: 50, desc: '势均力敌的对弈' },
  hard: { label: '困难', reward: 100, desc: '宠物棋艺精湛，挑战高手' },
};

export const DEMO_USERS = [
  { nickname: '小橘', petType: 'cat' as PetType, petName: '橘橘', bio: '一只爱晒太阳的橘猫~' },
  { nickname: '旺财', petType: 'dog' as PetType, petName: '豆豆', bio: '汪汪汪！今天也要开心！' },
  { nickname: '兔兔酱', petType: 'rabbit' as PetType, petName: '棉花', bio: '胡萝卜是世界上最好吃的！' },
  { nickname: '仓仓', petType: 'hamster' as PetType, petName: '团子', bio: '囤粮使我快乐 🌻' },
];

export function getPetEmoji(petType: PetType): string {
  return PET_TYPES.find(p => p.type === petType)?.emoji ?? '🐾';
}

export function getPetColor(petType: PetType): string {
  return PET_TYPES.find(p => p.type === petType)?.color ?? '#FFB347';
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

let userCodeCounter = 100010;
export function generateUserCode(): string {
  userCodeCounter += 1;
  return `MC${userCodeCounter}`;
}

export function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 发文成功奖励金币 */
export const POST_REWARD_COINS = 80;

/** 五子棋各难度奖励见 GOMOKU_DIFFICULTIES */
export const GOMOKU_WIN_COINS = 50;

/** 每日签到金币（第1-6天），第7天为家具/服装 */
export const CHECKIN_COIN_REWARDS = [20, 30, 40, 50, 60, 80] as const;

export const CHECKIN_DAY_LABELS = ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天🎁'];
