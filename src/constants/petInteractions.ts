export const PET_FEED_OPTIONS = [
  { id: 'bone', emoji: '🍖', name: '肉骨头', reaction: '好香！咔嚓咔嚓~', toast: '吃得津津有味，饱食度 UP！' },
  { id: 'carrot', emoji: '🥕', name: '胡萝卜', reaction: '兔兔最爱！甜甜的~', toast: '啃得嘎嘣脆，心情也变好了！' },
  { id: 'apple', emoji: '🍎', name: '苹果', reaction: '唔姆唔姆…好甜！', toast: '苹果汁水满满，开心转圈圈！' },
  { id: 'fish', emoji: '🐟', name: '小鱼干', reaction: '喵~ 这个最棒！', toast: '小鱼干万岁！瞬间精神满满！' },
  { id: 'cookie', emoji: '🍪', name: '小饼干', reaction: '还要还要！🍪', toast: '饼干碎屑满天飞，超满足！' },
] as const;

export const PET_PLAY_OPTIONS = [
  { id: 'ball', emoji: '🎾', name: '抛接球', reaction: '接住啦！再来~', toast: '蹦蹦跳跳接球，心情 +20！' },
  { id: 'yoyo', emoji: '🪀', name: '溜溜球', reaction: '转呀转…晕乎乎~', toast: '溜溜球转不停，玩得不亦乐乎！' },
  { id: 'sing', emoji: '🎵', name: '唱歌', reaction: '啦啦啦~ ♪♪', toast: '一起唱歌，金币 +10！' },
] as const;

export function getDressReaction(action: 'equip' | 'unequip' | 'buy', name: string) {
  switch (action) {
    case 'equip':
      return { reaction: `哇！${name} 好适合我！`, toast: `穿戴「${name}」，颜值爆表 ✨` };
    case 'buy':
      return { reaction: '新衣裳！太开心啦~', toast: `购入「${name}」，立刻试穿！` };
    case 'unequip':
      return { reaction: '换回便装，轻松自在~', toast: '卸下装扮，回归可爱本色' };
  }
}

export function getInteractionDuration(interaction: { kind: string }): number {
  return interaction.kind === 'dress' ? 1500 : 1300;
}
