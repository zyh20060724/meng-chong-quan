export const BOARD_SIZE = 15;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export type Cell = typeof EMPTY | typeof BLACK | typeof WHITE;
export type Board = Cell[][];
export type GomokuDifficulty = 'easy' | 'medium' | 'hard';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY) as Cell[]);
}

const DIRECTIONS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

export function isValidMove(board: Board, row: number, col: number): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  return board[row][col] === EMPTY;
}

export function countLine(board: Board, row: number, col: number, dr: number, dc: number, player: Cell): number {
  let count = 0;
  let r = row;
  let c = col;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

export function checkWin(board: Board, row: number, col: number, player: Cell): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    const total =
      countLine(board, row + dr, col + dc, dr, dc, player) +
      countLine(board, row - dr, col - dc, -dr, -dc, player) +
      1;
    if (total >= 5) return true;
  }
  return false;
}

function evaluatePoint(board: Board, row: number, col: number, player: Cell, weightMult = 1): number {
  let score = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const forward = countLine(board, row + dr, col + dc, dr, dc, player);
    const backward = countLine(board, row - dr, col - dc, -dr, -dc, player);
    const len = forward + backward + 1;
    if (len >= 5) score += 100000;
    else if (len === 4) score += 10000 * weightMult;
    else if (len === 3) score += 1000 * weightMult;
    else if (len === 2) score += 100 * weightMult;
    else score += 10;
  }
  return score;
}

function findWinningMove(board: Board, player: Cell): [number, number] | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) continue;
      board[r][c] = player;
      const win = checkWin(board, r, c, player);
      board[r][c] = EMPTY;
      if (win) return [r, c];
    }
  }
  return null;
}

function getCandidateMoves(board: Board): [number, number][] {
  const moves: [number, number][] = [];
  const center = Math.floor(BOARD_SIZE / 2);
  const isEmptyBoard = board.every(row => row.every(cell => cell === EMPTY));

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) continue;

      let hasNeighbor = false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== EMPTY) {
            hasNeighbor = true;
            break;
          }
        }
        if (hasNeighbor) break;
      }

      if (hasNeighbor || isEmptyBoard) moves.push([r, c]);
    }
  }

  if (moves.length === 0) return [[center, center]];
  return moves;
}

function getRandomMove(board: Board): [number, number] {
  const moves = getCandidateMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

function getAiMoveInternal(
  board: Board,
  attackMult: number,
  defendMult: number,
  weightMult: number,
  alwaysBlock: boolean
): [number, number] {
  const winMove = findWinningMove(board, WHITE);
  if (winMove) return winMove;

  if (alwaysBlock) {
    const blockMove = findWinningMove(board, BLACK);
    if (blockMove) return blockMove;
  } else {
    const blockMove = findWinningMove(board, BLACK);
    if (blockMove && Math.random() > 0.4) return blockMove;
  }

  let bestScore = -1;
  let bestMoves: [number, number][] = [];
  const center = Math.floor(BOARD_SIZE / 2);
  const candidates = getCandidateMoves(board);
  const isEmptyBoard = board.every(row => row.every(cell => cell === EMPTY));

  for (const [r, c] of candidates) {
    board[r][c] = WHITE;
    const attack = evaluatePoint(board, r, c, WHITE, weightMult);
    board[r][c] = BLACK;
    const defend = evaluatePoint(board, r, c, BLACK, weightMult);
    board[r][c] = EMPTY;

    const dist = Math.abs(r - center) + Math.abs(c - center);
    const score = attack * attackMult + defend * defendMult + (isEmptyBoard ? 50 - dist : 0);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (score === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export function getAiMove(board: Board, difficulty: GomokuDifficulty = 'medium'): [number, number] | null {
  if (difficulty === 'easy') {
    if (Math.random() < 0.38) return getRandomMove(board);
    return getAiMoveInternal(board, 0.9, 0.7, 0.8, false);
  }
  if (difficulty === 'hard') {
    return getAiMoveInternal(board, 1.4, 1.2, 1.3, true);
  }
  return getAiMoveInternal(board, 1.1, 1.0, 1.0, true);
}
