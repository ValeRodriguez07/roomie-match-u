import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ProfileBuilder } from './components/ProfileBuilder';
import { ProfileView } from './components/ProfileView';
import { ExploreScreen } from './components/ExploreScreen';
import { ChatInterface } from './components/ChatInterface';
import { useMatches } from './hooks/useMatches';
import { Users, MessageCircle, BarChart3, Home, Check, X } from 'lucide-react';
import { mockUsers } from './data/mockData'; // AGREGAR ESTA IMPORTACIÓN

const AppContent: React.FC = () => {
  const { user, t } = useApp();
  const { matches, acceptMatch, rejectMatch } = useMatches();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedChatMatch, setSelectedChatMatch] = useState<string | null>(null);
  const [selectedChatUserName, setSelectedChatUserName] = useState<string>('');
  const [showProfileBuilder, setShowProfileBuilder] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Check if profile needs to be built
  useEffect(() => {
    try {
      const showOnRegistration = sessionStorage.getItem('showProfileBuilder') === 'true';
      if (user && !user.profileComplete && showOnRegistration) {
        setShowProfileBuilder(true);
      }
    } catch (err) {
      if (user && !user.profileComplete) setShowProfileBuilder(true);
    }
  }, [user]);

  // Handle profile builder completion
  useEffect(() => {
    const handleProfileComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Profile data received:', customEvent.detail);
      // Aquí guardaríamos los datos en la base de datos
      // Por ahora, simplemente cerramos el profile builder
      setShowProfileBuilder(false);
      setIsEditingProfile(false);
      setActiveTab('explore');
      try { sessionStorage.removeItem('showProfileBuilder'); } catch (e) {}
    };

    window.addEventListener('profileBuilderComplete', handleProfileComplete);
    return () => window.removeEventListener('profileBuilderComplete', handleProfileComplete);
  }, []);

  // FUNCIÓN PARA OBTENER EL NOMBRE DEL USUARIO POR ID
  const getUserNameById = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Usuario';
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await acceptMatch(matchId);
      alert('Match aceptado correctamente');
    } catch (error) {
      alert('Error al aceptar el match');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      await rejectMatch(matchId);
      alert('Match rechazado correctamente');
    } catch (error) {
      alert('Error al rechazar el match');
    }
  };

  // FUNCIÓN PARA OBTENER MATCHES SEGÚN EL TIPO DE USUARIO
  const getUserMatches = () => {
    if (!user) return [];
    
    if (user.type === 'busco_lugar') {
      // Para Carlos: mostrar solo matches que él inició
      return matches.filter(match => match.user1Id === user.id);
    } else {
      // Para María: mostrar solo matches donde ella es el user2 (dueña de la publicación)
      return matches.filter(match => match.user2Id === user.id);
    }
  };

  const userMatches = getUserMatches();

  React.useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail || {};
      const actionUrl: string | undefined = detail.actionUrl;
      if (!actionUrl) return;

      // Example actionUrl: /chat/match_1
      if (actionUrl.startsWith('/chat/')) {
        const matchId = actionUrl.replace('/chat/', '');
        const found = userMatches.find(m => m.id === matchId) || matches.find(m => m.id === matchId);
        if (found) {
          const otherUserId = user?.id === found.user1Id ? found.user2Id : found.user1Id;
          const otherUserName = getUserNameById(otherUserId);
          setSelectedChatUserName(otherUserName);
          setSelectedChatMatch(found.id);
          setActiveTab('chat');
        } else {
          // If not found in current userMatches, still switch to chat tab
          setActiveTab('chat');
        }
      }
    };

    window.addEventListener('app:notificationClick', handler as EventListener);
    return () => window.removeEventListener('app:notificationClick', handler as EventListener);
  }, [userMatches, matches, user]);

  // Si no hay usuario logueado, renderizar la pantalla de login
  if (!user) {
    return <LoginScreen />;
  }

  // Show profile builder if profile is incomplete or editing
  if (showProfileBuilder || isEditingProfile) {
    return <ProfileBuilder />;
  }

  // Show profile view
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 pt-16">
          <ProfileView
            onEditClick={() => {
              setIsEditingProfile(true);
              setShowProfileBuilder(true);
            }}
            onClose={() => setActiveTab('explore')}
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return <ExploreScreen />;
      case 'matches':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('myMatches')}</h2>
            {userMatches.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">{t('noMatches')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userMatches.map(match => {
                  // DETERMINAR QUIÉN ES EL OTRO USUARIO
                  const otherUserId = user.type === 'busco_lugar' ? match.user2Id : match.user1Id;
                  const otherUserName = getUserNameById(otherUserId);
                  
                  return (
                    <div key={match.id} className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.type === 'busco_lugar' 
                              ? `Solicitud a ${otherUserName}`
                              : `Solicitud de ${otherUserName}`
                            }
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('score')}: {Math.round(match.score * 100)}% • 
                            {t('status')}: {match.status === 'accepted' ? t('accepted') : 
                                         match.status === 'rejected' ? t('rejected') : t('pending')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          match.status === 'accepted' 
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.status === 'accepted' ? t('accepted') : 
                           match.status === 'rejected' ? t('rejected') : t('pending')}
                        </span>
                      </div>
                      
                      {/* MOSTRAR ACCIONES SOLO PARA MARÍA (tengo_lugar) EN MATCHES PENDIENTES */}
                      {match.status === 'pending' && user.type === 'tengo_lugar' && (
                        <div className="flex space-x-3 justify-end mt-4">
                          <button
                            onClick={() => handleRejectMatch(match.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={18} />
                            <span>Rechazar</span>
                          </button>
                          <button
                            onClick={() => handleAcceptMatch(match.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check size={18} />
                            <span>Aceptar</span>
                          </button>
                        </div>
                      )}
                      
                      {/* PARA CARLOS (busco_lugar) - SOLO INFORMACIÓN */}
                      {match.status === 'pending' && user.type === 'busco_lugar' && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            Esperando respuesta de {otherUserName}...
                          </p>
                        </div>
                      )}
                      
                      {/* Información para matches aceptados */}
                      {match.status === 'accepted' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            ¡Match aceptado! Puedes iniciar una conversación en la pestaña de Chat.
                          </p>
                        </div>
                      )}

                      {/* Información para matches rechazados */}
                      {match.status === 'rejected' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700">
                            Match rechazado
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'chat':
        return (
          <div className="flex-1 bg-gray-50 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-screen">
              {/* Chat List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <MessageCircle size={24} />
                    <span>{t('chat')}</span>
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {userMatches.filter(m => m.status === 'accepted').length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <MessageCircle size={40} className="text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">{t('noChatsAvailable')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {userMatches.filter(m => m.status === 'accepted').map((match) => {
                        const otherUserId = user?.id === match.user1Id ? match.user2Id : match.user1Id;
                        const otherUserName = getUserNameById(otherUserId);
                        const isSelected = selectedChatMatch === match.id;

                        return (
                          <button
                            key={match.id}
                            onClick={() => {
                              setSelectedChatMatch(match.id);
                              setSelectedChatUserName(otherUserName);
                            }}
                            className={`w-full p-4 hover:bg-gray-50 transition-colors text-left border-l-4 ${
                              isSelected ? 'border-primary-600 bg-gray-50' : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users size={20} className="text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{otherUserName}</h3>
                                <p className="text-sm text-gray-500 truncate">{t('online')}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pending Matches Section */}
                {userMatches.filter(m => m.status === 'pending').length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-32 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      {t('pending')} ({userMatches.filter(m => m.status === 'pending').length})
                    </h3>
                    <div className="space-y-2">
                      {userMatches.filter(m => m.status === 'pending').map((match) => {
                        const otherUserId = user?.id === match.user1Id ? match.user2Id : match.user1Id;
                        const otherUserName = getUserNameById(otherUserId);

                        return (
                          <div key={match.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-yellow-200">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users size={16} className="text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{otherUserName}</p>
                              <p className="text-xs text-gray-500 truncate">{t('pending')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Window */}
              <div className="hidden lg:block lg:col-span-3">
                {selectedChatMatch ? (
                  <ChatInterface
                    match={userMatches.find(m => m.id === selectedChatMatch)!}
                    otherUserName={selectedChatUserName}
                    onBackClick={() => setSelectedChatMatch(null)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                      <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">{t('selectChat')}</p>
                      <p className="text-gray-400 text-sm mt-2">{t('noChatSelected')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Chat View */}
              <div className="lg:hidden col-span-1">
                {selectedChatMatch ? (
                  <ChatInterface
                    match={userMatches.find(m => m.id === selectedChatMatch)!}
                    otherUserName={selectedChatUserName}
                    onBackClick={() => setSelectedChatMatch(null)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                      <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">{t('selectChat')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('analytics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">{t('totalMatches')}</h3>
                <p className="text-3xl font-bold text-primary-600">{userMatches.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">{t('activeMatches')}</h3>
                <p className="text-3xl font-bold text-green-600">
                  {userMatches.filter(m => m.status === 'accepted').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">{t('successRate')}</h3>
                <p className="text-3xl font-bold text-secondary-600">
                  {userMatches.length > 0 
                    ? Math.round((userMatches.filter(m => m.status === 'accepted').length / userMatches.length) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <ExploreScreen />;
    }
  };

  // Resto del código sin cambios...
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex">
        {/* Sidebar - Desktop */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'explore'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home size={20} />
              <span>{t('explore')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('matches')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'matches'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={20} />
              <span>{t('matches')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle size={20} />
              <span>{t('chat')}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={20} />
              <span>{t('analytics')}</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation - FIXED */}
      <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center p-2 flex-1 ${
              activeTab === 'explore' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">{t('explore')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center p-2 flex-1 ${
              activeTab === 'matches' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <Users size={20} />
            <span className="text-xs mt-1">{t('matches')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center p-2 flex-1 ${
              activeTab === 'chat' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">{t('chat')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center p-2 flex-1 ${
              activeTab === 'analytics' ? 'text-primary-600' : 'text-gray-600'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-xs mt-1">{t('stats')}</span>
          </button>
        </div>
      </div>
      
      {/* Padding for mobile bottom nav */}
      <div className="md:hidden h-16"></div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;