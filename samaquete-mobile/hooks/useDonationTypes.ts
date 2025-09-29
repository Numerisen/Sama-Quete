import { useState, useEffect } from 'react';
import { DonationTypeService, DonationType } from '../lib/donationTypeService';

export const useDonationTypes = (diocese?: string) => {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDonationTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let types: DonationType[];
        if (diocese) {
          types = await DonationTypeService.getActiveTypesByDiocese(diocese);
        } else {
          types = await DonationTypeService.getActiveTypes();
        }
        
        setDonationTypes(types);
      } catch (err) {
        console.error('Erreur lors du chargement des types de dons:', err);
        setError('Impossible de charger les types de dons');
      } finally {
        setLoading(false);
      }
    };

    loadDonationTypes();
  }, [diocese]);

  return {
    donationTypes,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      const loadDonationTypes = async () => {
        try {
          setError(null);
          let types: DonationType[];
          if (diocese) {
            types = await DonationTypeService.getActiveTypesByDiocese(diocese);
          } else {
            types = await DonationTypeService.getActiveTypes();
          }
          setDonationTypes(types);
        } catch (err) {
          console.error('Erreur lors du rechargement des types de dons:', err);
          setError('Impossible de recharger les types de dons');
        } finally {
          setLoading(false);
        }
      };
      loadDonationTypes();
    }
  };
};

export const useDonationTypesRealtime = (diocese?: string) => {
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = () => {
      try {
        setLoading(true);
        setError(null);

        if (diocese) {
          unsubscribe = DonationTypeService.subscribeToActiveTypesByDiocese(
            diocese,
            (types) => {
              setDonationTypes(types);
              setLoading(false);
            }
          );
        } else {
          unsubscribe = DonationTypeService.subscribeToActiveTypes(
            (types) => {
              setDonationTypes(types);
              setLoading(false);
            }
          );
        }
      } catch (err) {
        console.error('Erreur lors de la configuration de l\'écoute en temps réel:', err);
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
  }, [diocese]);

  return {
    donationTypes,
    loading,
    error
  };
};
