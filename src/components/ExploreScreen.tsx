import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Heart, X, Lock, Crown } from "lucide-react";
import type { Publication } from "../types";
import { PublicationCard } from "./PublicationCard";
import { usePublications } from "../hooks/usePublications";
import { matchingService } from "../services/MatchingService";
import { useApp } from "../context/AppContext";
import { useMatches } from "../hooks/useMatches";

export const ExploreScreen: React.FC = () => {
  const [filters, setFilters] = useState({
    location: "",
    city: "",
    maxPrice: 1000,
    minPrice: 0,
    roomType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [publicationCount, setPublicationCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { publications, loading, error, loadPublications } = usePublications();
  const { user, t } = useApp();
  const { matches } = useMatches();

  useEffect(() => {
    loadPublications();
  }, []);

  // Paywall limits
  const SEEKER_VIEW_LIMIT = 6;
  const OFFERER_PUBLICATION_LIMIT = 2;

  // Scroll detection for Tinder-like interface
  useEffect(() => {
    const handleScroll = () => {
      if (user?.type === 'busco_lugar' && cardRef.current) {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible && viewCount < SEEKER_VIEW_LIMIT) {
          setViewCount(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, viewCount]);

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

        {/* Role-based Content */}
        {user?.type === 'busco_lugar' ? (
          // Tinder-like card stack for seekers
          <div className="flex flex-col items-center">
            {viewCount >= SEEKER_VIEW_LIMIT ? (
              // Paywall for seekers
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8 text-center max-w-md mx-auto">
                <Crown className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Has alcanzado el límite gratuito!</h3>
                <p className="text-gray-600 mb-4">
                  Has visto {SEEKER_VIEW_LIMIT} publicaciones. Actualiza a premium para ver más.
                </p>
                <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors">
                  Actualizar a Premium
                </button>
              </div>
            ) : (
              // Tinder-like cards
              <div className="w-full max-w-sm">
                {filteredPublications.slice(0, 1).map((publication, index) => (
                  <div
                    key={publication.id}
                    ref={cardRef}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                  >
                    {/* Publication Image */}
                    <div className="relative h-64 bg-gray-200">
                      {publication.images[0] ? (
                        <img
                          src={publication.images[0]}
                          alt={publication.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span>No image</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        ${publication.price}/mes
                      </div>
                    </div>

                    {/* Publication Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{publication.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{publication.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span>{publication.location}, {publication.city}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-6">
                        <button
                          onClick={() => handleDislike(publication)}
                          className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X size={24} className="text-red-600" />
                        </button>
                        <button
                          onClick={() => handleLike(publication)}
                          className="w-14 h-14 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Heart size={24} className="text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPublications.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      {matches.length > 0
                        ? "Has solicitado todas las publicaciones disponibles. Revisa tus matches."
                        : t("noPublications")
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Publication management for offerers
          <div className="space-y-6">
            {publicationCount >= OFFERER_PUBLICATION_LIMIT ? (
              // Paywall for offerers
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                <Lock className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Límite de publicaciones alcanzado!</h3>
                <p className="text-gray-600 mb-4">
                  Has creado {OFFERER_PUBLICATION_LIMIT} publicaciones gratuitas. Actualiza para crear más.
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-colors">
                  Actualizar Plan
                </button>
              </div>
            ) : (
              // Publication management interface
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Mis Publicaciones</h2>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    + Nueva Publicación
                  </button>
                </div>

                {publications.filter(p => p.userId === user?.id).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="mb-4">Aún no has creado ninguna publicación</p>
                      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                        Crear Primera Publicación
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publications.filter(p => p.userId === user?.id).map((publication) => (
                      <div key={publication.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="h-48 bg-gray-200">
                          {publication.images[0] && (
                            <img
                              src={publication.images[0]}
                              alt={publication.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{publication.title}</h3>
                          <p className="text-primary-600 font-bold">${publication.price}/mes</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              publication.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {publication.status === 'active' ? 'Activa' : 'Inactiva'}
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                              <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};