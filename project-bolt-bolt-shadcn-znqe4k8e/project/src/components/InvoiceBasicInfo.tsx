import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Vendor, Recipient } from "../lib/types";
import { BasicInfo } from "../types/forms";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";
import { findVendorById, formatDbId } from "../lib/idUtils";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicInfoProps {
  mode: 'MM' | 'FI';
  vendors?: Vendor[];
  recipients?: Recipient[];
}

export function InvoiceBasicInfo({
  mode,
  vendors = [],
  recipients = [],
}: BasicInfoProps) {
  const { control, formState: { errors }, setValue, watch } = useFormContext<BasicInfo>();
  const { t } = useLanguage();

  // Helper function to get validation state styling
  const getValidationState = (fieldName: keyof BasicInfo, fieldValue: any, isRequired = false) => {
    const hasError = !!errors[fieldName];
    const hasValue = fieldValue && fieldValue.toString().trim() !== '';
    const isEmpty = !hasValue;
    
    return {
      hasError,
      hasValue,
      isEmpty,
      isValid: hasValue && !hasError,
      isInvalid: hasError || (isRequired && isEmpty)
    };
  };

  // Get field validation styles
  const getFieldStyles = (state: ReturnType<typeof getValidationState>) => {
    return cn(
      "h-11 transition-all duration-200",
      {
        // Error state
        "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50": state.hasError,
        // Valid state  
        "border-green-300 focus:border-green-400 focus:ring-green-100": state.isValid,
        // Empty required field
        "border-orange-300 focus:border-orange-400 focus:ring-orange-100": state.isInvalid && !state.hasError,
        // Default state
        "border-purple-200 focus:border-purple-400 focus:ring-purple-100": !state.hasError && !state.isValid && !state.isInvalid
      }
    );
  };

  // Watch for vendor and recipient changes to filter both ways
  const selectedVendorId = watch('vendorId');
  const selectedRecipientId = watch('recipientId');
  const selectedVendor = selectedVendorId ? findVendorById(vendors, selectedVendorId) : null;
  const selectedRecipient = selectedRecipientId ? recipients.find(r => formatDbId(r.cid) === selectedRecipientId) : null;
  
  // Filter recipients by matching company code of selected vendor
  const filteredRecipients = selectedVendor 
    ? recipients.filter(r => r.ccompanycode === selectedVendor.ccompanycode)
    : recipients;

  // Filter vendors by matching company code of selected recipient
  const filteredVendors = selectedRecipient 
    ? vendors.filter(v => v.ccompanycode === selectedRecipient.ccompanycode)
    : vendors;

  // Auto-select recipient based on vendor company code
  const handleVendorChange = (vendorId: string) => {
    const selectedVendor = findVendorById(vendors, vendorId);
    if (selectedVendor && selectedVendor.ccompanycode) {
      // Clear current recipient selection
      setValue('recipientId', '');
      // Find recipient with matching company code
      const matchingRecipient = recipients.find(r => r.ccompanycode === selectedVendor.ccompanycode);
      if (matchingRecipient) {
        setValue('recipientId', formatDbId(matchingRecipient.cid));
      }
    }
  };

  // Auto-select vendor based on recipient company code
  const handleRecipientChange = (recipientId: string) => {
    const selectedRecipient = recipients.find(r => formatDbId(r.cid) === recipientId);
    if (selectedRecipient && selectedRecipient.ccompanycode) {
      // Clear current vendor selection
      setValue('vendorId', '');
      // Find vendor with matching company code
      const matchingVendor = vendors.find(v => v.ccompanycode === selectedRecipient.ccompanycode);
      if (matchingVendor) {
        setValue('vendorId', formatDbId(matchingVendor.cid));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white backdrop-blur-sm rounded-lg shadow-lg">
        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
            <FileText className="h-4 w-4 text-white" />
          </div>
          {t('form.basicInformation')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="invoiceNumber"
            control={control}
            render={({ field }) => {
              const validationState = getValidationState('invoiceNumber', field.value, true);
              return (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {t('form.invoiceNumber')}<span className="text-red-500 ml-1">*</span>
                    {validationState.isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {validationState.hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className={getFieldStyles(validationState)}
                      placeholder="z.B. INV-2024-001"
                    />
                  </FormControl>
                  {errors.invoiceNumber && (
                    <FormMessage className="text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.invoiceNumber.message}
                    </FormMessage>
                  )}
                  {validationState.isInvalid && !validationState.hasError && (
                    <div className="text-orange-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Dieses Feld ist erforderlich
                    </div>
                  )}
                </FormItem>
              );
            }}
          />

          <FormField
            name="vendorId"
            control={control}
            render={({ field }) => {
              const validationState = getValidationState('vendorId', field.value, true);
              return (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {t('form.vendor')}<span className="text-red-500 ml-1">*</span>
                    {validationState.isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {validationState.hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </FormLabel>
                  <Select {...field} onValueChange={(value) => {
                    field.onChange(value);
                    handleVendorChange(value);
                  }}>
                    <FormControl>
                      <SelectTrigger className={getFieldStyles(validationState)}>
                        <SelectValue placeholder={t('placeholder.selectVendor')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVendors.map((vendor) => (
                        <SelectItem key={vendor.cid} value={formatDbId(vendor.cid)}>
                          {vendor.cname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendorId && (
                    <FormMessage className="text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.vendorId.message}
                    </FormMessage>
                  )}
                  {validationState.isInvalid && !validationState.hasError && (
                    <div className="text-orange-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Bitte Lieferanten auswählen
                    </div>
                  )}
                </FormItem>
              );
            }}
          />

          <FormField
            name="recipientId"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  {t('form.recipient')}
                </FormLabel>
                <Select {...field} onValueChange={(value) => {
                  field.onChange(value);
                  handleRecipientChange(value);
                }}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-purple-200/50 bg-purple-50/30">
                      <SelectValue placeholder={t('placeholder.selectRecipient')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredRecipients.map((recipient) => (
                      <SelectItem key={recipient.cid} value={formatDbId(recipient.cid)}>
                        {recipient.cname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recipientId && <FormMessage>{errors.recipientId.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="invoiceDate"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  {t('form.invoiceDate')}<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-100" 
                  />
                </FormControl>
                {errors.invoiceDate && <FormMessage>{errors.invoiceDate.message}</FormMessage>}
              </FormItem>
            )}
          />

          {mode === 'MM' && (
            <>
              <FormField
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('form.orderDate')}<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-100" 
                      />
                    </FormControl>
                    {errors.orderDate && <FormMessage>{errors.orderDate.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t('form.deliveryDate')}<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-100" 
                      />
                    </FormControl>
                    {errors.deliveryDate && <FormMessage>{errors.deliveryDate.message}</FormMessage>}
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            name="customerNumber"
            control={control}
            render={({ field }) => {
              const validationState = getValidationState('customerNumber', field.value, true);
              return (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {t('form.customerNumber')}<span className="text-red-500 ml-1">*</span>
                    {validationState.isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {validationState.hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className={getFieldStyles(validationState)}
                      placeholder="z.B. CUST-001"
                    />
                  </FormControl>
                  {errors.customerNumber && (
                    <FormMessage className="text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.customerNumber.message}
                    </FormMessage>
                  )}
                  {validationState.isInvalid && !validationState.hasError && (
                    <div className="text-orange-600 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Kundennummer ist erforderlich
                    </div>
                  )}
                </FormItem>
              );
            }}
          />

          <FormField
            name="processor"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  {t('form.processor')}
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="h-11 border-purple-200 focus:border-purple-400 focus:ring-purple-100" 
                  />
                </FormControl>
                {errors.processor && <FormMessage>{errors.processor.message}</FormMessage>}
              </FormItem>
            )}
          />

        </div>
      </div>
    </div>
  );
}
