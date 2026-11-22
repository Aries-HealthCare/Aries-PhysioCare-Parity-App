'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { checkWordJumbleAnswer, isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Check, Lightbulb, RotateCcw, Shuffle, Trophy } from 'lucide-react';

interface JumbleItem {
  scrambled: string;
  solution: string;
  clue: string;
}

const JUMBLE_BANK: JumbleItem[] = [
  { scrambled: 'YMTNOAA', solution: 'ANATOMY', clue: 'The scientific study of bodily structures.' },
  { scrambled: 'ERVCIALC', solution: 'CERVICAL', clue: 'Relating to the seven neck vertebrae (C1–C7).' },
  { scrambled: 'EREFXL', solution: 'REFLEX', clue: 'An involuntary, automatic neuromuscular response.' },
  { scrambled: 'ALELATP', solution: 'PATELLA', clue: 'Sesamoid bone protecting the anterior knee joint.' },
  { scrambled: 'PLUCAAC', solution: 'SCAPULA', clue: 'Triangular shoulder blade articulating with the humerus.' },
  { scrambled: 'NODNET', solution: 'TENDON', clue: 'Fibrous collagen band connecting muscle to bone.' },
];

function buildBankLetters(item: JumbleItem): Array<{ id: string; char: string }> {
  // Always derive letters directly from solution in scrambled order so every puzzle is 100% solvable
  const chars = item.solution.split('');
  const rotated = chars.map((_, idx) => chars[(idx * 3 + 1) % chars.length]);
  return rotated.map((char, idx) => ({ id: `${item.solution}_${idx}`, char }));
}

export default function WordJumbleGamePage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [pool, setPool] = useState<Array<{ id: string; char: string }>>(() =>
    buildBankLetters(JUMBLE_BANK[0])
  );
  const [answer, setAnswer] = useState<Array<{ id: string; char: string }>>([]);
  const [completed, setCompleted] = useState(false);
  const [pausedBanner, setPausedBanner] = useState(false);

  const current = JUMBLE_BANK[index];

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((p) => {
        if (typeof p?.coins === 'number') setCoins(p.coins);
      })
      .catch(() => {});
  }, []);

  const loadQuestion = useCallback((nextIdx: number) => {
    setIndex(nextIdx);
    setPool(buildBankLetters(JUMBLE_BANK[nextIdx]));
    setAnswer([]);
  }, []);

  const pickTile = useCallback((tileId: string) => {
    setPool((prev) => {
      const found = prev.find((t) => t.id === tileId);
      if (!found) return prev;
      setAnswer((a) => [...a, found]);
      return prev.filter((t) => t.id !== tileId);
    });
  }, []);

  const returnTile = useCallback((tileId: string) => {
    setAnswer((prev) => {
      const found = prev.find((t) => t.id === tileId);
      if (!found) return prev;
      setPool((p) => [...p, found]);
      return prev.filter((t) => t.id !== tileId);
    });
  }, []);

  const handleCheck = useCallback(async () => {
    const ok = checkWordJumbleAnswer(
      answer.map((t) => t.char),
      current.solution
    );
    if (!ok) {
      toast({
        title: 'Not quite right',
        description: 'Check the clinical clue and rearrange the letters.',
        variant: 'destructive',
      });
      return;
    }

    if (index + 1 < JUMBLE_BANK.length) {
      toast({ title: `Correct! ${current.solution}`, description: 'Loading next clinical term…' });
      loadQuestion(index + 1);
    } else {
      setCompleted(true);
      toast({ title: 'All clinical jumbles solved!' });
      try {
        await providerApi.submitDailyTournament({
          gameType: 'word_jumble',
          isCorrect: true,
          timeTakenMs: 20000,
        });
      } catch (err: any) {
        if (isRewardsPausedError(err)) setPausedBanner(true);
      }
    }
  }, [answer, current.solution, index, loadQuestion, toast]);

  // Desktop keyboard typing support
  useEffect(() => {
    if (completed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && answer.length > 0) {
        e.preventDefault();
        returnTile(answer[answer.length - 1].id);
        return;
      }
      if (e.key === 'Enter' && answer.length === current.solution.length) {
        e.preventDefault();
        void handleCheck();
        return;
      }
      const upper = e.key.toUpperCase();
      if (/^[A-Z]$/.test(upper)) {
        const match = pool.find((t) => t.char === upper);
        if (match) pickTile(match.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [completed, answer, pool, current.solution.length, pickTile, returnTile, handleCheck]);

  const handleHint = () => {
    const nextPos = answer.length;
    if (nextPos >= current.solution.length) return;
    const neededChar = current.solution[nextPos];
    const match = pool.find((t) => t.char === neededChar);
    if (match) {
      pickTile(match.id);
    } else {
      toast({
        title: 'Clear a misplaced tile first',
        description: `Letter ${nextPos + 1} is "${neededChar}".`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ArenaHeader
        title="Clinical Word Jumble"
        description="Unscramble physiotherapy terms from clinical clues. Click letter tiles or type directly on your keyboard."
        coins={coins}
      />

      {pausedBanner && (
        <RewardsPausedNotice
          compact
          message="Word Jumble completed! Server coin rewards are paused during maintenance — great clinical recall!"
        />
      )}

      {completed ? (
        <div className="rounded-3xl border border-primary/30 bg-card p-8 text-center space-y-4 shadow-sm">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-outfit font-black text-foreground">
            All {JUMBLE_BANK.length} Clinical Terms Unscrambled!
          </h2>
          <p className="text-xs text-muted-foreground">
            Sharp recall across musculoskeletal and neurological terminology.
          </p>
          <Button
            type="button"
            onClick={() => {
              setCompleted(false);
              setPausedBanner(false);
              loadQuestion(0);
            }}
            className="h-11 px-6 rounded-2xl text-xs font-extrabold"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Play Again
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono">
              Word {index + 1} / {JUMBLE_BANK.length}
            </span>
            <span className="text-muted-foreground">{current.solution.length} letters</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Clue
            </p>
            <p className="text-sm sm:text-base font-bold text-foreground mt-1">{current.clue}</p>
          </div>

          {/* Answer Slots */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-14">
            {Array.from({ length: current.solution.length }, (_, slotIdx) => {
              const tile = answer[slotIdx];
              return (
                <button
                  key={slotIdx}
                  type="button"
                  disabled={!tile}
                  onClick={() => tile && returnTile(tile.id)}
                  className={`w-11 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 font-outfit text-lg font-black flex items-center justify-center transition-all ${
                    tile
                      ? 'border-primary bg-primary/10 text-foreground hover:bg-primary/20'
                      : 'border-dashed border-border bg-muted/15 text-muted-foreground'
                  }`}
                >
                  {tile?.char || ''}
                </button>
              );
            })}
          </div>

          {/* Scrambled Pool */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {pool.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => pickTile(tile.id)}
                className="w-11 h-12 sm:w-12 sm:h-14 rounded-2xl border border-border bg-card hover:border-primary hover:bg-primary/5 shadow-sm font-outfit text-lg font-black text-foreground transition-all"
              >
                {tile.char}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPool((prev) => [...prev].reverse())}
              className="rounded-xl text-xs"
            >
              <Shuffle className="w-3.5 h-3.5 mr-1" />
              Shuffle
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleHint}
              className="rounded-xl text-xs"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Hint
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadQuestion(index)}
              className="rounded-xl text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
            <Button
              type="button"
              disabled={answer.length !== current.solution.length}
              onClick={() => void handleCheck()}
              className="rounded-xl text-xs font-extrabold px-5"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Check Spelling
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
