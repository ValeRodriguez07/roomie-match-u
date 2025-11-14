import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import type { Publication } from "../types";
import { PublicationCard } from "./PublicationCard";
import { usePublications } from "../hooks/usePublications";
import { matchingService } from "../services/MatchingService";
import { useApp } from "../context/AppContext";
import { useMatches } from "../hooks/useMatches"; // AGREGAR ESTA IMPORTACIÓN

export const ExploreScreen: React.FC = () => {
  const [filters, setFilters] = useState({
    location: "",
    city: "",
    maxPrice: 1000,
    minPrice: 0,
    roomType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { publications, loading, error, loadPublications } = usePublications();
  const { user, t } = useApp();
  const { matches } = useMatches(); // AGREGAR PARA OBTENER MATCHES

  useEffect(() => {
    loadPublications();
  }, []);

  // FUNCIÓN PARA FILTRAR PUBLICACIONES QUE YA TIENEN MATCH
  const getFilteredPublications = () => {
    if (!user || user.type !== "busco_lugar") return publications;
    
    // Obtener IDs de publicaciones que ya tienen match
    const publicationIdsWithMatches = matches
      .filter(match => match.user1Id === user.id) // Solo matches iniciados por el usuario
      .map(match => match.publicationId);
    
    // Filtrar publicaciones que NO tienen match del usuario actual
    return publications.filter(
      publication => !publicationIdsWithMatches.includes(publication.id)
    );
  };

  const handleLike = async (publication: Publication) => {
    if (!user) return;

    try {
      // Crear match entre el usuario actual y el dueño de la publicación
      await matchingService.createMatch({
        user1Id: user.id,
        user2Id: publication.userId,
        publicationId: publication.id,
        score: 0.8,
      });

      alert(`${t("matchFound")} ${t("matchNotification")}`);
      
      // Recargar publicaciones para ocultar la que acaba de solicitar
      loadPublications();
      
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Error al crear el match");
    }
  };

  const handleDislike = (publication: Publication) => {
    console.log("Publication disliked:", publication.id);
    // Opcional: implementar lógica de "no me interesa"
  };

  // Resto del código sin cambios...
  const applyFilters = () => {
    loadPublications(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      city: "",
      maxPrice: 1000,
      minPrice: 0,
      roomType: "",
    });
    loadPublications();
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">{t("loadingPublications")}</div>
      </div>
    );
  }

  const filteredPublications = getFilteredPublications();

  return (
    <div className="flex-1 bg-gray-50 pt-16 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t("searchByLocation")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Filter size={20} />
              <span>{t("filters")}</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("filterByCity")}
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={t("city")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("minPrice")}
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("maxPrice")}
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("filterByRoomType")}
                  </label>
                  <select
                    value={filters.roomType}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        roomType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">{t("all")}</option>
                    <option value="single">{t("single")}</option>
                    <option value="shared">{t("shared")}</option>
                    <option value="studio">{t("studio")}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("clearFilters")}
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={applyFilters}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t("applyFilters")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Publications Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {t("errorLoadingPublications")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                onLike={handleLike}
                onDislike={handleDislike}
                showActions={user?.type === "busco_lugar"}
              />
            ))}
          </div>
        )}

        {filteredPublications.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {user?.type === "busco_lugar" && matches.length > 0 
                ? "Has solicitado todas las publicaciones disponibles. Revisa tus matches."
                : t("noPublications")
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};