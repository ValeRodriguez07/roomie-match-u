import { useState, useEffect } from 'react';
import type { Match } from '../types';
import { matchingService } from '../services/MatchingService';
import { useApp } from '../context/AppContext';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useApp();

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await matchingService.getUserMatches(user.id);
      setMatches(data);
    } catch (err) {
      setError('Error al cargar matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMatch = await matchingService.acceptMatch(matchId);
      setMatches(prev => prev.map(match => 
        match.id === matchId ? updatedMatch : match
      ));
      return updatedMatch;
    } catch (err) {
      setError('Error al aceptar match');
      console.error('Error accepting match:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectMatch = async (matchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMatch = await matchingService.rejectMatch(matchId);
      setMatches(prev => prev.map(match => 
        match.id === matchId ? updatedMatch : match
      ));
      return updatedMatch;
    } catch (err) {
      setError('Error al rechazar match');
      console.error('Error rejecting match:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Recargar matches cada 5 segundos para ver actualizaciones
  useEffect(() => {
    if (user) {
      loadMatches();
      const interval = setInterval(loadMatches, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    matches,
    loading,
    error,
    loadMatches,
    acceptMatch,
    rejectMatch
  };
};