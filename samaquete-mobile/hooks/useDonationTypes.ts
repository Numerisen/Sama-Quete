import { useState, useEffect } from 'react';
import { DonationTypeService, DonationType } from '../lib/donationTypeService';

export const useDonationTypes = (parishId?: string) => {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parishId) {
      setLoading(false);
      return;
    }

    const loadDonationTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const types = await DonationTypeService.getActiveTypesByParish(parishId);
        setDonationTypes(types);
        
        console.log('✅ Types de dons chargés:', types.length, 'pour paroisse:', parishId);
      } catch (err) {
        console.error('❌ Erreur lors du chargement des types de dons:', err);
        setError('Impossible de charger les types de dons');
      } finally {
        setLoading(false);
      }
    };

    loadDonationTypes();
  }, [parishId]);

  return {
    donationTypes,
    loading,
    error,
    refetch: () => {
      if (!parishId) return;
      
      setLoading(true);
      const loadDonationTypes = async () => {
        try {
          setError(null);
          const types = await DonationTypeService.getActiveTypesByParish(parishId);
          setDonationTypes(types);
        } catch (err) {
          console.error('❌ Erreur lors du rechargement des types de dons:', err);
          setError('Impossible de recharger les types de dons');
        } finally {
          setLoading(false);
        }
      };
      loadDonationTypes();
    }
  };
};

export const useDonationTypesRealtime = (parishId?: string) => {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parishId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = () => {
      try {
        setLoading(true);
        setError(null);

        unsubscribe = DonationTypeService.subscribeToActiveTypesByParish(
          parishId,
          (types) => {
            setDonationTypes(types);
            setLoading(false);
            console.log('🔄 Types de dons mis à jour en temps réel:', types.length);
          }
        );
      } catch (err) {
        console.error('❌ Erreur lors de la configuration de l\'écoute en temps réel:', err);
        setError('Impossible de configurer l\'écoute en temps réel');
        setLoading(false);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [parishId]);

  return {
    donationTypes,
    loading,
    error
  };
};
