import React from 'react';
import { Bell, MessageCircle, User, LogOut, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNotificationClick?: (actionUrl?: string, notificationId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, unreadNotifications, notifications, logout, setLanguage, language, t, markNotificationAsRead } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                Roomie<span className="text-secondary-500">Match</span>U
              </h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onTabChange('explore')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'explore'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              {t('explore')}
            </button>
            <button
              onClick={() => onTabChange('matches')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              {t('matches')}
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              {t('chat')}
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              {t('analytics')}
            </button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 border border-gray-300 rounded-lg text-sm hidden sm:block"
            >
              {language === 'es' ? 'EN' : 'ES'}
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
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 font-semibold">{t('notifications')}</div>
                  <div className="max-h-64 overflow-y-auto">
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
                          className={`w-full text-left p-3 hover:bg-gray-50 flex items-start space-x-3 ${n.read ? 'opacity-80' : 'bg-white'}`}
                        >
                          <div className="w-10">
                            <div className={`text-xs px-2 py-1 rounded-full text-white text-center ${n.type === 'message' ? 'bg-primary-600' : n.type === 'match' ? 'bg-green-600' : 'bg-gray-500'}`}>
                              {n.type === 'message' ? t('newMessage') : n.type === 'match' ? t('matchFound') : n.type}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-500 truncate">{n.message}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button 
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title={t('messages')}
              onClick={() => onTabChange('chat')}
            >
              <MessageCircle size={20} />
            </button>

            {/* Settings */}
            <button 
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              title={t('settings')}
            >
              <Settings size={20} />
            </button>

            {/* User Profile */}
            <button
              onClick={() => onTabChange('profile')}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
              title="View Profile"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.name}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title={t('logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};