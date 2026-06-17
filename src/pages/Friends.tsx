import { useState } from 'react';

import { useApp } from '../context/AppContext';

import PostCard from '../components/PostCard';

import PetAvatar from '../components/PetAvatar';

import FriendMiniGame from '../components/FriendMiniGame';

import { formatTime } from '../constants';

import { CAPTAIN_ID, isCaptain } from '../constants/captain';

import type { User } from '../types';

import './Friends.css';

import '../components/FriendMiniGame.css';



type Tab = 'friends' | 'chat' | 'add' | 'games';

type GameType = 'guess' | 'race' | 'memory';



function CaptainCard({

  captain,

  compact,

  onChat,

  onPlay,

}: {

  captain: User;

  compact?: boolean;

  onChat: () => void;

  onPlay: (game: GameType) => void;

}) {

  return (

    <div className={`friends__captain-card sketch-box${compact ? ' friends__captain-card--compact' : ''}`}>

      <PetAvatar petType={captain.petType} size="md" outfit="👑" />

      <div className="friends__captain-info">

        <span className="friends__captain-badge">官方好友</span>

        <strong>{captain.nickname}</strong>

        <span>ID: {captain.userCode} · {captain.bio.slice(0, 18)}…</span>

      </div>

      <div className="friends__captain-actions">

        <button className="btn btn--small btn--primary" onClick={onChat}>💬 私聊</button>

        {(['guess', 'race', 'memory'] as const).map(game => (

          <button key={game} className="btn btn--small" onClick={() => onPlay(game)}>

            {game === 'guess' ? '🎯' : game === 'race' ? '🏃' : '🧩'}

          </button>

        ))}

      </div>

    </div>

  );

}



