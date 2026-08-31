'use client';

import * as React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { services } from '@/lib/placeholder-data';
import { IndianStates } from '@/lib/locations';
import { Textarea } from '@/components/ui/textarea';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar as CalendarIcon,
  Stethoscope,
  Clock,
  Check,
  FileText
} from 'lucide-react';
import AppointmentCalendar from './AppointmentCalendar';
import { TimeSlots } from './TimeSlots';
import { submitAppointmentLead } from '@/app/actions/lead-actions';
import { getStoredAttribution } from '@/lib/growth-attribution';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STANDARD_PRICING_TIERS, getTierForLocation } from '@/lib/pricing-packages';

const steps = [
  { id: 'profile', title: 'Patient Profile', subtitle: 'Personal & Visit Location' },
  { id: 'schedule', title: 'Service & Schedule', subtitle: 'Select Package & Slot' },
  { id: 'payment', title: 'Payment Preference', subtitle: 'Transparent Billing' },
  { id: 'confirm', title: 'Review & Finalize', subtitle: 'Confirm Booking Request' },
];

const bookingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Invalid email address'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area Hub is required'),
  address: z.string().min(1, 'Full address is required'),
  service: z.string().min(1, 'Service is required'),
  date: z.date({ required_error: 'Please select an appointment date' }),
  time: z.string().min(1, 'Please select a preferred time slot'),
  paymentMethod: z.enum(['card', 'upi', 'cash']).default('card'),
  condition: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  service?: string;
  condition?: string;
  therapist?: string;
  onSubmitted?: () => void;
  className?: string;
  isModal?: boolean;
}

