'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { providerApi } from '@/services/provider-api';

interface TrainingModule {
  id: string;
  title: string;
  duration?: string;
  status?: string;
  category?: string;
  lessons?: number;
}

export default function ProviderTrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    providerApi.getTopicQuizzes().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setModules(
          data.map((m: any, idx: number) => ({
            id: m.id || m._id || `quiz_${idx}`,
            title: m.name || m.title || 'Clinical Academy Module',
            duration: m.duration || `${m.count || 10} mins`,
            status: m.status || 'Available',
            category: m.category || 'Clinical Education',
            lessons: m.count || m.lessons || 1,
          }))
        );
      } else {
        setModules([]);
      }
      setIsLoading(false);
    }).catch(() => {
      setModules([]);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Aries Clinical Academy & SOPs</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Evidence-based continuing education, hospital-grade clinical protocols, and SOP certifications.
          </p>
        </div>
      </div>

      {/* Module Grid or Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-card border border-dashed border-border/80 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Active Training Modules Assigned</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Clinical SOP certifications, continuing education courses, and specialized rehabilitation pathways assigned by your territory clinical lead will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => {
            const isDone = mod.status === 'Completed' || mod.status === 'certified';
            return (
              <div
                key={mod.id}
                className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                      {mod.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {mod.duration} • {mod.lessons} Lessons
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-foreground">{mod.title}</h3>

                  <div className="text-xs">
                    {isDone ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified ✓
                      </span>
                    ) : (
                      <span className="text-primary font-bold">Available to Start</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant={isDone ? 'outline' : 'default'}
                    className="h-10 px-4 rounded-xl text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    <span>{isDone ? 'Review SOP' : 'Start Module'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
