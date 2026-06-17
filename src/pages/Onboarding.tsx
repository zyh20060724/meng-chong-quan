import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PET_TYPES } from '../constants';
import type { PetType } from '../types';
import PetAvatar from '../components/PetAvatar';
import './Onboarding.css';

export default function Onboarding() {
  const { dispatch, state } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [petType, setPetType] = useState<PetType>('cat');
  const [petName, setPetName] = useState('');

  const handleRegister = () => {
    if (!nickname.trim() || !petName.trim()) return;
    dispatch({ type: 'REGISTER', nickname: nickname.trim(), petType, petName: petName.trim() });
    navigate('/');
  };

  const handleLogin = (userId: string) => {
    dispatch({ type: 'LOGIN', userId });
    navigate('/');
  };

  if (step === 0) {
    return (
      <div className="onboarding">
        <div className="onboarding__hero sketch-box">
          <h1 className="onboarding__title">萌宠圈</h1>
          <p className="onboarding__subtitle">用宠物形象，结交新朋友 ✨</p>
          <div className="onboarding__pets-row">
            {PET_TYPES.slice(0, 5).map(p => (
              <span key={p.type} className="onboarding__pet-bounce">{p.emoji}</span>
            ))}
          </div>
        </div>

        <button className="btn btn--primary btn--large" onClick={() => setStep(1)}>
          创建新账号 🎉
        </button>

        {state.users.length > 0 && (
          <div className="onboarding__existing">
            <p className="onboarding__divider">或选择已有账号</p>
            <div className="onboarding__user-list">
              {state.users.map(u => (
                <button key={u.id} className="onboarding__user-btn sketch-box" onClick={() => handleLogin(u.id)}>
                  <PetAvatar petType={u.petType} size="md" />
                  <span>{u.nickname}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="onboarding">
      <div className="onboarding__steps">
        {[0, 1, 2].map(i => (
          <div key={i} className={`onboarding__step-dot${step - 1 >= i ? ' onboarding__step-dot--active' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="onboarding__panel sketch-box">
          <h2>给自己取个昵称</h2>
          <input
            className="input"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="例如：小橘、旺财..."
            maxLength={12}
            autoFocus
          />
          <button className="btn btn--primary" disabled={!nickname.trim()} onClick={() => setStep(2)}>
            下一步 →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding__panel sketch-box">
          <h2>选择你的宠物形象</h2>
          <p className="onboarding__hint">这将代表你在社区中的样子</p>
          <div className="onboarding__pet-grid">
            {PET_TYPES.map(p => (
              <button
                key={p.type}
                className={`onboarding__pet-option${petType === p.type ? ' onboarding__pet-option--selected' : ''}`}
                onClick={() => setPetType(p.type)}
                style={{ '--pet-color': p.color } as React.CSSProperties}
              >
                <span className="onboarding__pet-emoji">{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
          <PetAvatar petType={petType} size="xl" />
          <button className="btn btn--primary" onClick={() => setStep(3)}>
            下一步 →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding__panel sketch-box">
          <h2>给宠物取名字</h2>
          <PetAvatar petType={petType} size="lg" />
          <input
            className="input"
            value={petName}
            onChange={e => setPetName(e.target.value)}
            placeholder="例如：橘橘、豆豆..."
            maxLength={10}
            autoFocus
          />
          <div className="onboarding__summary">
            <p>🎊 欢迎 <strong>{nickname}</strong></p>
            <p>你的小伙伴 <strong>{petName || '???'}</strong> 已就绪！</p>
          </div>
          <button className="btn btn--primary btn--large" disabled={!petName.trim()} onClick={handleRegister}>
            开始探索 🚀
          </button>
          <button className="btn btn--ghost" onClick={() => setStep(2)}>← 返回</button>
        </div>
      )}
    </div>
  );
}
