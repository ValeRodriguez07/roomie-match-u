import React from "react";
import { MapPin, DollarSign, Users, Calendar } from "lucide-react";
import type { Publication } from "../types";
import { useApp } from "../context/AppContext";

interface PublicationCardProps {
  publication: Publication;
  onLike?: (publication: Publication) => void;
  onDislike?: (publication: Publication) => void;
  showActions?: boolean;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  onLike,
  onDislike,
  showActions = true,
}) => {
  const { t, language } = useApp();

  const roomTypeLabels = {
    single: t("single"),
    shared: t("shared"),
    studio: t("studio"),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: language === "es" ? "EUR" : "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(
      language === "es" ? "es-ES" : "en-US"
    ).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
        <Users size={48} className="text-primary-500 opacity-50" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {publication.title}
          </h3>
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {roomTypeLabels[publication.roomType]}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {publication.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-2" />
            <span>
              {publication.location}, {publication.city}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <DollarSign size={16} className="mr-2" />
            <span className="font-semibold text-gray-900">
              {formatPrice(publication.price)}/{t("monthly")}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            <span>
              {t("availableFrom")} {formatDate(publication.availableFrom)}
            </span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {publication.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {amenity}
            </span>
          ))}
          {publication.amenities.length > 3 && (
            <span className="text-gray-500 text-xs">
              +{publication.amenities.length - 3} más
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onDislike?.(publication)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t("notInterested")}
            </button>
            <button
              onClick={() => onLike?.(publication)}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {t("interested")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
