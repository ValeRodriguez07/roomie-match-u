import React, { useState, useEffect, useRef } from "react";
import { Heart, X, RotateCcw, Lock, Crown, Upload } from "lucide-react";
import type { Publication, SupportedCurrency } from "../types";
import { TinderCard } from "./TinderCard";
import { PublicationCard } from "./PublicationCard";
import { usePublications } from "../hooks/usePublications";
import { matchingService } from "../services/MatchingService";
import { publicationService } from "../services/PublicationService";
import { useApp } from "../context/AppContext";
import { useMatches } from "../hooks/useMatches";
import { convertCurrency, formatCurrency } from "../utils/currency";

export const ExploreScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [discardedStack, setDiscardedStack] = useState<Publication[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { publications, loading, error, loadPublications, updatePublication } = usePublications();
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

  // Handle publication creation from profile builder
  useEffect(() => {
    const handleCreatePublication = () => {
      // Navigate to profile builder in publication creation mode
      window.dispatchEvent(new CustomEvent('showProfileBuilder', {
        detail: { mode: 'createPublication' }
      }));
    };

    const handleEditPublication = (event: any) => {
      // Navigate to profile builder in publication edit mode
      window.dispatchEvent(new CustomEvent('showProfileBuilder', {
        detail: { mode: 'editPublication', publication: event.detail }
      }));
    };

    window.addEventListener('navigateToCreatePublication', handleCreatePublication);
    window.addEventListener('navigateToEditPublication', handleEditPublication);

    return () => {
      window.removeEventListener('navigateToCreatePublication', handleCreatePublication);
      window.removeEventListener('navigateToEditPublication', handleEditPublication);
    };
  }, []);

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
          // Publication management for offerers
          <div className="space-y-6 h-full overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Publicaciones</h2>
                <button
                  onClick={() => {
                    // Navigate to create new publication - using profile builder with publication mode
                    window.dispatchEvent(new CustomEvent('navigateToCreatePublication'));
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  + Nueva Publicación
                </button>
              </div>

              {publications.filter(p => p.userId === user?.id).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="mb-4">Aún no has creado ninguna publicación</p>
                    <button
                      onClick={() => {
                        // Navigate to create new publication
                        window.dispatchEvent(new CustomEvent('navigateToCreatePublication'));
                      }}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Crear Primera Publicación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publications.filter(p => p.userId === user?.id).map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      showActions={true}
                      onEdit={() => {
                        setEditingPublication(publication);
                        setShowEditModal(true);
                      }}
                      onDelete={async () => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
                          try {
                            await publicationService.deletePublication(publication.id);
                            // Reload publications
                            loadPublications();
                          } catch (error) {
                            console.error('Error deleting publication:', error);
                            alert('Error al eliminar la publicación');
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Publication Modal */}
        {showEditModal && editingPublication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{t('edit')} Publicación</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPublication(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <EditPublicationForm
                publication={editingPublication}
                onSave={async (updatedData) => {
                  try {
                    await updatePublication(editingPublication.id, updatedData);
                    setShowEditModal(false);
                    setEditingPublication(null);
                    loadPublications();
                  } catch (error) {
                    console.error('Error updating publication:', error);
                    alert('Error al actualizar la publicación');
                  }
                }}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingPublication(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Publication Form Component
const EditPublicationForm: React.FC<{
  publication: Publication;
  onSave: (data: Partial<Publication>) => void;
  onCancel: () => void;
}> = ({ publication, onSave, onCancel }) => {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: publication.title,
    description: publication.description,
    price: publication.price,
    location: publication.location,
    city: publication.city,
    country: publication.country,
    currency: publication.currency,
    availableFrom: publication.availableFrom,
    roomType: publication.roomType,
    amenities: publication.amenities || [],
    rules: publication.rules || [],
    images: publication.images || [],
    videos: publication.videos || [],
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRuleToggle = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...prev.rules, rule]
    }));
  };

  const amenities = ['internet', 'agua', 'lavadora', 'secadora', 'amoblado', 'bano', 'television', 'cocina', 'nevera', 'parqueadero', 'espaciosComunes', 'accesoInclusivo'];
  const rules = ['visitas', 'horarios', 'fiestas', 'limpieza', 'ruido'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio por habitación</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Servicios incluidos</label>
        <div className="grid grid-cols-2 gap-3">
          {amenities.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">{t(amenity as any)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Reglas de la casa</label>
        <div className="flex flex-col gap-2">
          {rules.map(rule => (
            <label key={rule} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rules.includes(rule)}
                onChange={() => handleRuleToggle(rule)}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">{t(rule as any)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Imágenes de la publicación</label>
        <div className="space-y-3">
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition cursor-pointer"
          >
            <Upload size={32} className="text-gray-400" />
            <span className="text-gray-600">Agregar imágenes</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>



      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};
