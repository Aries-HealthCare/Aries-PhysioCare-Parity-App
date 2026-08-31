'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { submitCallbackLead } from '@/app/actions/lead-actions';
import { withStoredAttribution } from '@/lib/growth-attribution';
import { useToast } from '@/hooks/use-toast';

interface RequestCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: Record<string, any>;
}

const formSchema = z.object({
    fullName: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequestCallbackModal({ isOpen, onClose }: RequestCallbackModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: "",
        phone: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const result = await submitCallbackLead(withStoredAttribution(data));
    if(result.error) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: result.error,
        });
    } else {
        setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setIsSubmitted(false);
        setIsLoading(false);
        form.reset();
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glassmorphic">
        {!isSubmitted ? (
            <>
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Request a Call Back</DialogTitle>
                    <DialogDescription>
                        Our team will get in touch with you shortly.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel className="sr-only">Mobile Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mobile Number" type="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full neon-accent-border">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : 'Request Call Back'}
                        </Button>
                    </form>
                </Form>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="mx-auto bg-green-500/10 text-green-500 p-4 rounded-full w-fit mb-4">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="font-headline text-2xl">Thank You!</h3>
                <p className="text-muted-foreground mt-2">
                    Our Aries PhysioCare team will call you shortly.
                </p>
                <Button onClick={handleClose} className="mt-6">Close</Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
