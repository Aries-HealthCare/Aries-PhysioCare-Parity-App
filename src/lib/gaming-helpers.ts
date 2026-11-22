/**
 * Pure, framework-free helpers for the Aries Arena Gaming Suite (Wave 3).
 *
 * Covers:
 * - Backend GAME-02..05 / 503 maintenance & 409 admission detection
 * - Word Search straight-line path extraction (horizontal, vertical, diagonal)
 * - Word Jumble answer verification
 * - 8x8 Block Puzzle placement, line clearing, and game-over detection
 * - Secure Crossword protocol validation (matches mobile `CrosswordGamePage`)
 * - League ladder progression & avatar resolution
 */

export interface AvatarOption {
  id: string;
  category: 'male' | 'female' | 'doctor';
  src: string;
  label: string;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `avatar_m${i + 1}`,
    category: 'male' as const,
    src: `/images/avatar_m${i + 1}.png`,
    label: `Clinician M${i + 1}`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `avatar_f${i + 1}`,
    category: 'female' as const,
    src: `/images/avatar_f${i + 1}.png`,
    label: `Clinician F${i + 1}`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `avatar_d${i + 1}`,
    category: 'doctor' as const,
    src: `/images/avatar_d${i + 1}.png`,
    label: `Specialist D${i + 1}`,
  })),
];

export function resolveArenaAvatarSrc(avatarId?: string | null, alias?: string | null): string {
  const cleanId = String(avatarId || '').trim();
  if (/^avatar_[mfd]([1-9]|1[0-9]|2[0-5])$/.test(cleanId)) {
    return `/images/${cleanId}.png`;
  }
  const cleanAlias = String(alias || 'aries').toLowerCase().replaceAll('@', '').trim();
  let sum = 0;
  for (let i = 0; i < cleanAlias.length; i += 1) {
    sum += cleanAlias.charCodeAt(i);
  }
  const num = (sum % 25) + 1;
  return `/images/avatar_d${num}.png`;
}

/**
 * Detects backend security containment errors (`503 GAME_ARENA_REWARDS_PAUSED` or
 * `409 TOPIC_QUIZ_ADMISSION_LEDGER_REQUIRED`) so UI shows an honest maintenance
 * notice instead of a generic crash error.
 */
export function isRewardsPausedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const obj = err as Record<string, any>;
  const status = Number(obj.statusCode ?? obj.status ?? 0);
  const code = String(obj.code ?? obj.data?.code ?? '').toUpperCase();
  const msg = String(obj.message ?? '').toLowerCase();

  if (code === 'GAME_ARENA_REWARDS_PAUSED' || code === 'TOPIC_QUIZ_ADMISSION_LEDGER_REQUIRED') {
    return true;
  }
  if (status === 503 && (msg.includes('arena') || msg.includes('reward') || msg.includes('maintenance'))) {
    return true;
  }
  if (status === 409 && (msg.includes('ledger') || msg.includes('admission'))) {
    return true;
  }
  return (
    msg.includes('temporarily unavailable during security maintenance') ||
    msg.includes('game_arena_rewards_paused')
  );
}

// ── Word Search ───────────────────────────────────────────────────────────────

export interface GridCoord {
  row: number;
  col: number;
}

export interface WordSearchPathResult {
  valid: boolean;
  word: string;
  reversedWord: string;
  cells: GridCoord[];
}

export function extractWordSearchPath(
  grid: string[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): WordSearchPathResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  if (
    r1 < 0 ||
    r1 >= rows ||
    c1 < 0 ||
    c1 >= cols ||
    r2 < 0 ||
    r2 >= rows ||
    c2 < 0 ||
    c2 >= cols ||
    (r1 === r2 && c1 === c2)
  ) {
    return { valid: false, word: '', reversedWord: '', cells: [] };
  }

  const rowDiff = r2 - r1;
  const colDiff = c2 - c1;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);

  if (r1 !== r2 && c1 !== c2 && absRowDiff !== absColDiff) {
    return { valid: false, word: '', reversedWord: '', cells: [] };
  }

  const steps = Math.max(absRowDiff, absColDiff);
  const rStep = rowDiff === 0 ? 0 : rowDiff / absRowDiff;
  const cStep = colDiff === 0 ? 0 : colDiff / absColDiff;

  const cells: GridCoord[] = [];
  let word = '';
  for (let i = 0; i <= steps; i += 1) {
    const row = r1 + i * rStep;
    const col = c1 + i * cStep;
    cells.push({ row, col });
    word += grid[row][col] ?? '';
  }

  const upper = word.toUpperCase();
  const reversedWord = upper.split('').reverse().join('');
  return { valid: true, word: upper, reversedWord, cells };
}

