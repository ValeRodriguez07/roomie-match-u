import React, { useState, useEffect } from "react";
import { Heart, X, RotateCcw, Lock, Crown } from "lucide-react";
import type { Publication } from "../types";
import { TinderCard } from "./TinderCard";
import { usePublications } from "../hooks/usePublications";
import { matchingService } from "../services/MatchingService";
import { useApp } from "../context/AppContext";
import { useMatches } from "../hooks/useMatches";

export const ExploreScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [discardedStack, setDiscardedStack] = useState<Publication[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const { publications, loading, error, loadPublications } = usePublications();
  const { user, t } = useApp();
  const { matches } = useMatches();

  useEffect(() => {
    loadPublications();
  }, []);

  // Paywall limits
  const SEEKER_VIEW_LIMIT = 6;
  const OFFERER_PUBLICATION_LIMIT = 2;

  // Filter publications that already have matches
  const getFilteredPublications = () => {
    if (!user || user.type !== "busco_lugar") return publications;

    // Get publication IDs that already have matches
    const publicationIdsWithMatches = matches
      .filter(match => match.user1Id === user.id)
      .map(match => match.publicationId);

    // Filter publications that do NOT have matches from current user
    return publications.filter(
      publication => !publicationIdsWithMatches.includes(publication.id)
    );
  };

  const filteredPublications = getFilteredPublications();

  const handleLike = async (publication: Publication) => {
    if (!user) return;

    try {
      await matchingService.createMatch({
        user1Id: user.id,
        user2Id: publication.userId,
        publicationId: publication.id,
        score: 0.8,
      });

      // Add match notification to the app notifications instead of alert
      // The notification will be handled by the notification service

      // Move to next card
      nextCard();

    } catch (error) {
      console.error("Error creating match:", error);
      alert("Error al crear el match");
    }
  };

  const handleDislike = (publication: Publication) => {
    console.log("Publication disliked:", publication.id);
    // Add to discarded stack for potential undo
    setDiscardedStack(prev => [...prev, publication]);
    // Move to next card
    nextCard();
  };

  const nextCard = () => {
    if (currentCardIndex < filteredPublications.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setViewCount(prev => prev + 1);
    } else {
      // No more cards
      setViewCount(prev => prev + 1);
    }
  };

  const previousCard = () => {
    if (discardedStack.length > 0) {
      const previousPublication = discardedStack[discardedStack.length - 1];
      setDiscardedStack(prev => prev.slice(0, -1));
      // Go back to previous card
      setCurrentCardIndex(prev => Math.max(0, prev - 1));
      setViewCount(prev => Math.max(0, prev - 1));
    }
  };

  // Reset state when publications change
  useEffect(() => {
    setCurrentCardIndex(0);
    setViewCount(0);
    setDiscardedStack([]);
  }, [publications]);

  const handleCardView = () => {
    if (viewCount >= SEEKER_VIEW_LIMIT) {
      setShowPaywall(true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">{t("loadingPublications")}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-pink-50 via-white to-purple-50 h-screen pt-16 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full overflow-hidden">
        {/* Role-based Content */}
        {user?.type === 'busco_lugar' ? (
          // Tinder-like card stack for seekers
          <div className="flex flex-col items-center justify-center h-full">
            {showPaywall || viewCount >= SEEKER_VIEW_LIMIT ? (
              // Paywall modal overlay
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl">
                  <Crown className="mx-auto text-yellow-500 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Has alcanzado el límite gratuito!</h3>
                  <p className="text-gray-600 mb-6">
                    Has visto {SEEKER_VIEW_LIMIT} publicaciones. Actualiza a premium para ver más.
                  </p>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors">
                      Actualizar a Premium
                    </button>
                    <button
                      onClick={() => setShowPaywall(false)}
                      className="w-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Card Stack */}
                <div className="relative w-full max-w-sm h-[600px] flex-shrink-0">
                  {filteredPublications.length > 0 && currentCardIndex < filteredPublications.length ? (
                    <div className="relative h-full">
                      <TinderCard
                        publication={filteredPublications[currentCardIndex]}
                        onView={handleCardView}
                        onSwipe={(direction) => {
                          if (direction === 'right') {
                            handleLike(filteredPublications[currentCardIndex]);
                          } else {
                            handleDislike(filteredPublications[currentCardIndex]);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center h-full flex flex-col justify-center">
                      <div className="text-gray-500">
                        <Heart className="mx-auto mb-4 text-gray-300" size={48} />
                        <p className="text-lg font-medium mb-2">¡No hay más publicaciones!</p>
                        <p className="text-sm">
                          {matches.length > 0
                            ? "Has visto todas las publicaciones disponibles. Revisa tus matches."
                            : "No hay publicaciones disponibles en este momento."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Bottom Action Buttons */}
                {filteredPublications.length > 0 && currentCardIndex < filteredPublications.length && (
                  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex items-center space-x-8 bg-white rounded-full px-8 py-4 shadow-2xl">
                      <button
                        onClick={() => handleDislike(filteredPublications[currentCardIndex])}
                        className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <X size={28} className="text-red-600" />
                      </button>

                      <button
                        onClick={previousCard}
                        disabled={discardedStack.length === 0 || currentCardIndex === 0}
                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <RotateCcw size={20} className="text-gray-600" />
                      </button>

                      <button
                        onClick={() => handleLike(filteredPublications[currentCardIndex])}
                        className="w-16 h-16 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <Heart size={28} className="text-green-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Publication management for offerers (unchanged)
          <div className="space-y-6 h-full overflow-y-auto">
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
          </div>
        )}
      </div>
    </div>
  );
};
