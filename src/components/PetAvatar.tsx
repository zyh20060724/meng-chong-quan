import type { PetType } from '../types';
import { getPetEmoji, getPetColor } from '../constants';
import './PetAvatar.css';

interface PetAvatarProps {
  petType: PetType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  outfit?: string | null;
  mood?: number;
  showMood?: boolean;
  /** avatar=圆形头像，flat=小窝内简化精灵 */
  variant?: 'avatar' | 'flat';
  facing?: 'left' | 'right';
}

export default function PetAvatar({
  petType,
  size = 'md',
  outfit,
  mood,
  showMood,
  variant = 'avatar',
  facing = 'right',
}: PetAvatarProps) {
  const emoji = getPetEmoji(petType);
  const color = getPetColor(petType);

  if (variant === 'flat') {
    return (
      <div
        className={`pet-sprite pet-sprite--${size}${facing === 'left' ? ' pet-sprite--left' : ''}`}
      >
        <span className="pet-sprite__shadow" aria-hidden />
        {outfit && <span className="pet-sprite__outfit">{outfit}</span>}
        <span className="pet-sprite__emoji">{emoji}</span>
      </div>
    );
  }

  return (
    <div className={`pet-avatar pet-avatar--${size}`} style={{ '--pet-color': color } as React.CSSProperties}>
      <div className="pet-avatar__circle">
        <span className="pet-avatar__emoji">{emoji}</span>
        {outfit && <span className="pet-avatar__outfit">{outfit}</span>}
      </div>
      {showMood && mood !== undefined && (
        <div className="pet-avatar__mood">
          {mood >= 80 ? '😊' : mood >= 50 ? '😐' : '😢'}
        </div>
      )}
    </div>
  );
}