// ── Word Jumble ───────────────────────────────────────────────────────────────

export function checkWordJumbleAnswer(letters: string[], solution: string): boolean {
  return letters.join('').trim().toUpperCase() === solution.trim().toUpperCase();
}

// ── 8x8 Block Puzzle ──────────────────────────────────────────────────────────

export interface BlockShapeDef {
  id: string;
  name: string;
  matrix: number[][];
  colorClass: string;
}

export const BLOCK_SHAPES: BlockShapeDef[] = [
  { id: 'single', name: 'Single', matrix: [[1]], colorClass: 'bg-amber-400 border-amber-300' },
  { id: 'h2', name: 'Line H2', matrix: [[1, 1]], colorClass: 'bg-cyan-400 border-cyan-300' },
  { id: 'v2', name: 'Line V2', matrix: [[1], [1]], colorClass: 'bg-cyan-400 border-cyan-300' },
  { id: 'h3', name: 'Line H3', matrix: [[1, 1, 1]], colorClass: 'bg-purple-400 border-purple-300' },
  { id: 'v3', name: 'Line V3', matrix: [[1], [1], [1]], colorClass: 'bg-purple-400 border-purple-300' },
  {
    id: 'square',
    name: 'Square',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    colorClass: 'bg-emerald-400 border-emerald-300',
  },
  {
    id: 'lshape',
    name: 'L-Shape',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    colorClass: 'bg-yellow-400 border-yellow-300',
  },
  {
    id: 'tshape',
    name: 'T-Shape',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    colorClass: 'bg-rose-400 border-rose-300',
  },
];

export function canPlaceBlock(
  board: number[][],
  matrix: number[][],
  startRow: number,
  startCol: number
): boolean {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (matrix[r][c] !== 1) continue;
      const nr = startRow + r;
      const nc = startCol + c;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
      if (board[nr][nc] !== 0) return false;
    }
  }
  return true;
}

export function placeBlockAndClearLines(
  board: number[][],
  matrix: number[][],
  startRow: number,
  startCol: number,
  fillValue = 1
): {
  placed: boolean;
  nextBoard: number[][];
  clearedLines: number;
  pointsEarned: number;
} {
  if (!canPlaceBlock(board, matrix, startRow, startCol)) {
    return { placed: false, nextBoard: board, clearedLines: 0, pointsEarned: 0 };
  }

  const nextBoard = board.map((row) => [...row]);
  let cellsPlaced = 0;
  for (let r = 0; r < matrix.length; r += 1) {
    for (let c = 0; c < matrix[r].length; c += 1) {
      if (matrix[r][c] === 1) {
        nextBoard[startRow + r][startCol + c] = fillValue;
        cellsPlaced += 1;
      }
    }
  }

  const size = nextBoard.length;
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < size; r += 1) {
    if (nextBoard[r].every((cell) => cell !== 0)) fullRows.push(r);
  }
  for (let c = 0; c < size; c += 1) {
    if (nextBoard.every((row) => row[c] !== 0)) fullCols.push(c);
  }

  for (const r of fullRows) {
    for (let c = 0; c < size; c += 1) nextBoard[r][c] = 0;
  }
  for (const c of fullCols) {
    for (let r = 0; r < size; r += 1) nextBoard[r][c] = 0;
  }

  const clearedLines = fullRows.length + fullCols.length;
  const bonus = clearedLines > 1 ? clearedLines * 25 : 0;
  const pointsEarned = cellsPlaced * 5 + clearedLines * 100 + bonus;

  return { placed: true, nextBoard, clearedLines, pointsEarned };
}

export function hasAnyValidBlockMove(board: number[][], shapes: Array<BlockShapeDef | null>): boolean {
  const activeShapes = shapes.filter((s): s is BlockShapeDef => Boolean(s));
  if (activeShapes.length === 0) return true;
  for (const shape of activeShapes) {
    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < (board[0]?.length || 0); c += 1) {
        if (canPlaceBlock(board, shape.matrix, r, c)) return true;
      }
    }
  }
  return false;
}

// ── Secure Crossword Protocol Validation ──────────────────────────────────────

export interface SecureCrosswordWord {
  direction: 'across' | 'down';
  clueNumber: string;
  startRow: number;
  startCol: number;
  length: number;
}

