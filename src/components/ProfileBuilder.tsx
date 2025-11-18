import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { getNeighborhoodsByCity } from '../data/neighborhoods';
import { userService } from '../services/UserService';
import { publicationService } from '../services/PublicationService';
import type { Publication } from '../types';

interface ProfileBuilderProps {
  isEditing?: boolean;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ isEditing = false }) => {
  const { t, user } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Step 1: Identifícate - start empty/unset
    username: '',
    birthday: { day: '', month: '', year: '' },
    gender: '',

    // Step 2: Estilo de vida - start empty/unset
    smoking: '',
    allergies: '',
    allergiesDescription: '',
    pets: '',
    petTypes: '',
    willingToLivePets: '',
    convivence: '',
    schedule: '',

    // Step 3: Foto
    profilePhoto: '' as string | null,

    // Step 4: Rol (no pre-selection)
    role: '',

    // Step 5A: Busco vivienda
    zone: '',
    numberOfPeople: '',
    roomType: '',
    essentialServices: [] as string[],
    moveInDate: '',

    // Step 5B: Ofrezco vivienda
    zoneOffer: '',
    availableRooms: '',
    pricePerRoom: '',
    servicesIncluded: [] as string[],
    houseRules: [] as string[],
    petFriendly: false,

    // Step 6: Media
    propertyPhotos: [] as string[],
    propertyVideo: '' as string | null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Initialize neighborhoods based on user's city
  useEffect(() => {
    if (user?.preferences?.city) {
      const availableNeighborhoods = getNeighborhoodsByCity(user.preferences.city, user.preferences.country);
      setNeighborhoods(availableNeighborhoods);
    }
  }, [user?.preferences?.city]);

  // Initialize form data with existing profile data if editing
  useEffect(() => {
    if (isEditing && user?.profile) {
      const profile = user.profile;
      setFormData({
        // Step 1: Identifícate
        username: profile.username || user.username || '',
        birthday: profile.birthday || { day: '', month: '', year: '' },
        gender: profile.gender || '',

        // Step 2: Estilo de vida
        smoking: profile.lifestyle?.smoking || '',
        allergies: profile.lifestyle?.allergies || '',
        allergiesDescription: profile.lifestyle?.allergiesDescription || '',
        pets: profile.lifestyle?.pets || '',
        petTypes: profile.lifestyle?.petTypes || '',
        willingToLivePets: profile.lifestyle?.willingToLivePets || '',
        convivence: profile.lifestyle?.convivence || '',
        schedule: profile.lifestyle?.schedule || '',

        // Step 3: Foto
        profilePhoto: profile.profilePhoto || '',

        // Step 4: Rol
        role: user.type || '',

        // Step 5A: Busco vivienda
        zone: profile.searchingHousing?.zone || '',
        numberOfPeople: profile.searchingHousing?.numberOfPeople?.toString() || '',
        roomType: profile.searchingHousing?.roomType || '',
        essentialServices: profile.searchingHousing?.essentialServices || [],
        moveInDate: profile.searchingHousing?.moveInDate || '',

        // Step 5B: Ofrezco vivienda
        zoneOffer: profile.offeringHousing?.zone || '',
        availableRooms: profile.offeringHousing?.availableRooms?.toString() || '',
        pricePerRoom: profile.offeringHousing?.pricePerRoom?.toString() || '',
        servicesIncluded: profile.offeringHousing?.servicesIncluded || [],
        houseRules: profile.offeringHousing?.houseRules || [],
        petFriendly: profile.offeringHousing?.petFriendly || false,

        // Step 6: Media
        propertyPhotos: profile.offeringHousing?.propertyPhotos || [],
        propertyVideo: profile.offeringHousing?.propertyVideo || '',
      });
    }
  }, [isEditing, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBirthdayChange = (field: 'day' | 'month' | 'year', value: string) => {
    setFormData(prev => ({
      ...prev,
      birthday: {
        ...prev.birthday,
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (fieldName: string, value: string, isMultiple: boolean = false) => {
    setFormData(prev => {
      if (isMultiple) {
        const currentArray = (prev[fieldName as keyof typeof formData] as string[]) || [];
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [fieldName]: currentArray.filter(item => item !== value)
          };
        } else {
          return {
            ...prev,
            [fieldName]: [...currentArray, value]
          };
        }
      } else {
        return {
          ...prev,
          [fieldName]: formData[fieldName as keyof typeof formData] === value ? '' : value
        };
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'property' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'profile') {
          setFormData(prev => ({ ...prev, profilePhoto: result }));
        } else if (type === 'property') {
          setFormData(prev => ({
            ...prev,
            propertyPhotos: [...prev.propertyPhotos, result]
          }));
        } else if (type === 'video') {
          setFormData(prev => ({ ...prev, propertyVideo: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePropertyPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      propertyPhotos: prev.propertyPhotos.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, propertyVideo: null }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.username && formData.birthday.day && formData.birthday.month && formData.birthday.year && formData.gender);
      case 2:
        return !!(formData.smoking && formData.allergies && formData.pets && formData.willingToLivePets && formData.convivence && formData.schedule);
      case 3:
        return !!formData.profilePhoto;
      case 4:
        return !!formData.role;
      case 5:
        if (formData.role === 'busco_lugar') {
          return !!(formData.zone && formData.numberOfPeople && formData.roomType && formData.essentialServices.length > 0 && formData.moveInDate);
        } else {
          return !!(formData.zoneOffer && formData.availableRooms && formData.pricePerRoom && formData.servicesIncluded.length > 0 && formData.houseRules.length > 0);
        }
      case 6:
        return formData.role === 'busco_lugar' ? true : formData.propertyPhotos.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      alert(t('requiredFields'));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(6)) {
      alert(t('requiredFields'));
      return;
    }

    if (!user) {
      alert(t('saveError'));
      return;
    }

    try {
      // Build profile data
      const profileData = {
        username: formData.username,
        birthday: formData.birthday,
        gender: formData.gender,
        lifestyle: {
          smoking: formData.smoking === 'yes' ? 'yes' : 'no',
          allergies: formData.allergies === 'yes' ? 'yes' : 'no',
          allergiesDescription: formData.allergiesDescription,
          pets: formData.pets === 'yes' ? 'yes' : 'no',
          petTypes: formData.petTypes,
          willingToLivePets: formData.willingToLivePets === 'yes' ? 'yes' : 'no',
          convivence: formData.convivence,
          schedule: formData.schedule,
        },
        profilePhoto: formData.profilePhoto,
        type: formData.role,
        ...(formData.role === 'busco_lugar' && {
          searchingHousing: {
            zone: formData.zone,
            numberOfPeople: parseInt(formData.numberOfPeople),
            roomType: formData.roomType,
            essentialServices: formData.essentialServices,
            moveInDate: formData.moveInDate,
          }
        }),
        ...(formData.role === 'tengo_lugar' && {
          offeringHousing: {
            zone: formData.zoneOffer,
            availableRooms: parseInt(formData.availableRooms),
            pricePerRoom: parseInt(formData.pricePerRoom),
            servicesIncluded: formData.servicesIncluded,
            houseRules: formData.houseRules,
            petFriendly: formData.petFriendly,
            propertyPhotos: formData.propertyPhotos,
            propertyVideo: formData.propertyVideo,
          }
        })
      };

      // Save profile to service
      await userService.completeProfile(user.id, profileData);
      
      // Emit event or call parent callback to save profile
      window.dispatchEvent(new CustomEvent('profileBuilderComplete', { detail: profileData }));
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(t('saveError'));
    }
  };

  // Step 1: Identifícate
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('identifyYourself')}</h1>
            <p className="text-gray-600 mb-8">{t('whatIsYourName')}</p>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('username')}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={t('enterUsername')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('birthday')}</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.birthday.day}
                    onChange={(e) => handleBirthdayChange('day', e.target.value)}
                    placeholder={t('day')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.birthday.month}
                    onChange={(e) => handleBirthdayChange('month', e.target.value)}
                    placeholder={t('month')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2023"
                    value={formData.birthday.year}
                    onChange={(e) => handleBirthdayChange('year', e.target.value)}
                    placeholder={t('year')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('gender')}</label>
                <div className="flex gap-4">
                  {['female', 'male', 'other'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('gender', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.gender === option
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option as 'female' | 'male' | 'other')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed opacity-50"
              >
                {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {t('next')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Tu estilo de vida
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('yourLifestyle')}</h1>
            <p className="text-gray-600 mb-8">Tell us about your lifestyle preferences</p>

            <div className="space-y-6">
              {/* Do you smoke? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('doYouSmoke')}</label>
                <div className="flex gap-4">
                  {['yes', 'no'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('smoking', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.smoking === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option === 'yes' ? 'si' : 'no')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('areYouAllergic')}</label>
                <div className="flex gap-4 mb-3">
                  {['yes', 'no'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('allergies', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.allergies === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option === 'yes' ? 'si' : 'no')}
                    </button>
                  ))}
                </div>
                {formData.allergies === 'yes' && (
                  <input
                    type="text"
                    name="allergiesDescription"
                    value={formData.allergiesDescription}
                    onChange={handleInputChange}
                    placeholder={t('describeLergies')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>

              {/* Pets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('doYouHavePets')}</label>
                <div className="flex gap-4 mb-3">
                  {['yes', 'no'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('pets', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.pets === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option === 'yes' ? 'si' : 'no')}
                    </button>
                  ))}
                </div>
                {formData.pets === 'yes' && (
                  <input
                    type="text"
                    name="petTypes"
                    value={formData.petTypes}
                    onChange={handleInputChange}
                    placeholder={t('describePets')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>

              {/* Willing to live with pets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('willingToLiveWithPets')}</label>
                <div className="flex gap-4">
                  {['yes', 'no'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('willingToLivePets', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.willingToLivePets === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option === 'yes' ? 'si' : 'no')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convivence preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('convivencePreference')}</label>
                <div className="flex gap-4">
                  {['tranquilo', 'social', 'flexible'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('convivence', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.convivence === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option as 'tranquilo' | 'social' | 'flexible')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('habitualSchedule')}</label>
                <div className="flex gap-4">
                  {['diurno', 'nocturno', 'mixto'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleCheckboxChange('schedule', option)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.schedule === option
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(option as 'diurno' | 'nocturno' | 'mixto')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {t('next')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Profile Photo
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('addProfilePhoto')}</h1>
            <p className="text-gray-600 mb-8">{t('photoTip')}</p>

            <div className="space-y-6">
              {formData.profilePhoto ? (
                <div className="space-y-4">
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    {t('changePhoto')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition cursor-pointer"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-gray-600">{t('uploadPhoto')}</span>
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'profile')}
                className="hidden"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                {t('next')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Role Selection
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('selectYourRole')}</h1>
            <p className="text-gray-600 mb-8">What are you looking for?</p>

            <div className="space-y-4">
              {['busco_lugar', 'tengo_lugar'].map(role => (
                <button
                  key={role}
                  onClick={() => handleCheckboxChange('role', role)}
                  className={`w-full p-6 border-2 rounded-lg transition text-left ${
                    formData.role === role
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 bg-gray-50 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    {t(role === 'busco_lugar' ? 'seekingHousing' : 'offeringHousing')}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {t(role === 'busco_lugar' ? 'seekingHousingDesc' : 'offeringHousingDesc')}
                  </p>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                {t('next')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5A: Busco vivienda
  if (currentStep === 5 && formData.role === 'busco_lugar') {
    const services = ['internet', 'agua', 'lavadora', 'secadora', 'amoblado', 'bano', 'television', 'cocina', 'nevera', 'parqueadero', 'espaciosComunes', 'accesoInclusivo'];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 max-h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('whatHousingYouSeek')}</h1>
            <p className="text-gray-600 mb-8">Tell us what you're looking for</p>

            <div className="space-y-6">
              {/* Zone - Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('preferredZone')}</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  <option value="">{t('selectOption')}</option>
                  {neighborhoods.map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of people */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfPeople')}</label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Room type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('roomType')}</label>
                <div className="flex gap-4">
                  {['individual', 'compartida'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleCheckboxChange('roomType', type)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        formData.roomType === type
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(type as 'individual' | 'compartida')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Essential services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('essentialServices')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(service => (
                    <label key={service} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.essentialServices as string[]).includes(service)}
                        onChange={() => handleCheckboxChange('essentialServices', service, true)}
                        className="w-4 h-4 text-cyan-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{t(service as any)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Move in date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('moveInDate')}</label>
                <div className="flex flex-col gap-2">
                  {['immediate', 'nextMonth', 'twoThreeMonths'].map(date => (
                    <button
                      key={date}
                      onClick={() => handleCheckboxChange('moveInDate', date)}
                      className={`py-2 px-4 rounded-lg font-medium transition text-left ${
                        formData.moveInDate === date
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(date as 'immediate' | 'nextMonth' | 'twoThreeMonths')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                {t('complete')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5B: Ofrezco vivienda
  if (currentStep === 5 && formData.role === 'tengo_lugar') {
    const services = ['internet', 'agua', 'lavadora', 'secadora', 'amoblado', 'bano', 'television', 'cocina', 'nevera', 'parqueadero', 'espaciosComunes', 'accesoInclusivo'];
    const rules = ['visitas', 'horarios', 'fiestas', 'limpieza', 'ruido'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 max-h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('yourHousingDetails')}</h1>
            <p className="text-gray-600 mb-8">Tell us about your property</p>

            <div className="space-y-6">
              {/* Zone - Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('zoneOrNeighborhood')}</label>
                <select
                  value={formData.zoneOffer}
                  onChange={(e) => setFormData(prev => ({ ...prev, zoneOffer: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">{t('selectOption')}</option>
                  {neighborhoods.map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('availableRooms')}</label>
                <input
                  type="number"
                  name="availableRooms"
                  value={formData.availableRooms}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Price per room */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('pricePerRoom')}</label>
                <input
                  type="number"
                  name="pricePerRoom"
                  value={formData.pricePerRoom}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Services included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('servicesIncluded')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(service => (
                    <label key={service} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.servicesIncluded as string[]).includes(service)}
                        onChange={() => handleCheckboxChange('servicesIncluded', service, true)}
                        className="w-4 h-4 text-amber-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{t(service as any)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* House rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('houseRules')}</label>
                <div className="flex flex-col gap-2">
                  {rules.map(rule => (
                    <label key={rule} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.houseRules as string[]).includes(rule)}
                        onChange={() => handleCheckboxChange('houseRules', rule, true)}
                        className="w-4 h-4 text-amber-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{t(rule as any)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pet friendly */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="petFriendly"
                    checked={formData.petFriendly}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('petFriendly')}</span>
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
              >
                {t('next')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Media (only for tengo_lugar)
  if (currentStep === 6 && formData.role === 'tengo_lugar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('propertyMedia')}</h1>
            <p className="text-gray-600 mb-8">Upload photos and videos of your property</p>

            <div className="space-y-6">
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('propertyPhotos')}</label>
                {formData.propertyPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {formData.propertyPhotos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img src={photo} alt={`Property ${idx}`} className="w-full h-40 object-cover rounded-lg" />
                        <button
                          onClick={() => removePropertyPhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded text-sm hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-rose-500 transition cursor-pointer"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-gray-600">{t('addPhotos')}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      for (let i = 0; i < files.length; i++) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({
                            ...prev,
                            propertyPhotos: [...prev.propertyPhotos, reader.result as string]
                          }));
                        };
                        reader.readAsDataURL(files[i]);
                      }
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('propertyVideo')}</label>
                {formData.propertyVideo && (
                  <div className="relative mb-4">
                    <video src={formData.propertyVideo} className="w-full h-40 bg-black rounded-lg" controls />
                    <button
                      onClick={removeVideo}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-rose-500 transition cursor-pointer"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-gray-600">{formData.propertyVideo ? t('changeVideo') : t('addVideo')}</span>
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handlePhotoUpload(e, 'video')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-bold"
              >
                {t('complete')} ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Summary and completion (for busco_lugar)
  if (currentStep === 6 && formData.role === 'busco_lugar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profileComplete')}</h1>
            <p className="text-gray-600 mb-8">{t('redirectingHome')}</p>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                <p><strong>Username:</strong> {formData.username}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                <p><strong>Gender:</strong> {t(formData.gender as any)}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                <p><strong>Zone:</strong> {formData.zone}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                <ChevronLeft size={18} /> {t('previous')}
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
              >
                {t('complete')} ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfileBuilder;