export default function Friends() {

  const { state, currentUser, getUser, getUserByCode, getFriends, dispatch, isFriend } = useApp();

  const [tab, setTab] = useState<Tab>('friends');

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const [messageText, setMessageText] = useState('');

  const [searchId, setSearchId] = useState('');

  const [searchResult, setSearchResult] = useState<ReturnType<typeof getUserByCode>>(undefined);

  const [searchError, setSearchError] = useState('');

  const [activeGame, setActiveGame] = useState<{ friendId: string; gameType: GameType } | null>(null);

  const [toast, setToast] = useState('');



  if (!currentUser) return null;



  const captain = getUser(CAPTAIN_ID);

  const friends = getFriends(currentUser.id).sort((a, b) => {

    if (isCaptain(a.id)) return -1;

    if (isCaptain(b.id)) return 1;

    return 0;

  });

  const otherFriends = friends.filter(f => !isCaptain(f.id));



  const showToast = (msg: string) => {

    setToast(msg);

    setTimeout(() => setToast(''), 2500);

  };



  const friendPosts = state.posts

    .filter(p => {

      if (p.visibility === 'private' && p.authorId !== currentUser.id) return false;

      return friends.some(f => f.id === p.authorId) || p.authorId === currentUser.id;

    })

    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  const chatMessages = selectedFriend

    ? state.messages

        .filter(

          m =>

            (m.fromId === currentUser.id && m.toId === selectedFriend) ||

            (m.fromId === selectedFriend && m.toId === currentUser.id)

        )

        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    : [];



  const pendingRequests = state.friendRequests.filter(

    r => r.toId === currentUser.id && r.status === 'pending'

  );



  const pendingInvites = state.gameInvites.filter(

    inv => inv.toId === currentUser.id && inv.status === 'pending'

  );



  const sendMessage = () => {

    if (!messageText.trim() || !selectedFriend) return;

    dispatch({

      type: 'SEND_MESSAGE',

      message: { fromId: currentUser.id, toId: selectedFriend, content: messageText.trim() },

    });

    setMessageText('');

  };



  const handleSearch = () => {

    setSearchError('');

    setSearchResult(undefined);

    const code = searchId.trim();

    if (!code) {

      setSearchError('请输入用户 ID');

      return;

    }

    if (code.toUpperCase() === currentUser.userCode.toUpperCase()) {

      setSearchError('不能添加自己哦');

      return;

    }

    if (code.toUpperCase() === 'MC000001') {

      setSearchError('萌宠圈队长已是你的官方好友啦~');

      return;

    }

    const user = getUserByCode(code);

    if (!user) {

      setSearchError('未找到该 ID 的用户');

      return;

    }

    if (isFriend(currentUser.id, user.id)) {

      setSearchError('你们已经是好友了');

      return;

    }

    setSearchResult(user);

  };



  const openCaptainChat = () => {

    setTab('chat');

    setSelectedFriend(CAPTAIN_ID);

    dispatch({ type: 'MARK_READ', userId: currentUser.id, friendId: CAPTAIN_ID });

  };



  const openGame = (friendId: string, gameType: GameType) => {

    if (isCaptain(friendId)) {

      setActiveGame({ friendId, gameType });

      return;

    }

    dispatch({ type: 'SEND_GAME_INVITE', fromId: currentUser.id, toId: friendId, gameType: gameType });

    showToast('游戏邀请已发送~');

  };



  const handleGameWin = (coins: number, message: string) => {

    dispatch({ type: 'GUESS_CORRECT', userId: currentUser.id, coins });

    showToast(`${message} 获得 ${coins} 金币 💰`);

    setActiveGame(null);

  };



  const gameFriend = activeGame ? getUser(activeGame.friendId) : null;



  const tabs: { key: Tab; label: string; badge?: number }[] = [

    { key: 'friends', label: '动态' },

    { key: 'chat', label: '私聊' },

    { key: 'add', label: '加好友', badge: pendingRequests.length || undefined },

    { key: 'games', label: '小游戏', badge: pendingInvites.length || undefined },

  ];



  return (

    <div className="friends">

      {toast && <div className="friends__toast">{toast}</div>}



      <header className="page-header">

        <h1>👫 好友</h1>

        <p className="page-header__sub">{friends.length} 位好友 · 我的 ID: {currentUser.userCode}</p>

      </header>



      {captain && (

        <CaptainCard

          captain={captain}

          onChat={openCaptainChat}

          onPlay={game => setActiveGame({ friendId: CAPTAIN_ID, gameType: game })}

        />

      )}



      <div className="friends__tabs">

        {tabs.map(t => (

          <button

            key={t.key}

            className={`friends__tab${tab === t.key ? ' friends__tab--active' : ''}`}

            onClick={() => setTab(t.key)}

          >

            {t.label}

            {t.badge ? <span className="badge">{t.badge}</span> : null}

          </button>

        ))}

      </div>



      {tab === 'friends' && (

        <div className="friends__content">

          {friendPosts.length === 0 ? (

            <div className="empty-state sketch-box">

              <p>还没有动态，去看看队长的分享吧~</p>

            </div>

          ) : (

            friendPosts.map(post => <PostCard key={post.id} post={post} />)

          )}

        </div>

      )}



      {tab === 'chat' && (

        <div className="friends__chat">

          <div className="friends__chat-list">

            {friends.map(f => {

              const unread = state.messages.filter(

                m => m.fromId === f.id && m.toId === currentUser.id && !m.read

              ).length;

              return (

                <button

                  key={f.id}

                  className={`friends__chat-item sketch-box${selectedFriend === f.id ? ' friends__chat-item--active' : ''}${isCaptain(f.id) ? ' friends__chat-item--captain' : ''}`}

                  onClick={() => {

                    setSelectedFriend(f.id);

                    dispatch({ type: 'MARK_READ', userId: currentUser.id, friendId: f.id });

                  }}

                >

                  <PetAvatar petType={f.petType} size="md" outfit={isCaptain(f.id) ? '👑' : undefined} />

                  <div className="friends__chat-info">

                    <strong>{f.nickname}</strong>

                    <span>ID: {f.userCode}</span>

                  </div>

                  {unread > 0 && <span className="badge">{unread}</span>}

                </button>

              );

            })}

          </div>



          {selectedFriend && (

            <div className="friends__chat-window sketch-box">

              <div className="friends__messages">

                {chatMessages.length === 0 && isCaptain(selectedFriend) && (

                  <div className="chat-bubble">

                    {captain && <PetAvatar petType={captain.petType} size="sm" outfit="👑" />}

                    <div className="chat-bubble__content">

                      <p>随时找我聊天~ 试试发送「游戏」「签到」「宠物」等关键词 🐼</p>

                    </div>

                  </div>

                )}

                {chatMessages.map(m => {

                  const isMine = m.fromId === currentUser.id;

                  const sender = getUser(m.fromId);

                  return (

                    <div key={m.id} className={`chat-bubble${isMine ? ' chat-bubble--mine' : ''}`}>

                      {!isMine && sender && (

                        <PetAvatar petType={sender.petType} size="sm" outfit={isCaptain(sender.id) ? '👑' : undefined} />

                      )}

                      <div className="chat-bubble__content">

                        <p>{m.content}</p>

                        <time>{formatTime(m.createdAt)}</time>

                      </div>

                    </div>

                  );

                })}

              </div>

              <div className="friends__chat-input">

                <input

                  value={messageText}

                  onChange={e => setMessageText(e.target.value)}

                  placeholder={isCaptain(selectedFriend) ? '和队长聊聊…' : '输入消息...'}

                  onKeyDown={e => e.key === 'Enter' && sendMessage()}

                />

                <button className="btn btn--small" onClick={sendMessage}>发送</button>

              </div>

            </div>

          )}

        </div>

      )}



      {tab === 'add' && (

        <div className="friends__add">

          {pendingRequests.length > 0 && (

            <section className="friends__section">

              <h3>好友请求</h3>

              {pendingRequests.map(req => {

                const from = getUser(req.fromId);

                if (!from) return null;

                return (

                  <div key={req.id} className="friends__request sketch-box">

                    <PetAvatar petType={from.petType} size="md" />

                    <div>

                      <strong>{from.nickname}</strong>

                      <p>ID: {from.userCode}</p>

                    </div>

                    <div className="friends__request-actions">

                      <button className="btn btn--small btn--primary" onClick={() => dispatch({ type: 'ACCEPT_FRIEND_REQUEST', requestId: req.id })}>接受</button>

                      <button className="btn btn--small btn--ghost" onClick={() => dispatch({ type: 'REJECT_FRIEND_REQUEST', requestId: req.id })}>拒绝</button>

                    </div>

                  </div>

                );

              })}

            </section>

          )}



          <section className="friends__section">

            <h3>搜索 ID 添加好友</h3>

            <p className="friends__hint friends__hint--left">输入对方的用户 ID（如 MC100001）</p>

            <div className="friends__search-row">

              <input

                className="input"

                value={searchId}

                onChange={e => setSearchId(e.target.value.toUpperCase())}

                placeholder="输入用户 ID..."

                onKeyDown={e => e.key === 'Enter' && handleSearch()}

              />

              <button className="btn btn--small btn--primary" onClick={handleSearch}>搜索</button>

            </div>

            {searchError && <p className="friends__search-error">{searchError}</p>}

            {searchResult && (

              <div className="friends__user-card sketch-box friends__search-result">

                <PetAvatar petType={searchResult.petType} size="lg" />

                <strong>{searchResult.nickname}</strong>

                <span className="friends__user-id">ID: {searchResult.userCode}</span>

                <span className="friends__user-pet">{searchResult.petName}</span>

                {(() => {

                  const sent = state.friendRequests.some(

                    r => r.fromId === currentUser.id && r.toId === searchResult.id && r.status === 'pending'

                  );

                  return (

                    <button

                      className="btn btn--small"

                      disabled={sent}

                      onClick={() => {

                        dispatch({ type: 'SEND_FRIEND_REQUEST', fromId: currentUser.id, toId: searchResult.id });

                        setSearchError('');

                      }}

                    >

                      {sent ? '已发送请求' : '+ 加好友'}

                    </button>

                  );

                })()}

              </div>

            )}

          </section>



          <section className="friends__section">

            <h3>推荐用户</h3>

            <div className="friends__user-grid">

              {state.users

                .filter(u => u.id !== currentUser.id && u.id !== CAPTAIN_ID && !isFriend(currentUser.id, u.id))

                .slice(0, 4)

                .map(u => {

                  const sent = state.friendRequests.some(

                    r => r.fromId === currentUser.id && r.toId === u.id && r.status === 'pending'

                  );

                  return (

                    <div key={u.id} className="friends__user-card sketch-box">

                      <PetAvatar petType={u.petType} size="lg" />

                      <strong>{u.nickname}</strong>

                      <span className="friends__user-id">{u.userCode}</span>

                      <button

                        className="btn btn--small"

                        disabled={sent}

                        onClick={() => dispatch({ type: 'SEND_FRIEND_REQUEST', fromId: currentUser.id, toId: u.id })}

                      >

                        {sent ? '已发送' : '+ 加好友'}

                      </button>

                    </div>

                  );

                })}

            </div>

          </section>

        </div>

      )}



      {tab === 'games' && (

        <div className="friends__games">

          {captain && (

            <section className="friends__section">

              <h3>和队长开玩</h3>

              <CaptainCard

                captain={captain}

                compact

                onChat={openCaptainChat}

                onPlay={game => setActiveGame({ friendId: CAPTAIN_ID, gameType: game })}

              />

            </section>

          )}



          {pendingInvites.length > 0 && (

            <section className="friends__section">

              <h3>游戏邀请</h3>

              {pendingInvites.map(inv => {

                const from = getUser(inv.fromId);

                if (!from) return null;

                const gameNames = { guess: '猜宠物', race: '宠物赛跑', memory: '记忆配对' };

                return (

                  <div key={inv.id} className="friends__request sketch-box">

                    <PetAvatar petType={from.petType} size="md" />

                    <div>

                      <strong>{from.nickname}</strong>

                      <p>邀请你玩 {gameNames[inv.gameType]}</p>

                    </div>

                    <div className="friends__request-actions">

                      <button

                        className="btn btn--small btn--primary"

                        onClick={() => {

                          dispatch({ type: 'RESPOND_GAME_INVITE', inviteId: inv.id, accept: true });

                          setActiveGame({ friendId: inv.fromId, gameType: inv.gameType });

                        }}

                      >

                        接受

                      </button>

                      <button className="btn btn--small btn--ghost" onClick={() => dispatch({ type: 'RESPOND_GAME_INVITE', inviteId: inv.id, accept: false })}>拒绝</button>

                    </div>

                  </div>

                );

              })}

            </section>

          )}



          <section className="friends__section">

            <h3>邀请好友玩游戏</h3>

            {otherFriends.length === 0 ? (

              <p className="friends__hint">除了队长，还可以搜索 ID 添加更多好友~</p>

            ) : (

              otherFriends.map(f => (

                <div key={f.id} className="friends__game-invite sketch-box">

                  <PetAvatar petType={f.petType} size="md" />

                  <strong>{f.nickname}</strong>

                  <div className="friends__game-btns">

                    {(['guess', 'race', 'memory'] as const).map(game => (

                      <button

                        key={game}

                        className="btn btn--small"

                        onClick={() => openGame(f.id, game)}

                      >

                        {game === 'guess' ? '🎯猜宠物' : game === 'race' ? '🏃赛跑' : '🧩记忆'}

                      </button>

                    ))}

                  </div>

                </div>

              ))

            )}

          </section>



          <section className="friends__section">

            <h3>小游戏大厅</h3>

            <p className="friends__hint friends__hint--left">五子棋请前往「宠物」界面与宠物对弈</p>

            <div className="friends__game-cards">

              <div className="game-card sketch-box">

                <span>🎯</span>

                <h4>猜宠物</h4>

                <p>看线索猜是什么宠物</p>

              </div>

              <div className="game-card sketch-box">

                <span>🏃</span>

                <h4>宠物赛跑</h4>

                <p>比比谁的宠物跑得快</p>

              </div>

              <div className="game-card sketch-box">

                <span>🧩</span>

                <h4>记忆配对</h4>

                <p>翻开卡片找到相同宠物</p>

              </div>

            </div>

          </section>

        </div>

      )}



      {activeGame && gameFriend && (

        <FriendMiniGame

          friend={gameFriend}

          currentUserPet={currentUser.petType}

          gameType={activeGame.gameType}

          onClose={() => setActiveGame(null)}

          onWin={handleGameWin}

        />

      )}

    </div>

  );

}


