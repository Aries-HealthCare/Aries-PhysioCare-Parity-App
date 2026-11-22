import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRewardsPausedError,
  extractWordSearchPath,
  checkWordJumbleAnswer,
  canPlaceBlock,
  placeBlockAndClearLines,
  hasAnyValidBlockMove,
  BLOCK_SHAPES,
  validateSecureCrossword,
  computeLeagueProgress,
  resolveArenaAvatarSrc,
} from './gaming-helpers.ts';

test('isRewardsPausedError identifies 503 maintenance and 409 ledger admission codes', () => {
  assert.equal(isRewardsPausedError({ statusCode: 503, code: 'GAME_ARENA_REWARDS_PAUSED' }), true);
  assert.equal(
    isRewardsPausedError({
      statusCode: 503,
      message: 'Game Arena rewards and redemptions are temporarily unavailable during security maintenance.',
    }),
    true
  );
  assert.equal(
    isRewardsPausedError({ statusCode: 409, code: 'TOPIC_QUIZ_ADMISSION_LEDGER_REQUIRED' }),
    true
  );
  assert.equal(isRewardsPausedError({ statusCode: 400, message: 'Alias too short' }), false);
  assert.equal(isRewardsPausedError(null), false);
});

test('extractWordSearchPath extracts horizontal, vertical, and diagonal paths and rejects crooked paths', () => {
  const grid = [
    ['N', 'E', 'R', 'V', 'E'],
    ['A', 'B', 'C', 'D', 'E'],
    ['I', 'J', 'O', 'L', 'M'],
    ['R', 'S', 'T', 'N', 'Y'],
    ['P', 'A', 'I', 'N', 'E'],
  ];

  const horiz = extractWordSearchPath(grid, 0, 0, 0, 4);
  assert.equal(horiz.valid, true);
  assert.equal(horiz.word, 'NERVE');
  assert.equal(horiz.reversedWord, 'EVREN');
  assert.equal(horiz.cells.length, 5);

  const diag = extractWordSearchPath(grid, 1, 1, 4, 4);
  assert.equal(diag.valid, true);
  assert.equal(diag.word, 'BONE');

  const invalid = extractWordSearchPath(grid, 0, 0, 1, 3);
  assert.equal(invalid.valid, false);
});

test('checkWordJumbleAnswer validates case-insensitively', () => {
  assert.equal(checkWordJumbleAnswer(['a', 'n', 'a', 't', 'o', 'm', 'y'], 'ANATOMY'), true);
  assert.equal(checkWordJumbleAnswer(['A', 'N', 'A', 'T'], 'ANATOMY'), false);
});

test('block puzzle places pieces, clears completed rows/columns, and detects game over', () => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(0));
  // Fill bottom row except columns 3 & 4
  for (let c = 0; c < 8; c += 1) {
    if (c !== 3 && c !== 4) board[7][c] = 1;
  }

  const h2 = BLOCK_SHAPES.find((s) => s.id === 'h2')!;
  assert.equal(canPlaceBlock(board, h2.matrix, 7, 3), true);
  assert.equal(canPlaceBlock(board, h2.matrix, 7, 2), false);

  const result = placeBlockAndClearLines(board, h2.matrix, 7, 3);
  assert.equal(result.placed, true);
  assert.equal(result.clearedLines, 1);
  assert.equal(result.nextBoard[7].every((v) => v === 0), true);
  assert.ok(result.pointsEarned >= 110);

  const fullBoard = Array.from({ length: 8 }, () => Array(8).fill(1));
  assert.equal(hasAnyValidBlockMove(fullBoard, [h2]), false);
});

test('validateSecureCrossword rejects solutionGrid leakage and validates clean layout', () => {
  const leaked = validateSecureCrossword({
    layout: [['X', '']],
    solutionGrid: [['A', '']],
    wordPositions: [{ direction: 'across', clueNumber: '1', startRow: 0, startCol: 0, length: 1 }],
  });
  assert.equal(leaked.valid, false);

  const clean = validateSecureCrossword({
    layout: [
      ['X', 'X', 'X', ''],
      ['', 'X', '', ''],
    ],
    wordPositions: [{ direction: 'across', clueNumber: '1', startRow: 0, startCol: 0, length: 3 }],
  });
  assert.equal(clean.valid, true);
  assert.equal(clean.words.length, 1);
});

test('computeLeagueProgress and resolveArenaAvatarSrc return consistent values', () => {
  const bronze = computeLeagueProgress(125);
  assert.equal(bronze.current.id, 'bronze');
  assert.equal(bronze.next?.id, 'silver');
  assert.equal(bronze.progressPct, 50);
  assert.equal(bronze.pointsToNext, 125);

  const gm = computeLeagueProgress(9000);
  assert.equal(gm.current.id, 'grandmaster');
  assert.equal(gm.progressPct, 100);

  assert.equal(resolveArenaAvatarSrc('avatar_f7', 'dr_x'), '/images/avatar_f7.png');
  assert.match(resolveArenaAvatarSrc(null, 'dr_physio'), /^\/images\/avatar_d\d+\.png$/);
});