export default function BookingForm({
  service,
  condition,
  therapist,
  onSubmitted,
  className,
  isModal = false
}: BookingFormProps) {
  const searchParams = useSearchParams();
  const initialTierParam = searchParams?.get('tier') || '';
  const initialPkgParam = searchParams?.get('package') || '1';

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedPlanDays, setSelectedPlanDays] = useState<string>(
    ['10', '15', '20', '30'].includes(initialPkgParam) ? initialPkgParam : '1'
  );
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      state: '',
      city: '',
      area: '',
      address: '',
      service: service || '',
      time: '',
      paymentMethod: 'card',
      condition: condition || '',
    },
  });

  const selectedState = form.watch('state');
  const selectedCity = form.watch('city');
  const selectedArea = form.watch('area');
  const selectedAddress = form.watch('address');
  const selectedTime = form.watch('time');
  const selectedDate = form.watch('date');
  const paymentMethod = form.watch('paymentMethod');

  const states = IndianStates;
  const cities = states.find((s) => s.slug === selectedState)?.cities || [];
  const areas = cities.find((c) => c.slug === selectedCity)?.areas || [];

  const locationTier = React.useMemo(() => {
    if (initialTierParam && STANDARD_PRICING_TIERS[initialTierParam]) {
      return STANDARD_PRICING_TIERS[initialTierParam];
    }
    const locationString = `${selectedArea} ${selectedCity} ${selectedAddress}`;
    return getTierForLocation(locationString);
  }, [selectedArea, selectedCity, selectedAddress, initialTierParam]);

  const planPricing = React.useMemo(() => {
    if (selectedPlanDays === '10') {
      const p = locationTier.packages.days10;
      return { days: 10, title: '10 Days Recovery Plan', rate: p.ratePerSession, total: p.totalPrice, savings: p.totalSavings };
    }
    if (selectedPlanDays === '15') {
      const p = locationTier.packages.days15;
      return { days: 15, title: '15 Days Rehabilitation Plan', rate: p.ratePerSession, total: p.totalPrice, savings: p.totalSavings };
    }
    if (selectedPlanDays === '20') {
      const p = locationTier.packages.days20;
      return { days: 20, title: '20 Days Intensive Rehab', rate: p.ratePerSession, total: p.totalPrice, savings: p.totalSavings };
    }
    if (selectedPlanDays === '30') {
      const p = locationTier.packages.days30;
      return { days: 30, title: '30 Days Complete Care Plan', rate: p.ratePerSession, total: p.totalPrice, savings: p.totalSavings };
    }
    return { days: 1, title: 'Single Assessment & Treatment Session', rate: locationTier.basePrice, total: locationTier.basePrice, savings: 0 };
  }, [selectedPlanDays, locationTier]);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const nextStep = async () => {
    let fieldsToValidate: (keyof BookingFormValues)[] = [];
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['fullName', 'phone', 'email', 'state', 'city', 'area', 'address'];
        break;
      case 1:
        fieldsToValidate = ['service', 'date', 'time'];
        break;
      case 2:
        fieldsToValidate = ['paymentMethod'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: BookingFormValues) => {
    setIsLoading(true);
    const result = await submitAppointmentLead({
      ...data,
      therapist: therapist || undefined,
      country: 'India',
      ...getStoredAttribution(),
      planDays: selectedPlanDays,
      pricing: planPricing,
    } as any);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
    } else {
      trackEvent('generate_lead_appointment', { service: data.service, plan: selectedPlanDays });
      setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 h-full min-h-[420px] bg-card text-card-foreground rounded-3xl animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative mx-auto bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 p-6 rounded-full w-fit border border-emerald-500/30 shadow-xl">
            <CheckCircle className="h-14 w-14" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Appointment Request Received
        </div>
        <h3 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Clinical Coordination in Progress
        </h3>
        <p className="text-muted-foreground mt-3 max-w-md text-sm font-medium leading-relaxed">
          Your home visit appointment request has been scheduled into our clinical portal. Our team will verify therapist availability and reach out to confirm your session.
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left max-w-md w-full space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Patient:</span>
            <span className="font-bold text-foreground">{form.getValues('fullName')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-bold text-foreground">
              {services.find((s) => s.slug === form.getValues('service'))?.name || form.getValues('service')}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Package:</span>
            <span className="font-bold text-emerald-400">{planPricing.title}</span>
          </div>
        </div>

        <Button
          onClick={onSubmitted}
          className="mt-8 h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
        >
          Return to Portal
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card/95 text-card-foreground',
        isModal
          ? 'w-full'
          : 'p-6 md:p-10 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl',
        className
      )}
    >
      {/* ─── Header & Stepper ───────────────────────────────── */}
      <div className={cn("px-6 pt-6 pb-4 border-b border-border/10 shrink-0", isModal ? "md:px-8" : "px-0 pt-0")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                Aries PhysioCare • Home Visit
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-headline tracking-tight text-foreground">
              {steps[currentStep].title}
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-muted-foreground">
              Step <strong className="text-foreground">{currentStep + 1}</strong> of {steps.length}
            </span>
            <p className="text-[10px] uppercase font-semibold text-primary/80 tracking-wider">
              {steps[currentStep].subtitle}
            </p>
          </div>
        </div>

        {/* ─── Stepper Progress Bar ──────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {steps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;
            return (
              <div key={step.id} className="flex flex-col gap-1.5">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    isCompleted
                      ? 'bg-primary shadow-sm shadow-primary/40'
                      : isCurrent
                      ? 'bg-primary ring-2 ring-primary/20 shadow-md shadow-primary/50'
                      : 'bg-white/10 dark:bg-white/5'
                  )}
                />
                <div className="hidden sm:flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary border border-primary/50'
                        : 'text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold truncate transition-colors',
                      isCurrent
                        ? 'text-foreground'
                        : isCompleted
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Scrollable Form Body ───────────────────────────── */}
      <div className={cn("flex-1 overflow-y-auto px-6 py-6", isModal ? "md:px-8" : "px-0")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="booking-lead-form" className="space-y-6">
            {/* STEP 0: PATIENT PROFILE & LOCATION */}
            {currentStep === 0 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" /> Patient Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Rahul Sharma"
                            {...field}
                            className="h-12 bg-white/[0.04] dark:bg-black/30 border-white/10 hover:border-primary/40 focus:border-primary rounded-xl text-sm font-medium"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" /> WhatsApp / Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 9876543210"
                            type="tel"
                            {...field}
                            className="h-12 bg-white/[0.04] dark:bg-black/30 border-white/10 hover:border-primary/40 focus:border-primary rounded-xl text-sm font-medium"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. rahul@gmail.com"
                          type="email"
                          {...field}
                          className="h-12 bg-white/[0.04] dark:bg-black/30 border-white/10 hover:border-primary/40 focus:border-primary rounded-xl text-sm font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="p-4 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Visit Location Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            State
                          </FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue('city', '');
                              form.setValue('area', '');
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.04] dark:bg-black/40 border-white/10 rounded-xl text-xs">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glassmorphic">
                              {states.map((s) => (
                                <SelectItem key={s.slug} value={s.slug}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            City
                          </FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue('area', '');
                            }}
                            value={field.value}
                            disabled={!selectedState}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.04] dark:bg-black/40 border-white/10 rounded-xl text-xs">
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glassmorphic">
                              {cities.map((c) => (
                                <SelectItem key={c.slug} value={c.slug}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Area Hub
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCity}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.04] dark:bg-black/40 border-white/10 rounded-xl text-xs">
                                <SelectValue placeholder="Select Area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glassmorphic">
                              {areas.map((a) => (
                                <SelectItem key={a.slug} value={a.slug}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary" /> Complete Street Address (Flat / House No., Landmark)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. Flat 402, Sea Breeze Apts, 14th Road, Bandra West, Mumbai 400050"
                            {...field}
                            className="h-20 bg-white/[0.04] dark:bg-black/40 border-white/10 hover:border-primary/40 focus:border-primary rounded-xl text-xs resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: SERVICE, PLAN & SCHEDULE */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-primary" /> Clinical Specialization
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!service}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white/[0.04] dark:bg-black/30 border-white/10 rounded-xl text-sm font-medium">
                            <SelectValue placeholder="Choose a clinical service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glassmorphic">
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.slug}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Treatment Package Options */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Select Care Package (Location-Based Savings)
                    </Label>
                    <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30">
                      Tier: {locationTier.name} (₹{locationTier.basePrice}/sess)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {[
                      { id: '1', name: '1 Session', rate: `₹${locationTier.basePrice}`, total: `₹${locationTier.basePrice}`, badge: 'Single Visit' },
                      { id: '10', name: '10 Days Plan', rate: `₹${locationTier.packages.days10.ratePerSession}/sess`, total: `₹${locationTier.packages.days10.totalPrice}`, badge: `Save ₹${locationTier.packages.days10.totalSavings}` },
                      { id: '15', name: '15 Days Plan', rate: `₹${locationTier.packages.days15.ratePerSession}/sess`, total: `₹${locationTier.packages.days15.totalPrice}`, badge: `Save ₹${locationTier.packages.days15.totalSavings}` },
                      { id: '20', name: '20 Days Plan', rate: `₹${locationTier.packages.days20.ratePerSession}/sess`, total: `₹${locationTier.packages.days20.totalPrice}`, badge: `Save ₹${locationTier.packages.days20.totalSavings}` },
                      { id: '30', name: '30 Days Plan', rate: `₹${locationTier.packages.days30.ratePerSession}/sess`, total: `₹${locationTier.packages.days30.totalPrice}`, badge: `★ Save ₹${locationTier.packages.days30.totalSavings}`, highlight: true },
                    ].map((plan) => {
                      const isSelected = selectedPlanDays === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanDays(plan.id)}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between',
                            isSelected
                              ? 'bg-primary/15 border-primary shadow-lg shadow-primary/20 ring-1 ring-primary'
                              : 'bg-white/[0.03] dark:bg-black/30 border-white/10 hover:border-primary/40 hover:bg-white/[0.06]'
                          )}
                        >
                          <div>
                            <span className="text-xs font-bold text-foreground block">{plan.name}</span>
                            <p className="text-xs font-mono font-bold text-primary mt-0.5">{plan.total}</p>
                            <p className="text-[10px] text-muted-foreground">{plan.rate}</p>
                          </div>
                          <span
                            className={cn(
                              'inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-2 text-center',
                              plan.highlight
                                ? 'bg-purple-500/20 text-purple-300'
                                : isSelected
                                ? 'bg-primary/20 text-primary-foreground'
                                : 'bg-emerald-500/10 text-emerald-400'
                            )}
                          >
                            {plan.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar & Time Slots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Select Visit Date
                        </FormLabel>
                        <FormControl>
                          <AppointmentCalendar onDateSelect={field.onChange} selectedDate={field.value} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" /> Preferred Time Slot
                          </FormLabel>
                          <FormControl>
                            <TimeSlots slots={timeSlots} selected={selectedTime} onSelect={field.onChange} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-primary" /> Clinical Concern / Condition (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Post-op Knee Rehab, Sciatica, Neck Pain"
                              {...field}
                              disabled={!!condition}
                              className="h-11 bg-white/[0.04] dark:bg-black/30 border-white/10 rounded-xl text-xs"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT PREFERENCE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-1.5 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-headline text-foreground">Choose Payment Preference</h3>
                  <p className="text-xs text-muted-foreground">
                    All Aries clinical sessions include digital invoicing and receipt after verification.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                        >
                          {[
                            { value: 'card', label: 'Credit / Debit Card', desc: 'Secure payment gateway link', icon: CreditCard },
                            { value: 'upi', label: 'UPI / Digital QR', desc: 'GPay, PhonePe, Paytm, QR', icon: Smartphone },
                            { value: 'cash', label: 'Pay After Session', desc: 'Direct to therapist post-visit', icon: Banknote },
                          ].map((method) => {
                            const isSelected = paymentMethod === method.value;
                            return (
                              <FormItem key={method.value}>
                                <FormControl>
                                  <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={method.value}
                                  className={cn(
                                    'flex flex-col items-center justify-center text-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 gap-3 h-full',
                                    isSelected
                                      ? 'border-primary bg-primary/10 text-foreground shadow-lg shadow-primary/15 ring-1 ring-primary'
                                      : 'border-white/10 bg-white/[0.03] dark:bg-black/30 hover:border-primary/40 hover:bg-white/[0.06]'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                                      isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-white/5 text-muted-foreground'
                                    )}
                                  >
                                    <method.icon className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-xs block text-foreground">{method.label}</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{method.desc}</span>
                                  </div>
                                </Label>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Plan Pricing Summary Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{planPricing.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Location Tier: <strong className="text-foreground">{locationTier.name}</strong> • ₹{planPricing.rate}/session
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-mono font-black text-emerald-400">₹{planPricing.total.toLocaleString('en-IN')}</p>
                    {planPricing.savings > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        Savings: ₹{planPricing.savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & FINALIZE */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] dark:from-white/[0.03] dark:to-transparent border border-white/15 space-y-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-32 h-32 text-primary" />
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intake Verification</p>
                        <p className="text-sm font-bold text-foreground">Verified Home Healthcare Visit</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-cyan-400 border-cyan-500/30">
                      Active Intake
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 text-xs">
                    <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Service</p>
                      <p className="font-bold text-foreground text-sm">
                        {services.find((s) => s.slug === form.getValues('service'))?.name || form.getValues('service')}
                      </p>
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Schedule</p>
                      <p className="font-bold text-foreground text-sm">
                        {form.getValues('date')?.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        @ {form.getValues('time')}
                      </p>
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Patient Contact</p>
                      <p className="font-bold text-foreground text-sm">
                        {form.getValues('fullName')} • {form.getValues('phone')}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{form.getValues('email')}</p>
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Visit Address</p>
                      <p className="font-medium text-muted-foreground text-xs leading-relaxed line-clamp-2">
                        {form.getValues('address')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Selected Package</p>
                      <p className="text-sm font-bold text-foreground">{planPricing.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Preference: <strong className="uppercase text-foreground">{form.getValues('paymentMethod')}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black font-mono text-emerald-400">
                        ₹{planPricing.total.toLocaleString('en-IN')}
                      </p>
                      {planPricing.savings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Saved ₹{planPricing.savings.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* ─── Sticky Action Footer ───────────────────────────── */}
      <div
        className={cn(
          'px-6 py-4 bg-background/95 backdrop-blur-md border-t border-border/10 flex items-center justify-between gap-3 shrink-0 z-20',
          isModal ? 'md:px-8' : 'px-0 pb-0 bg-transparent'
        )}
      >
        {currentStep > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
            className="h-12 px-5 rounded-xl font-bold uppercase text-xs tracking-wider border-white/10 hover:bg-white/5 hover:border-primary/40 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground hidden sm:block">
            Verified Home Visit Protocol
          </div>
        )}

        <div className="flex-1 sm:flex-initial sm:min-w-[220px] ml-auto">
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span>
                {currentStep === 0 && 'Continue to Schedule'}
                {currentStep === 1 && 'Continue to Payment'}
                {currentStep === 2 && 'Review Details'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Confirm & Book Visit
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
