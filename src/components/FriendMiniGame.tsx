import { useState, useEffect } from 'react';
import { GUESS_QUESTIONS, getPetEmoji } from '../constants';
import { CAPTAIN_GAME_REWARDS } from '../constants/captain';
import type { PetType, User } from '../types';
import PetAvatar from './PetAvatar';
import './FriendMiniGame.css';

type GameType = 'guess' | 'race' | 'memory';

interface FriendMiniGameProps {
  friend: User;
  currentUserPet: PetType;
  gameType: GameType;
  onClose: () => void;
  onWin: (coins: number, message: string) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function GuessGame({ friend, onWin, onClose }: Pick<FriendMiniGameProps, 'friend' | 'onWin' | 'onClose'>) {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState(() => shuffle(GUESS_QUESTIONS[0].options));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const totalRounds = 3;

  const q = GUESS_QUESTIONS[index];

  const nextRound = (nextScore: number) => {
    setScore(nextScore);
    if (round >= totalRounds) {
      const coins = nextScore >= 2 ? CAPTAIN_GAME_REWARDS.guess : Math.floor(CAPTAIN_GAME_REWARDS.guess / 2);
      onWin(coins, `猜对了 ${nextScore}/${totalRounds} 题！`);
      return;
    }
    const next = (index + 1) % GUESS_QUESTIONS.length;
    setIndex(next);
    setOptions(shuffle(GUESS_QUESTIONS[next].options));
    setFeedback(null);
    setRound(r => r + 1);
  };

  const handlePick = (opt: string) => {
    if (feedback) return;
    if (opt === q.answer) {
      setFeedback('correct');
      setTimeout(() => nextRound(score + 1), 700);
    } else {
      setFeedback('wrong');
      setTimeout(() => nextRound(score), 700);
    }
  };

  return (
    <div className="friend-game">
      <p className="friend-game__round">第 {round}/{totalRounds} 题 · 和 {friend.nickname} 一起猜</p>
      <div className="friend-game__bubble">
        <PetAvatar petType={friend.petType} size="md" />
        <p>「{q.clue}」</p>
      </div>
      <div className="friend-game__options">
        {options.map(opt => (
          <button
            key={opt}
            className={`btn friend-game__option${
              feedback === 'correct' && opt === q.answer ? ' friend-game__option--correct' : ''
            }${feedback === 'wrong' && opt !== q.answer ? ' friend-game__option--wrong' : ''}`}
            disabled={!!feedback}
            onClick={() => handlePick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <button className="btn btn--ghost btn--small" onClick={onClose}>退出</button>
    </div>
  );
}

function RaceGame({ friend, currentUserPet, onWin, onClose }: Pick<FriendMiniGameProps, 'friend' | 'currentUserPet' | 'onWin' | 'onClose'>) {
  const [phase, setPhase] = useState<'ready' | 'racing' | 'done'>('ready');
  const [progress, setProgress] = useState({ me: 0, friend: 0 });
  const [winner, setWinner] = useState<'me' | 'friend' | null>(null);

  const startRace = () => {
    setPhase('racing');
    setProgress({ me: 0, friend: 0 });
    let me = 0;
    let them = 0;
    const timer = setInterval(() => {
      me += 4 + Math.random() * 8;
      them += 3 + Math.random() * 9;
      setProgress({ me: Math.min(me, 100), friend: Math.min(them, 100) });
      if (me >= 100 || them >= 100) {
        clearInterval(timer);
        const iWin = me >= them;
        setWinner(iWin ? 'me' : 'friend');
        setPhase('done');
        const coins = iWin ? CAPTAIN_GAME_REWARDS.race : Math.floor(CAPTAIN_GAME_REWARDS.race / 2);
        onWin(coins, iWin ? '你的宠物第一个冲线！' : `${friend.nickname} 的宠物更快一步~`);
      }
    }, 120);
  };

  return (
    <div className="friend-game">
      <div className="friend-game__racers">
        <div className="friend-game__racer">
          <PetAvatar petType={currentUserPet} size="md" />
          <div className="friend-game__track">
            <div className="friend-game__progress" style={{ width: `${progress.me}%` }} />
          </div>
          <span>你</span>
        </div>
        <div className="friend-game__racer">
          <PetAvatar petType={friend.petType} size="md" />
          <div className="friend-game__track">
            <div className="friend-game__progress friend-game__progress--friend" style={{ width: `${progress.friend}%` }} />
          </div>
          <span>{friend.nickname}</span>
        </div>
      </div>
      {phase === 'ready' && (
        <button className="btn btn--primary" onClick={startRace}>🏁 开始赛跑</button>
      )}
      {phase === 'racing' && <p className="friend-game__status">加油加油…</p>}
      {phase === 'done' && winner && (
        <p className="friend-game__result">
          {winner === 'me' ? '🏆 你赢了！' : `🎖️ ${friend.nickname} 赢了！`}
        </p>
      )}
      <button className="btn btn--ghost btn--small" onClick={onClose}>退出</button>
    </div>
  );
}

const MEMORY_PETS: PetType[] = ['cat', 'dog', 'rabbit', 'hamster'];

function MemoryGame({ friend, onWin, onClose }: Pick<FriendMiniGameProps, 'friend' | 'onWin' | 'onClose'>) {
  const [cards] = useState(() => {
    const pairs = shuffle(MEMORY_PETS).slice(0, 4);
    return shuffle([...pairs, ...pairs].map((pet, i) => ({ id: i, pet })));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const pairCount = cards.length / 2;

  useEffect(() => {
    if (matched.size === pairCount && !finished) {
      setFinished(true);
      const coins = moves <= 10 ? CAPTAIN_GAME_REWARDS.memory : Math.floor(CAPTAIN_GAME_REWARDS.memory / 2);
      onWin(coins, `全部配对成功！用了 ${moves} 步`);
    }
  }, [matched.size, moves, onWin, pairCount, finished]);

  const handleFlip = (idx: number) => {
    if (lock || flipped.includes(idx) || matched.has(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLock(true);
      const [a, b] = next;
      if (cards[a].pet === cards[b].pet) {
        setMatched(prev => new Set([...prev, a, b]));
        setFlipped([]);
        setLock(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 700);
      }
    }
  };

  return (
    <div className="friend-game">
      <p className="friend-game__round">和 {friend.nickname} 玩记忆配对 · 步数 {moves}</p>
      <div className="friend-game__memory-grid">
        {cards.map((card, idx) => {
          const show = flipped.includes(idx) || matched.has(idx);
          return (
            <button
              key={card.id}
              className={`friend-game__memory-card${show ? ' friend-game__memory-card--open' : ''}${matched.has(idx) ? ' friend-game__memory-card--matched' : ''}`}
              onClick={() => handleFlip(idx)}
            >
              {show ? getPetEmoji(card.pet) : '?'}
            </button>
          );
        })}
      </div>
      <button className="btn btn--ghost btn--small" onClick={onClose}>退出</button>
    </div>
  );
}

export default function FriendMiniGame({ friend, currentUserPet, gameType, onClose, onWin }: FriendMiniGameProps) {
  const titles = { guess: '🎯 猜宠物', race: '🏃 宠物赛跑', memory: '🧩 记忆配对' };

  return (
    <div className="friend-game-overlay">
      <div className="friend-game-modal sketch-box">
        <header className="friend-game-modal__header">
          <h3>{titles[gameType]}</h3>
          <button className="friend-game-modal__close" onClick={onClose}>✕</button>
        </header>
        {gameType === 'guess' && <GuessGame friend={friend} onClose={onClose} onWin={onWin} />}
        {gameType === 'race' && (
          <RaceGame friend={friend} currentUserPet={currentUserPet} onClose={onClose} onWin={onWin} />
        )}
        {gameType === 'memory' && <MemoryGame friend={friend} onClose={onClose} onWin={onWin} />}
      </div>
    </div>
  );
}
