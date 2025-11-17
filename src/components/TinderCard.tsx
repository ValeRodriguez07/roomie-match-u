import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, DollarSign } from "lucide-react";
import type { Publication, User } from "../types";
import { useApp } from "../context/AppContext";
import { userService } from "../services/UserService";
import { convertCurrency, formatCurrency } from "../utils/currency";

interface TinderCardProps {
  publication: Publication;
  onView?: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const TinderCard: React.FC<TinderCardProps> = ({ publication, onView, onSwipe }) => {
  const { t, language, selectedCurrency } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUser(publication.userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    onView?.(); // Call onView when card is rendered
  }, [publication.userId, onView]);

  const formatPrice = (price: number) => {
    const convertedPrice = convertCurrency(price, publication.currency, selectedCurrency);
    return formatCurrency(convertedPrice, selectedCurrency, language);
  };

  const nextImage = () => {
    if (publication.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === publication.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (publication.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? publication.images.length - 1 : prev - 1
      );
    }
  };

  const handleImageScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      nextImage();
    } else {
      prevImage();
    }
  };

  const getUserAge = () => {
    if (!user?.profile?.birthday) return null;
    const birthDate = new Date(
      `${user.profile.birthday.year}-${user.profile.birthday.month}-${user.profile.birthday.day}`
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getUserZone = () => {
    if (user?.type === 'tengo_lugar' && user.profile?.offeringHousing?.zone) {
      return user.profile.offeringHousing.zone;
    }
    if (user?.type === 'busco_lugar' && user.profile?.searchingHousing?.zone) {
      return user.profile.searchingHousing.zone;
    }
    return publication.location;
  };

  // Touch and mouse drag handlers for swipe functionality
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;

    // Only allow horizontal movement if it's more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.5) {
      setDragOffset({ x: deltaX, y: 0 });
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const threshold = 120; // Minimum distance to trigger swipe (increased for better UX)

    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        // Swipe right (like)
        onSwipe?.('right');
      } else {
        // Swipe left (dislike)
        onSwipe?.('left');
      }
    }

    // Reset drag state with animation
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Calculate rotation and opacity based on drag
  const rotation = dragOffset.x * 0.1; // Subtle rotation
  const opacity = Math.max(0.8, 1 - Math.abs(dragOffset.x) / 300);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm mx-auto h-[600px] relative cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
      style={{
        transform: `translateX(${dragOffset.x}px) rotate(${rotation}deg)`,
        opacity: opacity,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Reset if mouse leaves
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Gallery */}
      <div
        className="relative h-3/5 bg-gray-200 overflow-hidden"
        ref={imageContainerRef}
        onWheel={handleImageScroll}
      >
        {publication.images.length > 0 ? (
          <img
            src={publication.images[currentImageIndex]}
            alt={`${publication.title} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No image available</span>
          </div>
        )}

        {/* Image Navigation Arrows */}
        {publication.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {publication.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {publication.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formatPrice(publication.price)}/mes
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-2/5 flex flex-col justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-semibold text-lg">
                {user?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {loadingUser ? "Cargando..." : (user?.name || "Usuario")}
              {getUserAge() && `, ${getUserAge()}`}
            </h3>
            <p className="text-gray-600 text-sm flex items-center">
              <MapPin size={14} className="mr-1" />
              {getUserZone()}
            </p>
          </div>
        </div>

        {/* Publication Details */}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {publication.title}
          </h4>
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {publication.description}
          </p>

          {/* Location and Room Type */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{publication.location}, {publication.city}</span>
            </div>
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs capitalize">
              {publication.roomType === 'single' ? t('single') :
               publication.roomType === 'shared' ? t('shared') : t('studio')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
