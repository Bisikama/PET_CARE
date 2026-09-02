'use client';

import * as React from 'react';
import { ServiceList } from '@/features/services';

export default function ServicesPage() {
  return (
    <div className="py-2">
      <ServiceList />
    </div>
  );
}
