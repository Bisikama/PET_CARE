'use client';

import * as React from 'react';
import { useProviderRegister } from '../hooks/useProviderRegister';
import { ProviderRegisterModal } from './ProviderRegisterModal';
import { ProviderAreaModal } from './ProviderAreaModal';
import { ProviderCapabilityModal } from './ProviderCapabilityModal';
import { ProviderDocumentModal } from './ProviderDocumentModal';
import { ProviderSuccessModal } from './ProviderSuccessModal';

export function ProviderModal() {
  const { step } = useProviderRegister();

  switch (step) {
    case 1:
      return <ProviderRegisterModal />;
    case 2:
      return <ProviderAreaModal />;
    case 3:
      return <ProviderCapabilityModal />;
    case 4:
      return <ProviderDocumentModal />;
    case 5:
      return <ProviderSuccessModal />;
    default:
      return null;
  }
}