export interface ValidatedCrossword {
  valid: boolean;
  reason?: string;
  layout: string[][];
  words: SecureCrosswordWord[];
}

export function validateSecureCrossword(crossword: any): ValidatedCrossword {
  if (!crossword || typeof crossword !== 'object') {
    return { valid: false, reason: 'Missing crossword payload', layout: [], words: [] };
  }
  // Security contract: backend must never ship solutionGrid to the client
  if ('solutionGrid' in crossword) {
    return {
      valid: false,
      reason: 'Secure crossword format unavailable (unexpected solution key).',
      layout: [],
      words: [],
    };
  }
  const layoutRaw = crossword.layout;
  const positionsRaw = crossword.wordPositions;
  if (!Array.isArray(layoutRaw) || layoutRaw.length === 0 || !Array.isArray(positionsRaw) || positionsRaw.length === 0) {
    return {
      valid: false,
      reason: 'Crossword layout or clue positions are missing.',
      layout: [],
      words: [],
    };
  }

  const width = Array.isArray(layoutRaw[0]) ? layoutRaw[0].length : 0;
  if (width === 0) {
    return { valid: false, reason: 'Empty crossword row.', layout: [], words: [] };
  }

  const layout: string[][] = [];
  for (const rawRow of layoutRaw) {
    if (!Array.isArray(rawRow) || rawRow.length !== width) {
      return { valid: false, reason: 'Malformed crossword grid dimensions.', layout: [], words: [] };
    }
    const row: string[] = [];
    for (const cell of rawRow) {
      if (cell !== 'X' && cell !== '') {
        return { valid: false, reason: 'Invalid cell token in crossword layout.', layout: [], words: [] };
      }
      row.push(cell);
    }
    layout.push(row);
  }

  const words: SecureCrosswordWord[] = [];
  for (const pos of positionsRaw) {
    if (!pos || typeof pos !== 'object') {
      return { valid: false, reason: 'Malformed clue position.', layout: [], words: [] };
    }
    const direction = pos.direction;
    const clueNumber = String(pos.clueNumber ?? '').trim();
    const startRow = Number(pos.startRow);
    const startCol = Number(pos.startCol);
    const length = Number(pos.length);
    if (
      (direction !== 'across' && direction !== 'down') ||
      !clueNumber ||
      !Number.isInteger(startRow) ||
      !Number.isInteger(startCol) ||
      !Number.isInteger(length) ||
      startRow < 0 ||
      startCol < 0 ||
      length < 1
    ) {
      return { valid: false, reason: 'Invalid word position bounds.', layout: [], words: [] };
    }
    words.push({ direction, clueNumber, startRow, startCol, length });
  }

  return { valid: true, layout, words };
}

// ── League Ladder Progression ─────────────────────────────────────────────────

export interface LeagueTier {
  id: string;
  label: string;
  minPoints: number;
  nextPoints: number | null;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  { id: 'bronze', label: 'Bronze Clinician', minPoints: 0, nextPoints: 250 },
  { id: 'silver', label: 'Silver Specialist', minPoints: 250, nextPoints: 750 },
  { id: 'gold', label: 'Gold Master', minPoints: 750, nextPoints: 2000 },
  { id: 'platinum', label: 'Platinum Elite', minPoints: 2000, nextPoints: 5000 },
  { id: 'grandmaster', label: 'Grandmaster', minPoints: 5000, nextPoints: null },
];

export function computeLeagueProgress(points: number): {
  current: LeagueTier;
  next: LeagueTier | null;
  progressPct: number;
  pointsToNext: number;
} {
  const safePts = Math.max(0, Number(points) || 0);
  let idx = 0;
  for (let i = 0; i < LEAGUE_TIERS.length; i += 1) {
    if (safePts >= LEAGUE_TIERS[i].minPoints) idx = i;
  }
  const current = LEAGUE_TIERS[idx];
  const next = idx + 1 < LEAGUE_TIERS.length ? LEAGUE_TIERS[idx + 1] : null;
  if (!next) {
    return { current, next: null, progressPct: 100, pointsToNext: 0 };
  }
  const span = Math.max(1, next.minPoints - current.minPoints);
  const progressPct = Math.min(100, Math.round(((safePts - current.minPoints) / span) * 100));
  return {
    current,
    next,
    progressPct,
    pointsToNext: Math.max(0, next.minPoints - safePts),
  };
}
