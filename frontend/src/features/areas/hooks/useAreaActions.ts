import { useAreaStore } from '../stores/area.store';

export const useAreaActions = () => {
  const { addArea, updateArea, deleteArea } = useAreaStore();
  return { addArea, updateArea, deleteArea };
};
