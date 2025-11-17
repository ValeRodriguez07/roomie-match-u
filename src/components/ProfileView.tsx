import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Edit, MapPin, Calendar, Heart, Home, DollarSign, CheckCircle, X } from 'lucide-react';

interface ProfileViewProps {
  onEditClick: () => void;
  onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditClick, onClose }) => {
  const { user, t } = useApp();

  if (!user) {
    return null;
  }

  const profile = user.profile || {};
  const lifestyle = profile.lifestyle || {} as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={40} className="text-primary-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.username || user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.type === 'busco_lugar'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.type === 'busco_lugar' ? t('seekingHousing') : t('offeringHousing')}
                  </span>
                  {user.verified && (
                    <span className="flex items-center space-x-1 text-green-600 text-sm">
                      <CheckCircle size={16} />
                      <span>{t('verified')}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onEditClick}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Edit size={18} />
                <span>{t('editProfile')}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <User size={24} className="text-primary-600" />
            <span>{t('personalInformation')}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.birthday && (
              <div className="flex items-start space-x-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t('birthday')}</p>
                  <p className="font-medium text-gray-900">
                    {profile.birthday.day}/{profile.birthday.month}/{profile.birthday.year}
                  </p>
                </div>
              </div>
            )}
            {profile.gender && (
              <div className="flex items-start space-x-3">
                <User size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t('gender')}</p>
                  <p className="font-medium text-gray-900">{t(profile.gender)}</p>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="flex items-start space-x-3">
                <User size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t('phone')}</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lifestyle */}
        {lifestyle && Object.keys(lifestyle).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart size={24} className="text-primary-600" />
              <span>{t('lifestyle')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lifestyle.smoking && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('doYouSmoke')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.smoking === 'yes' ? t('si') : t('no')}
                  </p>
                </div>
              )}
              {lifestyle.allergies && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('areYouAllergic')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.allergies === 'yes' ? t('si') : t('no')}
                  </p>
                  {lifestyle.allergies === 'yes' && lifestyle.allergiesDescription && (
                    <p className="text-sm text-gray-600 mt-1">{lifestyle.allergiesDescription}</p>
                  )}
                </div>
              )}
              {lifestyle.pets && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('doYouHavePets')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.pets === 'yes' ? t('si') : t('no')}
                  </p>
                  {lifestyle.pets === 'yes' && lifestyle.petTypes && (
                    <p className="text-sm text-gray-600 mt-1">{lifestyle.petTypes}</p>
                  )}
                </div>
              )}
              {lifestyle.willingToLivePets && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('willingToLiveWithPets')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.willingToLivePets === 'yes' ? t('si') : t('no')}
                  </p>
                </div>
              )}
              {lifestyle.convivence && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('convivencePreference')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.convivence === 'quiet' ? t('tranquilo') :
                     lifestyle.convivence === 'social' ? t('social') :
                     lifestyle.convivence === 'flexible' ? t('flexible') :
                     lifestyle.convivence}
                  </p>
                </div>
              )}
              {lifestyle.schedule && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('habitualSchedule')}</p>
                  <p className="font-medium text-gray-900">
                    {lifestyle.schedule === 'day' ? t('diurno') :
                     lifestyle.schedule === 'night' ? t('nocturno') :
                     lifestyle.schedule === 'mixed' ? t('mixto') :
                     lifestyle.schedule}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Housing Search Info (for busco_lugar) */}
        {user.type === 'busco_lugar' && profile.searchingHousing && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin size={24} className="text-primary-600" />
              <span>{t('housingSearch')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('preferredZone')}</p>
                <p className="font-medium text-gray-900">{profile.searchingHousing.zone}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('numberOfPeople')}</p>
                <p className="font-medium text-gray-900">{profile.searchingHousing.numberOfPeople}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('roomType')}</p>
                <p className="font-medium text-gray-900">{t(profile.searchingHousing.roomType)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('moveInDate')}</p>
                <p className="font-medium text-gray-900">
                  {profile.searchingHousing.moveInDate === 'immediate' ? t('immediate') :
                   profile.searchingHousing.moveInDate === 'next_month' ? t('nextMonth') :
                   profile.searchingHousing.moveInDate === '2_3_months' ? t('twoThreeMonths') :
                   profile.searchingHousing.moveInDate}
                </p>
              </div>
              {profile.searchingHousing.essentialServices && profile.searchingHousing.essentialServices.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">{t('essentialServices')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.searchingHousing.essentialServices.map((service: string) => (
                      <span key={service} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        {t(service as any)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Housing Offer Info (for tengo_lugar) */}
        {user.type === 'tengo_lugar' && profile.offeringHousing && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Home size={24} className="text-primary-600" />
              <span>{t('housingOffer')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('zoneOrNeighborhood')}</p>
                <p className="font-medium text-gray-900">{profile.offeringHousing.zone}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('availableRooms')}</p>
                <p className="font-medium text-gray-900">{profile.offeringHousing.availableRooms}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('pricePerRoom')}</p>
                <p className="font-medium text-gray-900 flex items-center space-x-1">
                  <DollarSign size={16} />
                  <span>{profile.offeringHousing.pricePerRoom}</span>
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">{t('petFriendly')}</p>
                <p className="font-medium text-gray-900">
                  {profile.offeringHousing.petFriendly ? t('si') : t('no')}
                </p>
              </div>
              {profile.offeringHousing.servicesIncluded && profile.offeringHousing.servicesIncluded.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">{t('servicesIncluded')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.offeringHousing.servicesIncluded.map((service: string) => (
                      <span key={service} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                        {t(service as any)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.offeringHousing.houseRules && profile.offeringHousing.houseRules.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">{t('houseRules')}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.offeringHousing.houseRules.map((rule: string) => (
                      <span key={rule} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                        {t(rule as any)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Photos */}
            {profile.offeringHousing.propertyPhotos && profile.offeringHousing.propertyPhotos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('propertyPhotos')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.offeringHousing.propertyPhotos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Property ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Property Video */}
            {profile.offeringHousing.propertyVideo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('propertyVideo')}</h3>
                <video
                  src={profile.offeringHousing.propertyVideo}
                  controls
                  className="w-full max-h-96 rounded-lg shadow-sm bg-black"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
