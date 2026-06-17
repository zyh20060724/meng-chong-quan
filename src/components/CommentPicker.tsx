import { useState } from 'react';
import { COMMENT_EMOJI_CATEGORIES, COMMENT_STICKER_PACKS } from '../constants';
import './CommentPicker.css';

interface CommentPickerProps {
  selectedStickers: string[];
  onEmojiPick: (emoji: string) => void;
  onStickerToggle: (stickerId: string) => void;
}

export default function CommentPicker({
  selectedStickers,
  onEmojiPick,
  onStickerToggle,
}: CommentPickerProps) {
  const [tab, setTab] = useState<'emoji' | 'sticker'>('emoji');
  const [emojiCategory, setEmojiCategory] = useState(COMMENT_EMOJI_CATEGORIES[0].id);
  const [stickerPack, setStickerPack] = useState(COMMENT_STICKER_PACKS[0].id);

  const activeEmojis = COMMENT_EMOJI_CATEGORIES.find(c => c.id === emojiCategory)?.emojis ?? [];
  const activePack = COMMENT_STICKER_PACKS.find(p => p.id === stickerPack);

  return (
    <div className="comment-picker">
      <div className="comment-picker__tabs">
        <button
          type="button"
          className={`comment-picker__tab${tab === 'emoji' ? ' comment-picker__tab--active' : ''}`}
          onClick={() => setTab('emoji')}
        >
          😊 表情
        </button>
        <button
          type="button"
          className={`comment-picker__tab${tab === 'sticker' ? ' comment-picker__tab--active' : ''}`}
          onClick={() => setTab('sticker')}
        >
          🎨 表情包
        </button>
      </div>

      {tab === 'emoji' ? (
        <>
          <div className="comment-picker__categories">
            {COMMENT_EMOJI_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`comment-picker__cat${emojiCategory === cat.id ? ' comment-picker__cat--active' : ''}`}
                onClick={() => setEmojiCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="comment-picker__grid comment-picker__grid--emoji">
            {activeEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                className="comment-picker__emoji-btn"
                onClick={() => onEmojiPick(emoji)}
                title="插入表情"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="comment-picker__categories">
            {COMMENT_STICKER_PACKS.map(pack => (
              <button
                key={pack.id}
                type="button"
                className={`comment-picker__cat${stickerPack === pack.id ? ' comment-picker__cat--active' : ''}`}
                onClick={() => setStickerPack(pack.id)}
              >
                {pack.label}
              </button>
            ))}
          </div>
          <div className="comment-picker__grid comment-picker__grid--sticker">
            {activePack?.stickers.map(sticker => {
              const selected = selectedStickers.includes(sticker.id);
              return (
                <button
                  key={sticker.id}
                  type="button"
                  className={`comment-picker__sticker${selected ? ' comment-picker__sticker--active' : ''}`}
                  onClick={() => onStickerToggle(sticker.id)}
                  title={sticker.label}
                >
                  <span className="comment-picker__sticker-emoji">{sticker.emoji}</span>
                  <span className="comment-picker__sticker-label">{sticker.label}</span>
                </button>
              );
            })}
          </div>
          <p className="comment-picker__hint">点击选择表情包，可搭配文字一起发送（最多 3 个）</p>
        </>
      )}
    </div>
  );
}
