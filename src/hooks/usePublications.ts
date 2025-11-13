import { useState, useEffect } from "react";
import type { Publication } from "../types";
import { publicationService } from "../services/PublicationService";

export const usePublications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPublications = async (filters?: {
    location?: string;
    city?: string;
    country?: string;
    maxPrice?: number;
    minPrice?: number;
    roomType?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = filters
        ? await publicationService.searchPublications(filters)
        : await publicationService.getActivePublications();
      setPublications(data);
    } catch (err) {
      setError("Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const createPublication = async (publicationData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newPublication = await publicationService.createPublication(
        publicationData
      );
      setPublications((prev) => [newPublication, ...prev]);
      return newPublication;
    } catch (err) {
      setError("Error al crear publicación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePublication = async (publicationId: string, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPublication = await publicationService.updatePublication(
        publicationId,
        updates
      );
      setPublications((prev) =>
        prev.map((pub) => (pub.id === publicationId ? updatedPublication : pub))
      );
      return updatedPublication;
    } catch (err) {
      setError("Error al actualizar publicación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePublication = async (publicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await publicationService.deletePublication(publicationId);
      setPublications((prev) => prev.filter((pub) => pub.id !== publicationId));
    } catch (err) {
      setError("Error al eliminar publicación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    publications,
    loading,
    error,
    loadPublications,
    createPublication,
    updatePublication,
    deletePublication,
  };
};
