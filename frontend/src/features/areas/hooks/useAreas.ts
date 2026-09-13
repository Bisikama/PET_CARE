import { useEffect } from 'react';
import { useAreaStore } from '../stores/area.store';

export const useAreas = () => {
  const { areas, isLoading, error, fetchAreas } = useAreaStore();

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return { areas, isLoading, error, fetchAreas };
};
