'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CountryInfo {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phoneLength: number;
  phonePlaceholder: string;
  idRequirements: Array<{
    label: string;
    type: 'text' | 'upload';
    placeholder?: string;
    regex?: string;
    isMandatory: boolean;
  }>;
  bankFields: {
    codeLabel: string;
    codePlaceholder: string;
    extraTaxLabel?: string;
    extraTaxPlaceholder?: string;
    docLabel: string;
  };
}

export const COUNTRIES_CONFIG: Record<string, CountryInfo> = {
  'India': {
    name: 'India',
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    phoneLength: 10,
    phonePlaceholder: '98201 44219',
    idRequirements: [
      {
        label: 'Aadhaar Card Number',
        type: 'text',
        placeholder: 'XXXX XXXX XXXX',
        regex: '^\\d{12}$',
        isMandatory: true,
      },
      { label: 'Aadhaar Card (Front)', type: 'upload', isMandatory: true },
      { label: 'Aadhaar Card (Back)', type: 'upload', isMandatory: true },
      { label: 'PAN Card', type: 'upload', isMandatory: true },
    ],
    bankFields: {
      codeLabel: 'IFSC Code',
      codePlaceholder: 'e.g. HDFC0001234',
      extraTaxLabel: 'PAN Card Number',
      extraTaxPlaceholder: 'ABCDE1234F',
      docLabel: 'Cancelled Cheque / Passbook',
    },
  },
  'Canada': {
    name: 'Canada',
    code: 'CA',
    dialCode: '+1',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
    phoneLength: 10,
    phonePlaceholder: '416 555 0199',
    idRequirements: [
      { label: 'Government Photo ID', type: 'upload', isMandatory: true },
    ],
    bankFields: {
      codeLabel: 'Transit & Institution Number',
      codePlaceholder: 'XXXXX-XXX',
      extraTaxLabel: 'SIN Number',
      extraTaxPlaceholder: 'XXX-XXX-XXX',
      docLabel: 'Void Cheque / Bank Letter',
    },
  },
  'United Kingdom': {
    name: 'United Kingdom',
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    phoneLength: 10,
    phonePlaceholder: '7911 123456',
    idRequirements: [
      {
        label: 'National Insurance Number',
        type: 'text',
        placeholder: 'QQ 12 34 56 C',
        regex: '^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$',
        isMandatory: true,
      },
      { label: 'Passport or BRP', type: 'upload', isMandatory: true },
    ],
    bankFields: {
      codeLabel: 'Sort Code',
      codePlaceholder: 'XX-XX-XX',
      extraTaxLabel: 'UTR Number (10 digits)',
      extraTaxPlaceholder: 'XXXXXXXXXX',
      docLabel: 'Bank Statement / Verification',
    },
  },
  'Germany': {
    name: 'Germany',
    code: 'DE',
    dialCode: '+49',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    phoneLength: 11,
    phonePlaceholder: '151 23456789',
    idRequirements: [
      { label: 'Personalausweis (National ID)', type: 'upload', isMandatory: true },
      { label: 'Anmeldung Document', type: 'upload', isMandatory: true },
    ],
    bankFields: {
      codeLabel: 'IBAN',
      codePlaceholder: 'DE89 3704 0044 0532 0130 00',
      extraTaxLabel: 'Steuer-ID (Tax Number)',
      extraTaxPlaceholder: 'XXXXXXXXXXX',
      docLabel: 'Kontoauszug (Account Confirmation)',
    },
  },
  'UAE / Dubai': {
    name: 'UAE / Dubai',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'AED',
    phoneLength: 9,
    phonePlaceholder: '50 123 4567',
    idRequirements: [
      { label: 'Emirates ID (Front & Back)', type: 'upload', isMandatory: true },
      { label: 'Passport + Residence Visa', type: 'upload', isMandatory: true },
    ],
    bankFields: {
      codeLabel: 'IBAN',
      codePlaceholder: 'AE07 0331 2345 6789 0123 456',
      extraTaxLabel: 'Tax Registration Number (TRN)',
      extraTaxPlaceholder: 'Optional',
      docLabel: 'Bank Account Confirmation Letter',
    },
  },
  'United States': {
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    phoneLength: 10,
    phonePlaceholder: '202 555 0125',
    idRequirements: [
      { label: 'Driver’s License / State ID', type: 'upload', isMandatory: true },
      {
        label: 'SSN (Social Security Number)',
        type: 'text',
        placeholder: 'XXX-XX-XXXX',
        regex: '^\\d{3}-?\\d{2}-?\\d{4}$',
        isMandatory: true,
      },
    ],
    bankFields: {
      codeLabel: 'Routing Transit Number (ABA)',
      codePlaceholder: '9-digit Routing Number',
      extraTaxLabel: 'SSN / EIN',
      extraTaxPlaceholder: 'XXX-XX-XXXX',
      docLabel: 'Voided Check / Direct Deposit Form',
    },
  },
};

interface CountrySelectorProps {
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  className?: string;
  compact?: boolean;
}

export function CountrySelector({
  selectedCountry,
  onSelectCountry,
  className = '',
  compact = false,
}: CountrySelectorProps) {
  const current = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  return (
    <Select value={selectedCountry} onValueChange={onSelectCountry}>
      <SelectTrigger className={`bg-card/70 border-border rounded-xl text-xs font-semibold ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{current.flag}</span>
            <span>{compact ? current.dialCode : `${current.name} (${current.dialCode})`}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border rounded-2xl shadow-xl z-50">
        {Object.values(COUNTRIES_CONFIG).map((c) => (
          <SelectItem key={c.name} value={c.name} className="text-xs font-medium cursor-pointer py-2">
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">{c.flag}</span>
              <span className="font-semibold">{c.name}</span>
              <span className="text-muted-foreground font-mono text-[11px] ml-auto">{c.dialCode}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
