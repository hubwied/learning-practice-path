import { useCallback, useState } from 'react';
import {
  getFavoriteDoctorIdsFromStorage,
  saveFavoriteDoctorIdsToStorage,
} from '../services/storageService';

export const useFavoriteDoctors = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteDoctorIdsFromStorage());

  const toggleFavorite = useCallback((doctorId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(doctorId)
        ? current.filter((id) => id !== doctorId)
        : [...current, doctorId];

      saveFavoriteDoctorIdsToStorage(next);
      return next;
    });
  }, []);

  return {
    favoriteIds,
    toggleFavorite,
  };
};
