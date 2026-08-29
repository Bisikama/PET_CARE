'use client';

import * as React from 'react';
import { useProvider } from '@/features/provider';
import { ProviderRegisterModal } from './ProviderRegisterModal';
import { ProviderAddressModal } from './ProviderAddressModal';
import { ProviderDocumentModal } from './ProviderDocumentModal';
import { ProviderSuccessModal } from './ProviderSuccessModal';

export function ProviderModal() {
  const { step } = useProvider();

  switch (step) {
    case 1:
      return <ProviderRegisterModal />;
    case 2:
      return <ProviderAddressModal />;
    case 3:
      return <ProviderDocumentModal />;
    case 4:
      return <ProviderSuccessModal />;
    default:
      return null;
  }
}
