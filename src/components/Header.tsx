import React from 'react';
import { Bell, MessageCircle, User, LogOut, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCY_OPTIONS } from '../types';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNotificationClick?: (actionUrl?: string, notificationId?: string) => void;
  userType?: 'busco_lugar' | 'tengo_lugar';
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, userType }) => {
  const { user, unreadNotifications, notifications, logout, setLanguage, language, t, markNotificationAsRead, selectedCurrency, setCurrency } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  if (!user) return null;

  return (
    <>
      {/* Top Header - Fixed */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-primary-600">
                    Roomie
                  </h1>
                  <h2 className="text-sm font-semibold text-secondary-500">
                    Match U
                  </h2>
                </div>
              </div>
            </div>

            {/* Top Navigation - Icons */}
            <nav className="flex items-center space-x-2">
              {/* Currency Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title={`Currency: ${selectedCurrency}`}
                >
                  <span className="text-sm font-medium">{selectedCurrency}</span>
                </button>

                {/* Currency Dropdown */}
                {showCurrencyDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {[...new Set(Object.values(CURRENCY_OPTIONS).flat())].sort().map(currency => (
                        <button
                          key={currency}
                          onClick={() => {
                            setCurrency(currency);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            selectedCurrency === currency ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                          }`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title={language === 'es' ? 'English' : 'Español'}
              >
                <span className="text-sm font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((s) => !s)}
                  className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title={t('notifications')}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
                      <div className="p-4 border-b border-gray-100 font-semibold flex justify-between items-center">
                        <span>{t('notifications')}</span>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500">{t('noNotifications')}</div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={async () => {
                                if (n.actionUrl) {
                                  await markNotificationAsRead(n.id);
                                  const evt = new CustomEvent('app:notificationClick', { detail: { actionUrl: n.actionUrl, notificationId: n.id } });
                                  window.dispatchEvent(evt);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`w-full text-left p-4 hover:bg-gray-50 flex items-start space-x-3 border-b border-gray-50 ${n.read ? 'opacity-80' : 'bg-white'}`}
                            >
                              <div className="w-10 flex-shrink-0">
                                <div className={`text-xs px-2 py-1 rounded-full text-white text-center ${n.type === 'message' ? 'bg-primary-600' : n.type === 'match' ? 'bg-green-600' : 'bg-gray-500'}`}>
                                  {n.type === 'message' ? t('newMessage') : n.type === 'match' ? t('matchFound') : n.type}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">{n.title}</div>
                                <div className="text-xs text-gray-500 truncate">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <button
                onClick={() => onTabChange('profile')}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title={t('editProfile')}
              >
                <User size={20} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => onTabChange('explore')}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'explore'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xs">{t('explore')}</span>
          </button>

          <button
            onClick={() => onTabChange('matches')}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'matches'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xs">{t('matches')}</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'chat'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xs">{t('chat')}</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xs">{t('analytics')}</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xs">{t('editProfile')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};