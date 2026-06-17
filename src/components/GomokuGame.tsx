import { useState, useCallback } from 'react';
import {
  createEmptyBoard, checkWin, getAiMove, isValidMove,
  BLACK, WHITE, BOARD_SIZE, type Board, type GomokuDifficulty,
} from '../utils/gomoku';
import { GOMOKU_DIFFICULTIES } from '../constants';
import './GomokuGame.css';

type GameStatus = 'playing' | 'black-win' | 'white-win' | 'draw';

interface GomokuGameProps {
  onWin: (coins: number) => void;
  onToast: (msg: string) => void;
}

export default function GomokuGame({ onWin, onToast }: GomokuGameProps) {
  const [difficulty, setDifficulty] = useState<GomokuDifficulty>('medium');
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const reward = GOMOKU_DIFFICULTIES[difficulty].reward;

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setStatus('playing');
    setLastMove(null);
    setRewardClaimed(false);
  }, []);

  const changeDifficulty = (d: GomokuDifficulty) => {
    setDifficulty(d);
    resetGame();
  };

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'playing' || !isValidMove(board, row, col)) return;

    const next = board.map(r => [...r]);
    next[row][col] = BLACK;
    setLastMove([row, col]);

    if (checkWin(next, row, col, BLACK)) {
      setBoard(next);
      setStatus('black-win');
      if (!rewardClaimed) {
        onWin(reward);
        setRewardClaimed(true);
        onToast(`恭喜获胜！获得 ${reward} 金币 🎉`);
      }
      return;
    }

    const aiMove = getAiMove(next, difficulty);
    if (!aiMove) {
      setBoard(next);
      setStatus('draw');
      return;
    }

    const [ar, ac] = aiMove;
    next[ar][ac] = WHITE;
    setLastMove([ar, ac]);

    if (checkWin(next, ar, ac, WHITE)) {
      setBoard(next);
      setStatus('white-win');
      onToast('宠物获胜了，再来一局吧！');
      return;
    }

    setBoard(next);
  };

  const statusText = {
    playing: '你是黑棋 ●，请落子',
    'black-win': '你赢了！',
    'white-win': '宠物赢了',
    draw: '平局',
  }[status];

  return (
    <div className="gomoku">
      <div className="gomoku__difficulty">
        {(Object.keys(GOMOKU_DIFFICULTIES) as GomokuDifficulty[]).map(d => (
          <button
            key={d}
            className={`gomoku__diff-btn${difficulty === d ? ' gomoku__diff-btn--active' : ''}`}
            onClick={() => changeDifficulty(d)}
          >
            <strong>{GOMOKU_DIFFICULTIES[d].label}</strong>
            <span>+{GOMOKU_DIFFICULTIES[d].reward}币</span>
          </button>
        ))}
      </div>
      <p className="gomoku__diff-desc">{GOMOKU_DIFFICULTIES[difficulty].desc}</p>

      <div className="gomoku__header">
        <span className="gomoku__status">{statusText}</span>
        <button className="btn btn--small btn--ghost" onClick={resetGame}>重新开始</button>
      </div>

      <div className="gomoku__legend">
        <span><i className="gomoku__stone gomoku__stone--black" /> 你（黑）</span>
        <span><i className="gomoku__stone gomoku__stone--white" /> 宠物（白）</span>
      </div>

      <div className="gomoku__board-wrap sketch-box">
        <div
          className="gomoku__board"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLast = lastMove?.[0] === r && lastMove?.[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  className={`gomoku__cell${isLast ? ' gomoku__cell--last' : ''}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={status !== 'playing' || cell !== 0}
                  aria-label={`${r},${c}`}
                >
                  {cell === BLACK && <span className="gomoku__stone gomoku__stone--black" />}
                  {cell === WHITE && <span className="gomoku__stone gomoku__stone--white" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
