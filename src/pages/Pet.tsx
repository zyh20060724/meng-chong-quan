import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PetAvatar from '../components/PetAvatar';
import PetNest from '../components/PetNest';
import GomokuGame from '../components/GomokuGame';
import {
  FURNITURE_SHOP, OUTFIT_SHOP, PET_ENCYCLOPEDIA, GUESS_QUESTIONS,
  getPetEmoji, CHECKIN_COIN_REWARDS, CHECKIN_DAY_LABELS,
  getTodayDateStr, getYesterdayDateStr, GUESS_CORRECT_COINS,
} from '../constants';
import {
  PET_FEED_OPTIONS, PET_PLAY_OPTIONS, getDressReaction, getInteractionDuration,
} from '../constants/petInteractions';
import type { PetInteraction } from '../types';
import './Pet.css';

type Tab = 'home' | 'checkin' | 'gomoku' | 'guess' | 'book';
type HomePanel = 'feed' | 'play' | 'shop' | 'dress';

function getCheckInProgress(user: { checkInStreak: number; lastCheckInDate: string }) {
  const today = getTodayDateStr();
  const checkedToday = user.lastCheckInDate === today;
  if (checkedToday) {
    if (user.checkInStreak === 0) return { completed: 7, checkedToday: true };
    return { completed: user.checkInStreak, checkedToday: true };
  }
  if (user.lastCheckInDate === getYesterdayDateStr()) {
    return { completed: user.checkInStreak, checkedToday: false };
  }
  return { completed: 0, checkedToday: false };
}

function shuffleOptions(options: string[]): string[] {
  return [...options].sort(() => Math.random() - 0.5);
}

