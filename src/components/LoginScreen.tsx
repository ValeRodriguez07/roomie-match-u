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
  const { login, register, loading, error, t } = useApp();

  // Opciones de ciudades/estados/provincias por país
  const cityOptionsByCountry: Record<string, string[]> = {
    'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
    'México': ['CDMX', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Mendoza', 'Santa Fe', 'Salta'],
    'Colombia': ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Cundinamarca', 'Santander'],
    'Chile': ['Santiago', 'Valparaíso', 'Biobío', 'Maule', 'Araucanía'],
    'Perú': ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura'],
    'Estados Unidos': ['California', 'Texas', 'Florida', 'Nueva York', 'Illinois'],
    'Brasil': ['São Paulo', 'Rio de Janeiro', 'Bahia', 'Minas Gerais', 'Paraná'],
    'Italia': ['Roma', 'Milán', 'Nápoles', 'Turín', 'Palermo'],
    'Francia': ['París', 'Lyon', 'Marsella', 'Toulouse', 'Niza'],
    'Alemania': ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Frankfurt'],
    'Venezuela': ['Caracas', 'Zulia', 'Miranda', 'Lara', 'Carabobo'],
    'Uruguay': ['Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandú'],
    'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Manabí', 'Azuay'],
    'Bolivia': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Tarija'],
    'Paraguay': ['Asunción', 'Central', 'Alto Paraná', 'Itapúa', 'Caaguazú'],
    'Guatemala': ['Guatemala', 'Quetzaltenango', 'Escuintla', 'Sacatepéquez', 'Huehuetenango'],
    'Honduras': ['Tegucigalpa', 'San Pedro Sula', 'Cortés', 'Atlántida', 'Yoro'],
    'El Salvador': ['San Salvador', 'Santa Ana', 'La Libertad', 'San Miguel', 'Sonsonate'],
    'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Puntarenas'],
    'Panamá': ['Panamá', 'Colón', 'Chiriquí', 'Veraguas', 'Coclé'],
    'Puerto Rico': ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas'],
    'Canadá': ['Ontario', 'Quebec', 'Columbia Británica', 'Alberta', 'Manitoba'],
    'Reino Unido': ['Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
    'Australia': ['Nueva Gales del Sur', 'Victoria', 'Queensland', 'Australia Occidental', 'Australia Meridional'],
    'Japón': ['Tokio', 'Osaka', 'Kioto', 'Hokkaido', 'Fukuoka'],
    'China': ['Pekín', 'Shanghái', 'Cantón', 'Shenzhen', 'Chongqing'],
    'India': ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
    'Rusia': ['Moscú', 'San Petersburgo', 'Novosibirsk', 'Ekaterimburgo', 'Nizhni Nóvgorod'],
    'Sudáfrica': ['Gauteng', 'Cabo Occidental', 'KwaZulu-Natal', 'Cabo Oriental', 'Estado Libre'],
  };
  const cityOptions = cityOptionsByCountry[country] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!acceptedTerms) {
        alert('Debes aceptar los términos y condiciones');
        return;
      }
      await register({
        email,
        username,
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
    } else {
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre de usuario"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País
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
                  placeholder="País (Ej: España, México, Argentina, Colombia, Chile, Perú, Estados Unidos, Brasil, Italia, Francia, Alemania, Venezuela, Uruguay, Ecuador)"
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
                  Ciudad/Estado/Provincia
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
                  <option value="">{country ? 'Selecciona una opción' : 'Selecciona primero un país'}</option>
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
                Acepto los <a href="#" className="text-primary-600 underline">términos y condiciones</a>
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