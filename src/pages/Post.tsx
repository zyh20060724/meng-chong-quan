import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PetAvatar from '../components/PetAvatar';
import { POST_REWARD_COINS } from '../constants';
import './Post.css';

type Visibility = 'public' | 'friends' | 'private';

export default function PostPage() {
  const { currentUser, dispatch } = useApp();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!content.trim() && !imagePreview) return;
    dispatch({
      type: 'ADD_POST',
      post: {
        authorId: currentUser.id,
        content: content.trim(),
        imageUrl: imagePreview ?? undefined,
        visibility,
      },
    });
    setRewardMsg(`发布成功！获得 ${POST_REWARD_COINS} 金币 💰`);
    setTimeout(() => navigate('/'), 1200);
  };

  const visibilityOptions: { value: Visibility; label: string; icon: string; desc: string }[] = [
    { value: 'public', label: '公开', icon: '🌍', desc: '所有人可见' },
    { value: 'friends', label: '好友', icon: '👥', desc: '仅好友可见' },
    { value: 'private', label: '私密', icon: '🔒', desc: '仅自己可见' },
  ];

  return (
    <div className="post-page">
      <header className="page-header">
        <h1>✏️ 发文</h1>
        <p className="page-header__sub">分享你和宠物的故事 · 发文奖励 {POST_REWARD_COINS} 金币</p>
      </header>

      {rewardMsg && <div className="post-page__reward toast">{rewardMsg}</div>}

      <div className="post-page__composer sketch-box">
        <div className="post-page__author">
          <PetAvatar petType={currentUser.petType} size="md" />
          <div>
            <strong>{currentUser.nickname}</strong>
            <span> 的 {currentUser.petName}</span>
          </div>
        </div>

        <textarea
          className="post-page__textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="今天发生了什么有趣的事？"
          rows={5}
          maxLength={500}
        />
        <div className="post-page__counter">{content.length}/500</div>

        {imagePreview && (
          <div className="post-page__preview">
            <img src={imagePreview} alt="预览" />
            <button className="post-page__remove-img" onClick={() => setImagePreview(null)}>✕</button>
          </div>
        )}

        <div className="post-page__tools">
          <button className="post-page__tool-btn" onClick={() => fileRef.current?.click()}>
            📷 添加图片
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
        </div>

        <div className="post-page__visibility">
          <span className="post-page__visibility-label">可见范围</span>
          <div className="post-page__visibility-options">
            {visibilityOptions.map(opt => (
              <button
                key={opt.value}
                className={`post-page__vis-btn${visibility === opt.value ? ' post-page__vis-btn--active' : ''}`}
                onClick={() => setVisibility(opt.value)}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                <small>{opt.desc}</small>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn--primary btn--large"
          disabled={!content.trim() && !imagePreview}
          onClick={handleSubmit}
        >
          发布动态 🎉
        </button>
      </div>
    </div>
  );
}
