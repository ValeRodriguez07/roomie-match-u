import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, loading, error, t, setLanguage, language } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState<typeof language>(language);

  // Opciones de ciudades/estados/provincias por país
  const cityOptionsByCountry: Record<string, string[]> = {
    'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas'],
    'México': ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida', 'Tijuana', 'León', 'Querétaro', 'Cancún', 'Toluca', 'Chiapas', 'Morelia', 'Zacatecas', 'Aguascalientes'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Salta', 'San Miguel de Tucumán', 'Neuquén', 'Bahía Blanca', 'Resistencia'],
    'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Ibagué', 'Santa Marta', 'Cúcuta'],
    'Chile': ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'Antofagasta', 'La Serena', 'Temuco', 'Iquique', 'Rancagua', 'Talca'],
    'Perú': ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Puno', 'Tacna'],
    'Estados Unidos': ['Miami', 'Orlando', 'Tampa', 'Los Angeles', 'San Francisco', 'San Diego', 'Houston', 'Dallas', 'Austin', 'New York', 'Chicago', 'Seattle', 'Atlanta'],
    'Brasil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Curitiba', 'Manaus', 'Recife', 'Porto Alegre'],
    'Italia': ['Roma', 'Milán', 'Nápoles', 'Turín', 'Palermo', 'Boloña', 'Florencia', 'Génova', 'Venecia', 'Verona'],
    'Francia': ['París', 'Lyon', 'Marsella', 'Toulouse', 'Niza', 'Nantes', 'Estrasburgo', 'Montpellier', 'Burdeos', 'Lille'],
    'Alemania': ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen'],
    'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Maturín', 'Ciudad Guayana', 'Puerto La Cruz', 'San Cristóbal'],
    'Uruguay': ['Montevideo', 'Canelones', 'Maldonado', 'Paysandú', 'Salto', 'Rivera', 'Colonia'],
    'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Manta', 'Portoviejo', 'Santo Domingo', 'Ambato', 'Machala'],
    'Bolivia': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro', 'Potosí', 'Tarija', 'El Alto'],
    'Paraguay': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Encarnación', 'Fernando de la Mora'],
    'Guatemala': ['Guatemala City', 'Quetzaltenango', 'Escuintla', 'Huehuetenango', 'Antigua Guatemala', 'Chimaltenango'],
    'Honduras': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'Comayagua', 'El Progreso'],
    'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel', 'La Libertad', 'Sonsonate', 'Soyapango'],
    'Canadá': ['Toronto', 'Ottawa', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton'],
    'Reino Unido': ['Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Glasgow', 'Edimburgo'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'Japón': ['Tokio', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki'],
    'China': ['Pekín', 'Shanghái', 'Guangzhou', 'Shenzhen', 'Chongqing', 'Tianjin'],
    'India': ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad'],
    'Rusia': ['Moscú', 'San Petersburgo', 'Novosibirsk', 'Ekaterimburgo', 'Nizhni Nóvgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara'],
    'Sudáfrica': ['Johannesburgo', 'Ciudad del Cabo', 'Durban', 'Pretoria', 'Port Elizabeth'],
  };
  const cityOptions = cityOptionsByCountry[country] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!acceptedTerms) {
        alert(t('mustAcceptTerms'));
        return;
      }
      await register({
        email,
        username,
        preferredLanguage: selectedLanguage,
        phone,
        acceptedTerms,
        password,
        type: 'busco_lugar',
        preferences: {
          maxPrice: 500,
          minPrice: 300,
          location: 'Centro',
          city,
          country,
          smoking: false,
          pets: false,
          genderPreference: 'any',
          minAge: 18,
          maxAge: 35
        },
        profile: {
          age: 25,
          gender: 'other',
          occupation: 'Estudiante',
          description: 'Nuevo usuario',
          habits: ['deportista', 'estudiante'],
          languages: ['español']
        }
      });
      // Mark that the profile builder should be shown for this new registration
      try {
        sessionStorage.setItem('showProfileBuilder', 'true');
      } catch (err) {
        // ignore storage errors
      }
    } else {
      // Existing users should go straight to home; ensure the flag is cleared
      try {
        sessionStorage.setItem('showProfileBuilder', 'false');
      } catch (err) {}
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? t('createAccount') : t('login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering
              ? t('joinRoomieMatch')
              : t('accessYourAccount')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('languageLabel')}</label>
                <div className="flex space-x-3">
                  <label className={`px-3 py-2 rounded-lg border ${selectedLanguage === 'es' ? 'bg-primary-600 text-white' : 'bg-white'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="es"
                      checked={selectedLanguage === 'es'}
                      onChange={() => { setSelectedLanguage('es'); setLanguage('es'); }}
                      className="hidden"
                    />
                    {t('spanish')}
                  </label>
                  <label className={`px-3 py-2 rounded-lg border ${selectedLanguage === 'en' ? 'bg-primary-600 text-white' : 'bg-white'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={selectedLanguage === 'en'}
                      onChange={() => { setSelectedLanguage('en'); setLanguage('en'); }}
                      className="hidden"
                    />
                    {t('english')}
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('username')}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('usernamePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('countryLabel')}
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity(''); // Limpiar ciudad al cambiar país
                  }}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('countryPlaceholder')}
                  list="country-list"
                />
                <datalist id="country-list">
                  <option value="España" />
                  <option value="México" />
                  <option value="Argentina" />
                  <option value="Colombia" />
                  <option value="Chile" />
                  <option value="Perú" />
                  <option value="Estados Unidos" />
                  <option value="Brasil" />
                  <option value="Italia" />
                  <option value="Francia" />
                  <option value="Alemania" />
                  <option value="Venezuela" />
                  <option value="Uruguay" />
                  <option value="Ecuador" />
                  <option value="Bolivia" />
                  <option value="Paraguay" />
                  <option value="Guatemala" />
                  <option value="Honduras" />
                  <option value="El Salvador" />
                  <option value="Costa Rica" />
                  <option value="Panamá" />
                  <option value="Puerto Rico" />
                  <option value="Canadá" />
                  <option value="Reino Unido" />
                  <option value="Australia" />
                  <option value="Japón" />
                  <option value="China" />
                  <option value="India" />
                  <option value="Rusia" />
                  <option value="Sudáfrica" />
                </datalist>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('citySelectPrompt')}
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  disabled={!country || cityOptions.length === 0}
                >
                  <option value="">{country ? t('selectOption') : t('selectCountryFirst')}</option>
                  {cityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder={t('email')}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder={t('password')}
            />
          </div>

          {isRegistering && (
            <div className="flex items-center">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="acceptedTerms" className="ml-2 block text-sm text-gray-700">
                {t('acceptTerms')}
              </label>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? t('loading') + '...' : isRegistering ? t('register') : t('login')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary-600 hover:text-primary-500 text-sm"
            >
              {isRegistering
                ? t('haveAccount')
                : t('noAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};