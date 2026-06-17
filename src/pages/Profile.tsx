import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PetAvatar from '../components/PetAvatar';
import PostCard from '../components/PostCard';
import { getPetEmoji } from '../constants';
import './Profile.css';

type Section = 'info' | 'posts' | 'settings';

export default function Profile() {
  const { currentUser, state, dispatch } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('info');
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname ?? '');
  const [petName, setPetName] = useState(currentUser?.petName ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');

  if (!currentUser) return null;

  const myPosts = state.posts
    .filter(p => p.authorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_USER',
      userId: currentUser.id,
      updates: {
        nickname: nickname.trim() || currentUser.nickname,
        petName: petName.trim() || currentUser.petName,
        bio: bio.trim(),
      },
    });
    setEditing(false);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/welcome');
  };

  const handleReset = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem('pet-pals-state');
      window.location.reload();
    }
  };

  return (
    <div className="profile">
      <header className="profile__header sketch-box">
        <PetAvatar petType={currentUser.petType} size="xl" mood={currentUser.petMood} showMood />
        <h2>{currentUser.nickname}</h2>
        <p className="profile__user-code">ID: {currentUser.userCode}</p>
        <p className="profile__pet-info">
          {getPetEmoji(currentUser.petType)} {currentUser.petName} · Lv.{currentUser.petLevel}
        </p>
        {currentUser.bio && <p className="profile__bio">{currentUser.bio}</p>}
        <div className="profile__stats">
          <div><strong>{myPosts.length}</strong><span>动态</span></div>
          <div><strong>{currentUser.coins}</strong><span>金币</span></div>
          <div><strong>{currentUser.furniture.length}</strong><span>家具</span></div>
        </div>
      </header>

      <div className="profile__tabs">
        {([
          { key: 'info' as Section, label: '资料' },
          { key: 'posts' as Section, label: '我的动态' },
          { key: 'settings' as Section, label: '设置' },
        ]).map(t => (
          <button
            key={t.key}
            className={`profile__tab${section === t.key ? ' profile__tab--active' : ''}`}
            onClick={() => setSection(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'info' && (
        <div className="profile__section sketch-box">
          {editing ? (
            <>
              <label className="profile__label">昵称</label>
              <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={12} />
              <label className="profile__label">宠物名字</label>
              <input className="input" value={petName} onChange={e => setPetName(e.target.value)} maxLength={10} />
              <label className="profile__label">个人简介</label>
              <textarea
                className="profile__textarea"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="介绍一下自己和宠物吧~"
                maxLength={100}
                rows={3}
              />
              <div className="profile__edit-actions">
                <button className="btn btn--primary" onClick={handleSave}>保存</button>
                <button className="btn btn--ghost" onClick={() => setEditing(false)}>取消</button>
              </div>
            </>
          ) : (
            <>
              <div className="profile__info-row">
                <span>用户 ID</span>
                <strong className="profile__code">{currentUser.userCode}</strong>
              </div>
              <div className="profile__info-row">
                <span>昵称</span><strong>{currentUser.nickname}</strong>
              </div>
              <div className="profile__info-row">
                <span>宠物</span><strong>{getPetEmoji(currentUser.petType)} {currentUser.petName}</strong>
              </div>
              <div className="profile__info-row">
                <span>等级</span><strong>Lv.{currentUser.petLevel}</strong>
              </div>
              <div className="profile__info-row">
                <span>简介</span><strong>{currentUser.bio || '暂无简介'}</strong>
              </div>
              <button className="btn btn--primary" onClick={() => {
                setNickname(currentUser.nickname);
                setPetName(currentUser.petName);
                setBio(currentUser.bio);
                setEditing(true);
              }}>
                编辑资料 ✏️
              </button>
            </>
          )}
        </div>
      )}

      {section === 'posts' && (
        <div className="profile__posts">
          {myPosts.length === 0 ? (
            <div className="empty-state sketch-box">
              <span className="empty-state__emoji">📝</span>
              <p>还没有发布动态</p>
            </div>
          ) : (
            myPosts.map(post => <PostCard key={post.id} post={post} showComments={false} />)
          )}
        </div>
      )}

      {section === 'settings' && (
        <div className="profile__section sketch-box">
          <h3>⚙️ 设置</h3>
          <div className="profile__setting-item">
            <span>通知提醒</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle__slider" />
            </label>
          </div>
          <div className="profile__setting-item">
            <span>深色模式</span>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle__slider" />
            </label>
          </div>
          <div className="profile__setting-item">
            <span>隐私保护</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle__slider" />
            </label>
          </div>
          <hr className="profile__divider" />
          <button className="btn btn--ghost" onClick={handleLogout}>切换账号</button>
          <button className="btn btn--danger" onClick={handleReset}>清除所有数据</button>
          <p className="profile__version">萌宠圈 v1.0.0</p>
        </div>
      )}
    </div>
  );
}
