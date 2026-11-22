'use client';

import React, { useEffect, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { extractWordSearchPath, isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw, Trophy } from 'lucide-react';

interface WordSearchBoard {
  id: string;
  title: string;
  words: string[];
  grid: string[][];
}

const BOARDS: WordSearchBoard[] = [
  {
    id: 'neuro_ortho',
    title: 'Board 1 · Core Anatomy',
    words: ['NERVE', 'BONE', 'JOINT', 'PAIN'],
    grid: [
      ['N', 'E', 'R', 'V', 'E', 'X', 'Y', 'Z'],
      ['A', 'B', 'C', 'D', 'E', 'B', 'G', 'H'],
      ['I', 'J', 'K', 'L', 'M', 'O', 'P', 'Q'],
      ['R', 'S', 'J', 'O', 'I', 'N', 'T', 'Y'],
      ['P', 'U', 'A', 'W', 'X', 'E', 'Y', 'Z'],
      ['K', 'A', 'L', 'C', 'M', 'T', 'N', 'O'],
      ['L', 'M', 'I', 'O', 'P', 'E', 'Q', 'R'],
      ['S', 'T', 'U', 'N', 'V', 'W', 'X', 'Y'],
    ],
  },
  {
    id: 'rehab_clinic',
    title: 'Board 2 · Rehab Clinic',
    words: ['SPINE', 'REHAB', 'GAIT', 'TONE'],
    grid: [
      ['S', 'P', 'I', 'N', 'E', 'K', 'L', 'M'],
      ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'],
      ['A', 'E', 'B', 'C', 'D', 'E', 'F', 'G'],
      ['H', 'H', 'I', 'G', 'A', 'I', 'T', 'J'],
      ['K', 'A', 'L', 'M', 'N', 'O', 'P', 'Q'],
      ['R', 'B', 'S', 'T', 'O', 'N', 'E', 'U'],
      ['V', 'W', 'X', 'Y', 'Z', 'A', 'B', 'C'],
      ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
    ],
  },
];

export default function WordSearchGamePage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [boardIdx, setBoardIdx] = useState(0);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [solvedCoords, setSolvedCoords] = useState<string[]>([]);
  const [pausedBanner, setPausedBanner] = useState(false);

  const board = BOARDS[boardIdx];
  const isComplete = foundWords.length === board.words.length;

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((p) => {
        if (typeof p?.coins === 'number') setCoins(p.coins);
      })
      .catch(() => {});
  }, []);

  const resetBoard = (nextIdx = boardIdx) => {
    setBoardIdx(nextIdx);
    setStartCell(null);
    setFoundWords([]);
    setSolvedCoords([]);
    setPausedBanner(false);
  };

  const handleCellClick = async (r: number, c: number) => {
    if (isComplete) return;

    if (!startCell) {
      setStartCell({ row: r, col: c });
      return;
    }

    if (startCell.row === r && startCell.col === c) {
      setStartCell(null);
      return;
    }

    const res = extractWordSearchPath(board.grid, startCell.row, startCell.col, r, c);
    setStartCell(null);

    if (!res.valid) {
      toast({
        title: 'Straight lines only',
        description: 'Tap the first and last letter along a horizontal, vertical, or diagonal line.',
      });
      return;
    }

    const matched = board.words.find(
      (w) => !foundWords.includes(w) && (w === res.word || w === res.reversedWord)
    );

    if (!matched) {
      toast({
        title: `“${res.word}” is not a target word`,
        description: 'Try another start and end letter.',
      });
      return;
    }

    const nextFound = [...foundWords, matched];
    const nextCoords = Array.from(
      new Set([...solvedCoords, ...res.cells.map((pt) => `${pt.row},${pt.col}`)])
    );
    setFoundWords(nextFound);
    setSolvedCoords(nextCoords);
    toast({ title: `Found ${matched}!`, description: `${nextFound.length} of ${board.words.length} words solved.` });

    if (nextFound.length === board.words.length) {
      try {
        await providerApi.submitDailyTournament({
          gameType: 'word_search',
          isCorrect: true,
          timeTakenMs: 15000,
        });
      } catch (err: any) {
        if (isRewardsPausedError(err)) setPausedBanner(true);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ArenaHeader
        title="Anatomy Word Search"
        description="Tap the first letter and last letter of each hidden clinical word along any straight line."
        coins={coins}
        actions={
          <div className="flex items-center gap-2">
            {BOARDS.map((b, i) => (
              <Button
                key={b.id}
                type="button"
                size="sm"
                variant={boardIdx === i ? 'default' : 'outline'}
                onClick={() => resetBoard(i)}
                className="rounded-xl text-xs font-bold"
              >
                {b.title}
              </Button>
            ))}
          </div>
        }
      />

      {pausedBanner && (
        <RewardsPausedNotice
          compact
          message="Word Search solved! Arena coin payouts are paused during maintenance — your score was recorded for practice."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 8x8 Grid */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 max-w-md mx-auto">
            {board.grid.map((row, r) =>
              row.map((letter, c) => {
                const coord = `${r},${c}`;
                const isSelectedStart = startCell?.row === r && startCell?.col === c;
                const isSolved = solvedCoords.includes(coord);
                return (
                  <button
                    key={coord}
                    type="button"
                    onClick={() => void handleCellClick(r, c)}
                    className={`aspect-square rounded-xl border text-sm sm:text-base font-outfit font-black transition-all flex items-center justify-center ${
                      isSelectedStart
                        ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md'
                        : isSolved
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50'
                          : 'bg-muted/25 hover:bg-primary/10 border-border/70 text-foreground'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Target Word List & Status */}
        <aside className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Target Words</h2>
              <p className="text-xs text-muted-foreground">
                {foundWords.length} / {board.words.length} discovered
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => resetBoard(boardIdx)}
              className="rounded-xl text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {board.words.map((word) => {
              const found = foundWords.includes(word);
              return (
                <div
                  key={word}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-between ${
                    found
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 line-through'
                      : 'bg-muted/20 border-border/70 text-foreground'
                  }`}
                >
                  <span>{word}</span>
                  {found && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              );
            })}
          </div>

          {startCell && (
            <p className="text-xs text-primary font-bold">
              Start selected ({board.grid[startCell.row][startCell.col]} at row {startCell.row + 1}, col{' '}
              {startCell.col + 1}) — now tap the end letter!
            </p>
          )}

          {isComplete && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2">
              <Trophy className="w-7 h-7 text-amber-500 mx-auto" />
              <p className="text-sm font-extrabold text-foreground">Board Complete!</p>
              <Button
                type="button"
                size="sm"
                onClick={() => resetBoard((boardIdx + 1) % BOARDS.length)}
                className="rounded-xl text-xs font-bold"
              >
                Play Next Board
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
