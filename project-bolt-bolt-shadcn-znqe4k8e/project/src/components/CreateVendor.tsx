import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// Dialog components are handled by parent component
import { createVendor } from "../lib/api";
import type { CreateVendorData, Vendor } from "../lib/types";
import { useLanguage } from '@/context/LanguageContext';
import { toast } from "@/components/ui/use-toast";
import { COUNTRIES, DEFAULT_COUNTRY, isValidCountryCode } from "@/lib/countryData";
import { createStandardToastHandlers, ErrorTypes } from "../lib/errorHandling";
import { AIEnhancedDemoFiller } from "./AIEnhancedDemoFiller";

const createVendorSchema = (t: (key: string) => string) => z.object({
  cname: z.string().min(1, t('validation.companyNameRequired')),
  ccompanycode: z.enum(["1000", "2000", "3000"], {
    errorMap: () => ({ message: t('validation.companyCodeInvalid') }),
  }),

  cstreet: z.string().min(1, t('validation.streetRequired')),
  czip: z.string().min(1, t('validation.zipRequired')),
  ccity: z.string().min(1, t('validation.cityRequired')),
  ccountry: z.string().min(1, t('validation.countryRequired')).refine(isValidCountryCode, {
    message: t('validation.countryInvalid'),
  }),

  cpozip: z.string().min(1, t('validation.poZipRequired')),
  cvatnumber: z.string().min(1, t('validation.vatNumberRequired')),
  cfon: z.string().optional(),
  curl: z.string().optional(),
  bank_name: z.string().min(1, t('validation.bankNameRequired')),
  ciban: z.string().min(1, t('validation.ibanRequired')),
  cbic: z.string().min(1, t('validation.bicRequired')),
});

interface CreateVendorProps {
  onClose: () => void;
  onSuccess: () => void;
  existingVendors?: Vendor[];
}

export function CreateVendor({ onClose, onSuccess, existingVendors = [] }: CreateVendorProps) {
  const { t, currentLanguage } = useLanguage();
  const standardToast = createStandardToastHandlers(toast, t);

  const form = useForm<CreateVendorData>({
    resolver: zodResolver(createVendorSchema(t)),
    defaultValues: {
      cname: '',
      ccompanycode: '1000',

      cstreet: '',
      czip: '',
      ccity: '',
      ccountry: DEFAULT_COUNTRY,

      cpozip: '',
      cvatnumber: '',
      cfon: '',
      curl: '',
      bank_name: '',
      ciban: '',
      cbic: '',
    },
  });

  const onSubmit = async (data: CreateVendorData) => {
    try {
      await createVendor(data);
      
      // Show success message
      standardToast.showSuccess('success.vendorCreated', data.cname);
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating vendor:', error);
      standardToast.showError(ErrorTypes.DATABASE_ERROR, error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFillDemoData = (demoData: Partial<Vendor>) => {
    // Fill form fields with demo data
    Object.keys(demoData).forEach((key) => {
      const value = demoData[key as keyof typeof demoData];
      if (value !== undefined) {
        form.setValue(key as keyof CreateVendorData, value as any);
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5" />
          <span className="text-lg font-semibold">{t('vendor.createNew')}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('vendor.createDescription')}</span>
          <AIEnhancedDemoFiller
            type="vendor"
            existingData={existingVendors}
            companyCode={form.getValues('ccompanycode')}
            onFillData={handleFillDemoData}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.companyName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vendor.enterCompanyName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ccompanycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.companyCode')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('vendor.enterCompanyCode')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1000">1000</SelectItem>
                        <SelectItem value="2000">2000</SelectItem>
                        <SelectItem value="3000">3000</SelectItem>
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
                name="cstreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipient.street')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vendor.enterStreet')} {...field} />
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
                      <Input placeholder={t('vendor.enterZipCode')} {...field} />
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
                      <Input placeholder={t('vendor.enterCity')} {...field} />
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
                          <SelectValue placeholder={t('vendor.selectCountry')} />
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

            <FormField
              control={form.control}
              name="cpozip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vendor.poZip')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('vendor.enterPoZip')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvatnumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vendor.field.vatNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('vendor.placeholder.vatNumber')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cfon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vendor.field.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vendor.placeholder.phone')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="curl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vendor.field.website')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vendor.placeholder.website')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('vendor.field.bankDetails')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vendor.field.bankName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('vendor.placeholder.bankName')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ciban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vendor.field.iban')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('vendor.placeholder.iban')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cbic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vendor.field.bic')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vendor.placeholder.bic')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('buttons.cancel')}
              </Button>
              <Button type="submit">{t('create.vendor')}</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
