'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DynamicAssessmentForm,
  DynamicQuestion,
  providerApi,
} from '@/services/provider-api';
import { isDynamicQuestionVisible } from '@/lib/dashboard-analytics';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Layers,
  Search,
  Check,
  Stethoscope,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DynamicFormRendererProps {
  appointmentId: string;
  patientId?: string;
  expertId?: string;
  initialForm?: DynamicAssessmentForm;
  allForms?: DynamicAssessmentForm[];
  visitType?: 'First Visit' | 'Regular Visit' | string;
  onSubmitted: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

const NON_INPUT_TYPES = new Set<string>(['header', 'lineBreak']);
const SHORT_FIELD_TYPES = new Set<string>([
  'text',
  'number',
  'date',
  'dropdown',
  'auto',
  'boolean',
]);

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isFieldAnswered(q: DynamicQuestion, val: any): boolean {
  if (val === undefined || val === null) return false;
  if (q.questionType === 'multipleChoice') {
    return Array.isArray(val) && val.length > 0;
  }
  if (q.questionType === 'boolean') {
    return typeof val === 'boolean';
  }
  if (q.questionType === 'scale') {
    return typeof val === 'number' && Number.isFinite(val);
  }
  if (typeof val === 'number') {
    return Number.isFinite(val);
  }
  return String(val).trim().length > 0;
}

export function DynamicFormRenderer({
  appointmentId,
  patientId,
  expertId,
  initialForm,
  allForms = [],
  visitType = 'First Visit',
  onSubmitted,
  onCancel,
}: DynamicFormRendererProps) {
  const { toast } = useToast();
  const [selectedForm, setSelectedForm] = useState<DynamicAssessmentForm | null>(
    initialForm || allForms[0] || null
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [formSearch, setFormSearch] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync when appointment or initialForm changes
  useEffect(() => {
    if (initialForm) {
      setSelectedForm(initialForm);
    } else if (!selectedForm && allForms.length > 0) {
      setSelectedForm(allForms[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialForm?._id, appointmentId]);

  // Load draft & initialize defaults (including `auto` → today's YYYY-MM-DD)
  useEffect(() => {
    if (!selectedForm) return;

    const todayIso = getTodayIsoDate();
    const defaults: Record<string, any> = {};
    selectedForm.questions.forEach((q) => {
      if (NON_INPUT_TYPES.has(q.questionType)) return;
      if (q.questionType === 'scale') {
        defaults[q._id] = q.scaleMin ?? 0;
      } else if (q.questionType === 'boolean') {
        defaults[q._id] = false;
      } else if (q.questionType === 'multipleChoice') {
        defaults[q._id] = [];
      } else if (q.questionType === 'auto') {
        defaults[q._id] = todayIso;
      }
    });

    const draftKey = `form_draft_${appointmentId}_${selectedForm._id}`;
    const cached = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFormData({ ...defaults, ...(parsed && typeof parsed === 'object' ? parsed : {}) });
      } catch {
        setFormData(defaults);
      }
    } else {
      setFormData(defaults);
    }
    setErrors({});
    setSubmitError(null);
  }, [selectedForm, appointmentId]);

  // Auto-save draft
  useEffect(() => {
    if (!selectedForm || Object.keys(formData).length === 0) return;
    const draftKey = `form_draft_${appointmentId}_${selectedForm._id}`;
    let clearBadgeTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
        setDraftSaved(true);
        clearBadgeTimer = setTimeout(() => setDraftSaved(false), 1500);
      } catch {
        /* storage unavailable */
      }
    }, 1500);
    return () => {
      clearTimeout(timer);
      if (clearBadgeTimer) clearTimeout(clearBadgeTimer);
    };
  }, [formData, selectedForm, appointmentId]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleToggleMultiple = (fieldId: string, option: string) => {
    const current: string[] = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    handleFieldChange(fieldId, next);
  };

  // Visible questions grouped by section (evaluating parentFieldId/visibilityValue live)
  const groupedVisibleQuestions = useMemo(() => {
    if (!selectedForm) return [] as Array<[string, DynamicQuestion[]]>;
    const groups: Record<string, DynamicQuestion[]> = {};
    selectedForm.questions.forEach((q) => {
      if (!isDynamicQuestionVisible(q, formData)) return;
      const g = q.group || 'General Clinical Examination';
      if (!groups[g]) groups[g] = [];
      groups[g].push(q);
    });
    return Object.entries(groups).filter(([, qs]) => qs.length > 0);
  }, [selectedForm, formData]);

  // Completion metrics for header pill
  const progressStats = useMemo(() => {
    if (!selectedForm) {
      return { totalFields: 0, answeredFields: 0, visibleSections: 0, pct: 0 };
    }
    const visibleInputQuestions = selectedForm.questions.filter(
      (q) => !NON_INPUT_TYPES.has(q.questionType) && isDynamicQuestionVisible(q, formData)
    );
    const answeredFields = visibleInputQuestions.filter((q) =>
      isFieldAnswered(q, formData[q._id])
    ).length;
    const totalFields = visibleInputQuestions.length;
    const pct = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 100;
    return {
      totalFields,
      answeredFields,
      visibleSections: groupedVisibleQuestions.length,
      pct,
    };
  }, [selectedForm, formData, groupedVisibleQuestions.length]);

  const scrollToField = (fieldId: string) => {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll<HTMLElement>('[data-field-id]');
    for (const el of Array.from(elements)) {
      if (el.getAttribute('data-field-id') === fieldId) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  const validate = (): { valid: boolean; firstInvalidId: string | null; missingCount: number } => {
    if (!selectedForm) return { valid: false, firstInvalidId: null, missingCount: 0 };
    const newErrors: Record<string, string> = {};
    let firstInvalidId: string | null = null;

    selectedForm.questions.forEach((q) => {
      if (NON_INPUT_TYPES.has(q.questionType)) return;
      if (!isDynamicQuestionVisible(q, formData)) return;

      if (q.required) {
        const val = formData[q._id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q._id] = 'This clinical field is required';
          if (!firstInvalidId) firstInvalidId = q._id;
        }
      }
    });

    setErrors(newErrors);
    const missingCount = Object.keys(newErrors).length;
    return { valid: missingCount === 0, firstInvalidId, missingCount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    const { valid, firstInvalidId, missingCount } = validate();
    if (!valid) {
      toast({
        variant: 'destructive',
        title: 'Mandatory Clinical Fields Required',
        description: `Please complete ${missingCount} required field${missingCount === 1 ? '' : 's'} marked with * before submitting.`,
      });
      if (firstInvalidId) {
        scrollToField(firstInvalidId);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const visiblePayloadQuestions = selectedForm.questions
        .filter((q) => !NON_INPUT_TYPES.has(q.questionType) && isDynamicQuestionVisible(q, formData))
        .map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          questionType: q.questionType,
          answer: formData[q._id],
          group: q.group,
        }));

      const payload = {
        assessmentId: selectedForm._id,
        assessmentTitle: selectedForm.title,
        assessmentDescription: selectedForm.description,
        treatmentType: selectedForm.treatmentType,
        visitType: selectedForm.visitType,
        appointmentId,
        patient: patientId,
        expert: expertId,
        questions: visiblePayloadQuestions,
      };

      const res = await providerApi.submitAssessmentResponse(payload);
      if (!res.success) {
        throw new Error(res.message || 'The server rejected this assessment.');
      }

      try {
        localStorage.removeItem(`form_draft_${appointmentId}_${selectedForm._id}`);
      } catch {
        /* ignore */
      }
      setSubmitError(null);
      toast({
        title: 'Clinical Assessment Saved',
        description: `${selectedForm.title} synced successfully.`,
      });
      onSubmitted(formData);
    } catch (err: any) {
      const msg =
        err?.message || 'Could not save this assessment. Your answers are kept — please retry.';
      setSubmitError(msg);
      toast({
        variant: 'destructive',
        title: 'Assessment Save Failed',
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredForms = allForms.filter((f) => {
    if (!formSearch.trim()) return true;
    const q = formSearch.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      (f.treatmentType && f.treatmentType.toLowerCase().includes(q)) ||
      (f.visitType && f.visitType.toLowerCase().includes(q))
    );
  });

  if (!selectedForm) {
    return (
      <div className="p-8 text-center bg-card rounded-3xl border border-border">
        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm font-bold">No assessment form found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner: Active Form Title, Progress Pill & 34-Forms Switcher Button */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-outfit font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                {selectedForm.visitType || visitType}
              </span>
              {selectedForm.treatmentType && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {selectedForm.treatmentType}
                </span>
              )}
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {progressStats.answeredFields}/{progressStats.totalFields} Fields ({progressStats.pct}%) •{' '}
                {progressStats.visibleSections}{' '}
                {progressStats.visibleSections === 1 ? 'Section' : 'Sections'}
              </span>
              {draftSaved && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Draft Autosaved
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-outfit font-extrabold text-foreground">
              {selectedForm.title}
            </h2>
            {selectedForm.description && (
              <p className="text-xs text-muted-foreground">{selectedForm.description}</p>
            )}
          </div>

          {/* Form Picker Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFormPicker(!showFormPicker)}
            className="rounded-2xl text-xs font-outfit font-bold border-primary/30 text-primary hover:bg-primary/10 shrink-0 self-start lg:self-auto flex items-center gap-2 min-h-[40px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Switch Form ({allForms.length || 34})</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showFormPicker ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressStats.pct}%` }}
          />
        </div>

        {/* Expandable Clinical Forms Selector */}
        {showFormPicker && (
          <div className="mt-4 pt-4 border-t border-border/60 space-y-3 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                placeholder="Search clinical forms (e.g. Knee, Stroke, Spine, Pediatric, Shoulder)..."
                className="pl-9 h-10 rounded-2xl text-xs"
              />
            </div>

            <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
              {filteredForms.map((form) => {
                const isSelected = form._id === selectedForm._id;
                return (
                  <button
                    key={form._id}
                    type="button"
                    onClick={() => {
                      setSelectedForm(form);
                      setShowFormPicker(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-card hover:bg-muted/60 border-border/80 text-foreground'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-outfit font-bold truncate ${
                          isSelected ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {form.title}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 truncate ${
                          isSelected ? 'text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {form.treatmentType || 'General'} • {form.visitType || 'Clinical'} •{' '}
                        {form.questions.length} Fields
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Form Questions Grouped by Section */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {groupedVisibleQuestions.map(([groupName, questions]) => {
          const sectionInputCount = questions.filter(
            (q) => !NON_INPUT_TYPES.has(q.questionType)
          ).length;
          const sectionAnsweredCount = questions.filter(
            (q) => !NON_INPUT_TYPES.has(q.questionType) && isFieldAnswered(q, formData[q._id])
          ).length;

          return (
            <div
              key={groupName}
              className="bg-card border border-border/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm font-outfit font-extrabold text-foreground truncate">
                    {groupName}
                  </h3>
                </div>
                {sectionInputCount > 0 && (
                  <span className="text-[10px] font-mono font-bold text-muted-foreground shrink-0 px-2 py-0.5 rounded-full bg-muted/60">
                    {sectionAnsweredCount}/{sectionInputCount}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {questions.map((q) => {
                  const fieldId = q._id;
                  const value = formData[fieldId];
                  const error = errors[fieldId];

                  // Non-input: Section Sub-Header Banner
                  if (q.questionType === 'header') {
                    return (
                      <div
                        key={fieldId}
                        className="md:col-span-2 pt-2 pb-1 px-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-xs font-outfit font-extrabold uppercase tracking-wide text-primary py-1.5">
                          {q.questionText}
                        </h4>
                      </div>
                    );
                  }

                  // Non-input: Line Break / Divider
                  if (q.questionType === 'lineBreak') {
                    return (
                      <div key={fieldId} className="md:col-span-2 py-1">
                        <hr className="border-t border-border/80" />
                      </div>
                    );
                  }

                  const colSpanClass = SHORT_FIELD_TYPES.has(q.questionType)
                    ? 'md:col-span-1'
                    : 'md:col-span-2';

                  return (
                    <div
                      key={fieldId}
                      data-field-id={fieldId}
                      className={`space-y-2 ${colSpanClass} ${
                        error ? 'p-3 -m-3 rounded-2xl bg-destructive/5 ring-1 ring-destructive/30' : ''
                      }`}
                    >
                      <Label className="text-xs font-outfit font-bold text-foreground flex items-center justify-between gap-2">
                        <span>
                          {q.questionText}
                          {q.required && <span className="text-destructive ml-1">*</span>}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {q.questionType === 'auto' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                              Auto Date
                            </span>
                          )}
                          {q.suffix && (
                            <span className="text-[10px] font-mono text-muted-foreground font-normal">
                              Unit: {q.suffix}
                            </span>
                          )}
                        </span>
                      </Label>

                      {/* Scale / VAS Slider */}
                      {q.questionType === 'scale' && (
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              {q.scaleMin ?? 0} (Min)
                            </span>
                            <span className="text-base font-outfit font-black text-primary px-3 py-1 bg-primary/10 rounded-xl">
                              {value !== undefined ? value : q.scaleMin ?? 0} / {q.scaleMax ?? 10}
                            </span>
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              {q.scaleMax ?? 10} (Max)
                            </span>
                          </div>
                          <input
                            type="range"
                            min={q.scaleMin ?? 0}
                            max={q.scaleMax ?? 10}
                            value={value !== undefined ? value : q.scaleMin ?? 0}
                            onChange={(e) => handleFieldChange(fieldId, parseInt(e.target.value, 10))}
                            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Single Choice Radio Chips */}
                      {q.questionType === 'singleChoice' && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options || []).map((opt) => {
                            const isSelected = value === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleFieldChange(fieldId, opt)}
                                className={`px-3.5 py-2 min-h-[38px] rounded-2xl text-xs font-outfit font-bold transition-all border ${
                                  isSelected
                                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                                    : 'bg-muted/40 text-foreground border-border/80 hover:bg-muted'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Multiple Choice Checkbox Chips */}
                      {q.questionType === 'multipleChoice' && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options || []).map((opt) => {
                            const isSelected = Array.isArray(value) && value.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleToggleMultiple(fieldId, opt)}
                                className={`px-3.5 py-2 min-h-[38px] rounded-2xl text-xs font-outfit font-bold transition-all border flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'bg-muted/40 text-foreground border-border/80 hover:bg-muted'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Long Text Area */}
                      {q.questionType === 'longText' && (
                        <textarea
                          rows={3}
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                          placeholder={
                            q.placeholder || 'Enter clinical findings and observation notes...'
                          }
                          className="w-full text-xs p-3 rounded-2xl border border-border/80 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}

                      {/* Short Text */}
                      {q.questionType === 'text' && (
                        <Input
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                          placeholder={q.placeholder || 'Enter details...'}
                          className="h-10 rounded-2xl text-xs"
                        />
                      )}

                      {/* Number */}
                      {q.questionType === 'number' && (
                        <Input
                          type="number"
                          value={value ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              fieldId,
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder={q.placeholder || '0'}
                          className="h-10 rounded-2xl text-xs font-mono"
                        />
                      )}

                      {/* Dropdown */}
                      {q.questionType === 'dropdown' && (
                        <select
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                          className="w-full h-10 px-3 rounded-2xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="">Select Option</option>
                          {(q.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Boolean Toggle */}
                      {q.questionType === 'boolean' && (
                        <label className="flex items-center gap-2.5 cursor-pointer px-3.5 h-10 bg-muted/30 rounded-2xl border border-border/60 hover:bg-muted/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
                            className="h-4 w-4 rounded accent-primary"
                          />
                          <span className="text-xs font-outfit font-bold text-foreground">
                            {value ? 'Yes / Positive Finding' : 'No / Negative'}
                          </span>
                        </label>
                      )}

                      {/* Date */}
                      {q.questionType === 'date' && (
                        <Input
                          type="date"
                          value={value || ''}
                          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                          className="h-10 rounded-2xl text-xs"
                        />
                      )}

                      {/* Auto (defaults to today's YYYY-MM-DD, editable) */}
                      {q.questionType === 'auto' && (
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <Input
                            type="date"
                            value={value || getTodayIsoDate()}
                            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                            className="h-10 pl-9 rounded-2xl text-xs font-mono bg-primary/5 border-primary/25"
                          />
                        </div>
                      )}

                      {error && (
                        <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {submitError && (
          <div className="p-4 rounded-2xl text-xs font-bold bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto h-11 rounded-2xl text-xs font-outfit font-bold"
            >
              Back to Appointments
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Clinical Assessment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Assessment & Proceed to Settlement</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