export default function PetPage() {
  const { currentUser, dispatch, performCheckIn, hasCheckedInToday } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const [homePanel, setHomePanel] = useState<HomePanel>('feed');
  const [guessIndex, setGuessIndex] = useState(0);
  const [guessOptions, setGuessOptions] = useState<string[]>(() =>
    shuffleOptions(GUESS_QUESTIONS[0].options)
  );
  const [guessFeedback, setGuessFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [interaction, setInteraction] = useState<PetInteraction>(null);
  const [toast, setToast] = useState('');

  if (!currentUser) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const triggerInteraction = (payload: PetInteraction) => {
    setInteraction(payload);
    const duration = payload ? getInteractionDuration(payload) : 0;
    setTimeout(() => setInteraction(null), duration);
  };

  const outfitEmojis: Record<string, string> = {
    hat1: '🎩', hat2: '🎀', scarf: '🧣', glasses: '👓', crown: '👑',
  };

  const equippedEmoji = currentUser.equippedOutfit
    ? outfitEmojis[currentUser.equippedOutfit]
    : null;

  const checkInProgress = getCheckInProgress(currentUser);
  const checkedToday = hasCheckedInToday(currentUser);

  const handleCheckIn = () => {
    if (checkedToday) {
      showToast('今天已经签到过啦，明天再来~');
      return;
    }
    const result = performCheckIn(currentUser.id);
    if (!result) {
      showToast('签到失败，请稍后再试');
      return;
    }
    if (result.type === 'coins') {
      showToast(`签到成功！第${result.day}天，获得 ${result.amount} 金币 💰`);
    } else {
      const typeLabel = result.itemType === 'furniture' ? '家具' : '服装';
      showToast(`连续签到7天！获得${typeLabel}「${result.itemName}」🎁`);
    }
  };

  const handleFeed = (food: typeof PET_FEED_OPTIONS[number]) => {
    if (currentUser.coins < 5) {
      showToast('金币不足，先去签到或玩游戏赚金币吧！');
      return;
    }
    dispatch({ type: 'FEED_PET', userId: currentUser.id });
    triggerInteraction({ kind: 'feed', foodId: food.id, emoji: food.emoji, name: food.name });
    showToast(`${currentUser.petName} 吃了${food.name}！${food.toast}`);
  };

  const handlePlay = (game: typeof PET_PLAY_OPTIONS[number]) => {
    dispatch({ type: 'PLAY_WITH_PET', userId: currentUser.id });
    triggerInteraction({ kind: 'play', gameId: game.id, emoji: game.emoji, name: game.name });
    showToast(`和 ${currentUser.petName} ${game.name}！${game.toast}`);
  };

  const handleDress = (action: 'equip' | 'unequip' | 'buy', item: { id: string; emoji: string; name: string }) => {
    const { reaction, toast } = getDressReaction(action, item.name);
    triggerInteraction({
      kind: 'dress',
      action,
      outfitId: item.id,
      emoji: item.emoji,
      name: item.name,
    });
    showToast(`${currentUser.petName}：${reaction} ${toast}`);
  };

  const nextGuessQuestion = () => {
    const next = (guessIndex + 1) % GUESS_QUESTIONS.length;
    setGuessIndex(next);
    setGuessOptions(shuffleOptions(GUESS_QUESTIONS[next].options));
    setGuessFeedback(null);
  };

  const handleGuess = (option: string) => {
    if (guessFeedback) return;
    const q = GUESS_QUESTIONS[guessIndex];
    if (option === q.answer) {
      setGuessFeedback('correct');
      dispatch({ type: 'GUESS_CORRECT', userId: currentUser.id, coins: GUESS_CORRECT_COINS });
      showToast(`猜对了！获得 ${GUESS_CORRECT_COINS} 金币 🎉`);
      setTimeout(nextGuessQuestion, 1200);
    } else {
      setGuessFeedback('wrong');
      showToast('不对哦，再想想~');
      setTimeout(() => setGuessFeedback(null), 800);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: '小窝', icon: '🏡' },
    { key: 'checkin', label: '签到', icon: '📅' },
    { key: 'gomoku', label: '五子棋', icon: '⚫' },
    { key: 'guess', label: '你问我猜', icon: '💡' },
    { key: 'book', label: '图鉴', icon: '📖' },
  ];

  const homePanels: { key: HomePanel; label: string; icon: string }[] = [
    { key: 'feed', label: '喂食', icon: '🍖' },
    { key: 'play', label: '玩耍', icon: '🎾' },
    { key: 'shop', label: '家具', icon: '🛋️' },
    { key: 'dress', label: '装扮', icon: '👗' },
  ];

  const unlockedEntries = PET_ENCYCLOPEDIA.filter(e => currentUser.petLevel >= e.unlockLevel);
  const currentGuess = GUESS_QUESTIONS[guessIndex];

  return (
    <div className="pet-page">
      {toast && <div className="toast">{toast}</div>}

      <header className="page-header">
        <h1>🐾 宠物</h1>
        <p className="page-header__sub">{currentUser.petName} · Lv.{currentUser.petLevel}</p>
      </header>

      <div className="pet-page__status sketch-box">
        <div className="pet-page__bars">
          <div className="stat-bar">
            <span>心情</span>
            <div className="stat-bar__track">
              <div className="stat-bar__fill stat-bar__fill--mood" style={{ width: `${currentUser.petMood}%` }} />
            </div>
            <span>{currentUser.petMood}</span>
          </div>
          <div className="stat-bar">
            <span>饱食</span>
            <div className="stat-bar__track">
              <div className="stat-bar__fill stat-bar__fill--hunger" style={{ width: `${currentUser.petHunger}%` }} />
            </div>
            <span>{currentUser.petHunger}</span>
          </div>
          <div className="stat-bar">
            <span>经验</span>
            <div className="stat-bar__track">
              <div className="stat-bar__fill stat-bar__fill--exp" style={{ width: `${currentUser.petExp}%` }} />
            </div>
            <span>{currentUser.petExp}/100</span>
          </div>
        </div>
        <div className="pet-page__coins">💰 {currentUser.coins} 金币</div>
      </div>

      <div className="pet-page__tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`pet-page__tab${tab === t.key ? ' pet-page__tab--active' : ''}${t.key === 'checkin' && !checkedToday ? ' pet-page__tab--notify' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="pet-page__content">
        {tab === 'home' && (
          <div className="pet-home">
            <div className="pet-home__nest sketch-box">
              <h3>{currentUser.petName} 的小窝</h3>
              <PetNest
                layout={currentUser.nestLayout}
                furniture={currentUser.furniture}
                petType={currentUser.petType}
                petName={currentUser.petName}
                outfit={equippedEmoji}
                interaction={interaction}
                onLayoutChange={layout =>
                  dispatch({ type: 'UPDATE_NEST_LAYOUT', userId: currentUser.id, layout })
                }
                onStoreFurniture={id =>
                  dispatch({ type: 'STORE_FURNITURE', userId: currentUser.id, furnitureId: id })
                }
                onPlaceFurniture={id =>
                  dispatch({ type: 'PLACE_FURNITURE', userId: currentUser.id, furnitureId: id })
                }
              />
            </div>

            <div className="pet-home__panels">
              <div className="pet-home__panel-tabs">
                {homePanels.map(p => (
                  <button
                    key={p.key}
                    className={`pet-home__panel-tab${homePanel === p.key ? ' pet-home__panel-tab--active' : ''}`}
                    onClick={() => setHomePanel(p.key)}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              <div className="pet-home__panel sketch-box">
                {homePanel === 'feed' && (
                  <>
                    <p className="pet-home__panel-desc">花费 5 金币 · 饱食 +25 · 心情 +5 · 上方小窝实时互动</p>
                    <div className="pet-action__foods">
                      {PET_FEED_OPTIONS.map(f => (
                        <button
                          key={f.id}
                          className="pet-action__food-btn"
                          title={f.name}
                          onClick={() => handleFeed(f)}
                        >
                          {f.emoji}
                          <span className="pet-action__food-label">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {homePanel === 'play' && (
                  <>
                    <p className="pet-home__panel-desc">心情 +20 · 金币 +10 · 饱食 -10 · 上方小窝实时互动</p>
                    <div className="pet-action__games">
                      {PET_PLAY_OPTIONS.map(g => (
                        <button
                          key={g.id}
                          className="pet-action__game-btn"
                          onClick={() => handlePlay(g)}
                        >
                          {g.emoji} {g.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {homePanel === 'shop' && (
                  <>
                    <p className="pet-home__panel-desc">购买后自动摆放入小窝，可拖动调整位置或收回</p>
                    <div className="pet-shop__grid">
                      {FURNITURE_SHOP.map(item => {
                        const owned = currentUser.furniture.includes(item.id);
                        return (
                          <div key={item.id} className="pet-shop__item">
                            <span className="pet-shop__emoji">{item.emoji}</span>
                            <strong>{item.name}</strong>
                            <span className="pet-shop__price">💰 {item.price}</span>
                            <button
                              className="btn btn--small"
                              disabled={owned || currentUser.coins < item.price}
                              onClick={() => {
                                dispatch({ type: 'BUY_FURNITURE', userId: currentUser.id, furnitureId: item.id, price: item.price });
                                showToast(`购买了 ${item.name}，已摆放入小窝！`);
                              }}
                            >
                              {owned ? '已拥有' : '购买'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {homePanel === 'dress' && (
                  <>
                    <p className="pet-home__panel-desc">装扮会实时显示在小窝中的宠物身上</p>
                    <div className="pet-dress__mini">
                      <PetAvatar petType={currentUser.petType} size="md" outfit={equippedEmoji} />
                      <span>{equippedEmoji ? `正在穿戴 ${equippedEmoji}` : '暂无装扮'}</span>
                      {currentUser.equippedOutfit && (
                        <button className="btn btn--ghost btn--small" onClick={() => {
                          const item = OUTFIT_SHOP.find(o => o.id === currentUser.equippedOutfit);
                          dispatch({ type: 'EQUIP_OUTFIT', userId: currentUser.id, outfitId: null });
                          if (item) handleDress('unequip', item);
                        }}>卸下</button>
                      )}
                    </div>
                    <div className="pet-shop__grid">
                      {OUTFIT_SHOP.map(item => {
                        const owned = currentUser.outfits.includes(item.id);
                        const equipped = currentUser.equippedOutfit === item.id;
                        return (
                          <div key={item.id} className="pet-shop__item">
                            <span className="pet-shop__emoji">{item.emoji}</span>
                            <strong>{item.name}</strong>
                            <span className="pet-shop__price">💰 {item.price}</span>
                            {owned ? (
                              <button
                                className={`btn btn--small${equipped ? ' btn--primary' : ''}`}
                                onClick={() => {
                                  dispatch({ type: 'EQUIP_OUTFIT', userId: currentUser.id, outfitId: item.id });
                                  if (!equipped) handleDress('equip', item);
                                }}
                              >
                                {equipped ? '已穿戴' : '穿戴'}
                              </button>
                            ) : (
                              <button
                                className="btn btn--small"
                                disabled={currentUser.coins < item.price}
                                onClick={() => {
                                  dispatch({ type: 'BUY_OUTFIT', userId: currentUser.id, outfitId: item.id, price: item.price });
                                  dispatch({ type: 'EQUIP_OUTFIT', userId: currentUser.id, outfitId: item.id });
                                  handleDress('buy', item);
                                }}
                              >
                                购买
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'checkin' && (
          <div className="pet-checkin sketch-box">
            <h3>每日签到</h3>
            <p className="pet-checkin__intro">连续签到 7 天为一个轮回，第 7 天赠送家具或服装！</p>
            <div className="pet-checkin__days">
              {CHECKIN_DAY_LABELS.map((label, i) => {
                const day = i + 1;
                const done = day <= checkInProgress.completed;
                const isBonus = day === 7;
                return (
                  <div
                    key={day}
                    className={`pet-checkin__day${done ? ' pet-checkin__day--done' : ''}${!done && day === checkInProgress.completed + 1 && !checkedToday ? ' pet-checkin__day--next' : ''}`}
                  >
                    <span className="pet-checkin__day-label">{label}</span>
                    <span className="pet-checkin__day-reward">
                      {isBonus ? '🎁' : `💰${CHECKIN_COIN_REWARDS[i]}`}
                    </span>
                    {done && <span className="pet-checkin__day-check">✓</span>}
                  </div>
                );
              })}
            </div>
            <button className="btn btn--primary btn--large" disabled={checkedToday} onClick={handleCheckIn}>
              {checkedToday ? '今日已签到 ✓' : '立即签到'}
            </button>
          </div>
        )}

        {tab === 'gomoku' && (
          <div className="pet-gomoku sketch-box">
            <h3>和 {currentUser.petName} 下五子棋</h3>
            <p className="pet-gomoku__intro">你执黑棋先手，宠物执白棋，选择难度挑战不同奖励！</p>
            <GomokuGame
              onWin={coins => dispatch({ type: 'GOMOKU_WIN', userId: currentUser.id, coins })}
              onToast={showToast}
            />
          </div>
        )}

        {tab === 'guess' && (
          <div className="pet-guess sketch-box">
            <h3>你问我猜</h3>
            <p className="pet-guess__intro">
              {currentUser.petName} 给出线索，猜猜是什么宠物？答对获得 {GUESS_CORRECT_COINS} 金币
            </p>
            <div className="pet-guess__bubble">
              <PetAvatar petType={currentUser.petType} size="md" />
              <p>「{currentGuess.clue}」</p>
            </div>
            <div className="pet-guess__options">
              {guessOptions.map(opt => (
                <button
                  key={opt}
                  className={`btn pet-guess__option${
                    guessFeedback === 'correct' && opt === currentGuess.answer ? ' pet-guess__option--correct' :
                    guessFeedback === 'wrong' && opt !== currentGuess.answer ? '' :
                    guessFeedback === 'wrong' && opt === currentGuess.answer ? ' pet-guess__option--correct' : ''
                  }${guessFeedback === 'wrong' && opt !== currentGuess.answer ? ' pet-guess__option--wrong' : ''}`}
                  disabled={guessFeedback === 'correct'}
                  onClick={() => handleGuess(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button className="btn btn--ghost btn--small" onClick={nextGuessQuestion}>跳过这题 →</button>
          </div>
        )}

        {tab === 'book' && (
          <div className="pet-book">
            <h3>宠物图鉴</h3>
            <p className="pet-book__progress">
              已解锁 {unlockedEntries.length}/{PET_ENCYCLOPEDIA.length}
            </p>
            <div className="pet-book__grid">
              {PET_ENCYCLOPEDIA.map(entry => {
                const unlocked = currentUser.petLevel >= entry.unlockLevel;
                return (
                  <div key={entry.petType} className={`pet-book__entry sketch-box${unlocked ? '' : ' pet-book__entry--locked'}`}>
                    <span className="pet-book__emoji">{unlocked ? getPetEmoji(entry.petType) : '❓'}</span>
                    <strong>{unlocked ? entry.name : '???'}</strong>
                    {unlocked ? (
                      <>
                        <p>{entry.description}</p>
                        <div className="pet-book__traits">
                          {entry.traits.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                      </>
                    ) : (
                      <p>Lv.{entry.unlockLevel} 解锁</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
