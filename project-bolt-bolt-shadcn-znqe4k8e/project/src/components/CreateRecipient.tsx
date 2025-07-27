import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users } from 'lucide-react';
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// Dialog components are handled by parent component
import { createRecipient } from "../lib/api";
import type { CreateRecipientData, Recipient } from "../lib/types";
import { useLanguage } from '@/context/LanguageContext';
import { toast } from "@/components/ui/use-toast";
import { COUNTRIES, DEFAULT_COUNTRY, isValidCountryCode } from "@/lib/countryData";
import { createStandardToastHandlers, ErrorTypes } from "../lib/errorHandling";
import { AIEnhancedDemoFiller } from "./AIEnhancedDemoFiller";

const createRecipientSchema = (t: (key: string) => string) => z.object({
  ccompanycode: z.enum(["1000", "2000", "3000"], {
    errorMap: () => ({ message: t('validation.companyCodeInvalid') }),
  }),
  cname: z.string().min(1, t('validation.companyNameRequired')),

  cstreet: z.string().min(1, t('validation.streetRequired')),
  czip: z.string().min(1, t('validation.zipRequired')),
  ccity: z.string().min(1, t('validation.cityRequired')),
  ccountry: z.string().min(1, t('validation.countryRequired')).refine(isValidCountryCode, {
    message: t('validation.countryInvalid'),
  }),
  
  cfon: z.string().optional(),
  cemail: z.string().email(t('validation.emailInvalid')).optional().or(z.literal('')),
  cvatnumber: z.string().optional(),
});

interface CreateRecipientProps {
  onClose: () => void;
  onSuccess: () => void;
  existingRecipients?: Recipient[];
}

export function CreateRecipient({ onClose, onSuccess, existingRecipients = [] }: CreateRecipientProps) {
  const { t, currentLanguage } = useLanguage();
  const standardToast = createStandardToastHandlers(toast, t);

  const form = useForm<CreateRecipientData>({
    resolver: zodResolver(createRecipientSchema(t)),
    defaultValues: {
      ccompanycode: '1000',
      cname: '',
      cstreet: '',
      czip: '',
      ccity: '',
      ccountry: DEFAULT_COUNTRY,
      cfon: '',
      cemail: '',
      cvatnumber: '',
    },
  });

  const onSubmit = async (data: CreateRecipientData) => {
    try {
      await createRecipient(data);
      
      // Show success message
      standardToast.showSuccess('success.recipientCreated', data.cname);
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating recipient:', error);
      standardToast.showError(ErrorTypes.DATABASE_ERROR, error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFillDemoData = (demoData: Partial<Recipient>) => {
    // Fill form fields with demo data
    Object.keys(demoData).forEach((key) => {
      const value = demoData[key as keyof typeof demoData];
      if (value !== undefined) {
        form.setValue(key as keyof CreateRecipientData, value as any);
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <span className="text-lg font-semibold">{t('recipient.createNew')}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('recipient.createDescription')}</span>
          <AIEnhancedDemoFiller
            type="recipient"
            existingData={existingRecipients}
            companyCode={form.getValues('ccompanycode')}
            onFillData={handleFillDemoData}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ccompanycode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('recipient.companyCode')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('recipient.enterCompanyCode')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1000">1000 - EUR (Deutschland)</SelectItem>
                      <SelectItem value="2000">2000 - GBP (United Kingdom)</SelectItem>
                      <SelectItem value="3000">3000 - CHF (Schweiz)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.companyName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipient.enterCompanyName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cstreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.street')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipient.enterStreet')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="czip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.zipCode')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipient.enterZipCode')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ccity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipient.enterCity')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ccountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.country')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('recipient.selectCountry')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cfon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipient.enterPhone')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cemail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('recipient.enterEmail')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cvatnumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('recipient.vatNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('recipient.enterVatNumber')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('buttons.cancel')}
              </Button>
              <Button type="submit">{t('buttons.createRecipient')}</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
