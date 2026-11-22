'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import {
  BLOCK_SHAPES,
  BlockShapeDef,
  canPlaceBlock,
  hasAnyValidBlockMove,
  placeBlockAndClearLines,
} from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, Sparkles, Trophy } from 'lucide-react';

const OBJECTIVE_LINES = 5;
const HIGH_SCORE_KEY = 'aries_block_puzzle_high_score';

function createStarterBoard(): number[][] {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0));
  // Seed near-complete bottom row (matches mobile BlockPuzzlePage starter experience)
  for (let c = 0; c < 8; c += 1) {
    if (c !== 3 && c !== 4) b[7][c] = 1;
  }
  return b;
}

function randomShape(): BlockShapeDef {
  return BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
}

function MiniShapePreview({ shape }: { shape: BlockShapeDef | null }) {
  if (!shape) {
    return <span className="text-[11px] text-muted-foreground">Empty</span>;
  }
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${shape.matrix[0].length}, 14px)` }}
    >
      {shape.matrix.flatMap((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-3.5 h-3.5 rounded-xs ${
              val === 1 ? `${shape.colorClass} border` : 'bg-transparent'
            }`}
          />
        ))
      )}
    </div>
  );
}

export default function BlockPuzzlePage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [board, setBoard] = useState<number[][]>(() => createStarterBoard());
  const [deck, setDeck] = useState<Array<BlockShapeDef | null>>(() => [
    BLOCK_SHAPES[1], // Line H2 for instant first clear!
    BLOCK_SHAPES[0],
    BLOCK_SHAPES[5],
  ]);
  const [holdShape, setHoldShape] = useState<BlockShapeDef | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((p) => {
        if (typeof p?.coins === 'number') setCoins(p.coins);
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const saved = Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0);
      if (saved > 0) setHighScore(saved);
    }
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createStarterBoard());
    setDeck([BLOCK_SHAPES[1], randomShape(), randomShape()]);
    setHoldShape(null);
    setSelectedIdx(0);
    setHoverCell(null);
    setScore(0);
    setLinesCleared(0);
    setGameOver(false);
  }, []);

  const selectedShape = selectedIdx !== null ? deck[selectedIdx] : null;

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || selectedIdx === null || !selectedShape) return;

    const outcome = placeBlockAndClearLines(board, selectedShape.matrix, r, c, 1);
    if (!outcome.placed) {
      toast({ title: 'Does not fit there', description: 'Choose an open spot on the 8×8 board.' });
      return;
    }

    const nextScore = score + outcome.pointsEarned;
    const nextLines = linesCleared + outcome.clearedLines;
    setBoard(outcome.nextBoard);
    setScore(nextScore);
    setLinesCleared(nextLines);

    if (nextScore > highScore) {
      setHighScore(nextScore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(nextScore));
      }
    }

    if (outcome.clearedLines > 0) {
      toast({
        title: `Cleared ${outcome.clearedLines} line${outcome.clearedLines > 1 ? 's' : ''}!`,
        description: `+${outcome.pointsEarned} pts`,
      });
    }

    // Update deck; refill when all 3 pieces are placed
    let nextDeck = deck.map((item, i) => (i === selectedIdx ? null : item));
    if (nextDeck.every((item) => item === null)) {
      nextDeck = [randomShape(), randomShape(), randomShape()];
    }
    setDeck(nextDeck);

    const firstAvailable = nextDeck.findIndex((item) => item !== null);
    setSelectedIdx(firstAvailable >= 0 ? firstAvailable : null);

    if (!hasAnyValidBlockMove(outcome.nextBoard, nextDeck)) {
      setGameOver(true);
    }
  };

  const handleSwapHold = () => {
    if (gameOver || selectedIdx === null || !selectedShape) return;
    const prevHold = holdShape;
    setHoldShape(selectedShape);
    setDeck((prev) =>
      prev.map((item, i) => (i === selectedIdx ? prevHold || randomShape() : item))
    );
  };

  const isPreviewCell = (r: number, c: number): 'valid' | 'invalid' | null => {
    if (!hoverCell || !selectedShape) return null;
    const relR = r - hoverCell.row;
    const relC = c - hoverCell.col;
    if (
      relR < 0 ||
      relC < 0 ||
      relR >= selectedShape.matrix.length ||
      relC >= selectedShape.matrix[0].length ||
      selectedShape.matrix[relR][relC] !== 1
    ) {
      return null;
    }
    return canPlaceBlock(board, selectedShape.matrix, hoverCell.row, hoverCell.col)
      ? 'valid'
      : 'invalid';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ArenaHeader
        title="8×8 Clinical Brain-Break Block Puzzle"
        description="Select a piece from your deck and place it on the 8×8 grid to clear full rows and columns."
        coins={coins}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={resetGame} className="rounded-xl text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restart
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 8x8 Board */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono">
              Score: {score}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
              Best: {highScore}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
              Lines: {linesCleared} / {OBJECTIVE_LINES}
            </span>
          </div>

          <div
            className="grid grid-cols-8 gap-1.5 max-w-md mx-auto select-none"
            onMouseLeave={() => setHoverCell(null)}
          >
            {board.map((row, r) =>
              row.map((val, c) => {
                const preview = isPreviewCell(r, c);
                let cellStyle = 'bg-muted/30 border-border/60';
                if (val !== 0) {
                  cellStyle = 'bg-primary border-primary/70 shadow-sm';
                } else if (preview === 'valid') {
                  cellStyle = 'bg-emerald-500/35 border-emerald-500';
                } else if (preview === 'invalid') {
                  cellStyle = 'bg-rose-500/35 border-rose-500';
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onMouseEnter={() => setHoverCell({ row: r, col: c })}
                    onClick={() => handleCellClick(r, c)}
                    aria-label={`Grid cell ${r + 1},${c + 1}`}
                    className={`aspect-square rounded-lg border transition-colors ${cellStyle}`}
                  />
                );
              })
            )}
          </div>

          {linesCleared >= OBJECTIVE_LINES && !gameOver && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Objective reached ({OBJECTIVE_LINES}+ lines cleared) — keep going for a new high score!
            </div>
          )}

          {gameOver && (
            <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 p-5 text-center space-y-3">
              <Trophy className="w-7 h-7 text-amber-500 mx-auto" />
              <div>
                <p className="text-base font-extrabold text-foreground">No More Valid Moves</p>
                <p className="text-xs text-muted-foreground">
                  Final Score: {score} pts · Lines Cleared: {linesCleared}
                </p>
              </div>
              <Button type="button" onClick={resetGame} className="rounded-xl text-xs font-extrabold">
                Play Again
              </Button>
            </div>
          )}
        </div>

        {/* Deck & Hold Panel */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-foreground">Active Piece Deck</h2>
            <p className="text-xs text-muted-foreground">
              Click a piece below, then click or tap its top-left anchor cell on the board.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {deck.map((shape, i) => {
                const active = selectedIdx === i && shape !== null;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!shape || gameOver}
                    onClick={() => setSelectedIdx(i)}
                    className={`min-h-24 rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                      active
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : shape
                          ? 'border-border/70 bg-muted/20 hover:border-primary/40'
                          : 'border-dashed border-border/50 bg-muted/10 opacity-50'
                    }`}
                  >
                    <MiniShapePreview shape={shape} />
                    {shape && <span className="text-[10px] font-bold text-muted-foreground">{shape.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-primary" />
                Hold Slot
              </h3>
              <p className="text-xs text-muted-foreground">
                Stash the selected piece for later.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl border border-border bg-muted/20 flex items-center justify-center">
                <MiniShapePreview shape={holdShape} />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selectedShape || gameOver}
                onClick={handleSwapHold}
                className="rounded-xl text-xs font-bold"
              >
                Swap
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
