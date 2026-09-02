'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Renders children directly into document.body via React Portal.
 * This bypasses any ancestor overflow-hidden / transform containing blocks,
 * so fixed-position backdrops will truly cover the full viewport.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return ReactDOM.createPortal(children, document.body);
}
