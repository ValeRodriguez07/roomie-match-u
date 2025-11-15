import React, { useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import type { Match, Message } from '../types';
import { messageService } from '../services/MessageService';
import { useApp } from '../context/AppContext';

interface ChatListProps {
  matches: Match[];
  onSelectChat: (match: Match, otherUserName: string) => void;
  getUserName: (userId: string) => string;
}

export const ChatList: React.FC<ChatListProps> = ({ matches, onSelectChat, getUserName }) => {
  const { user, t } = useApp();
  const [lastMessages, setLastMessages] = useState<Map<string, Message>>(new Map());

  React.useEffect(() => {
    // Cargar el último mensaje de cada chat
    const loadLastMessages = async () => {
      const messages = new Map<string, Message>();
      for (const match of matches) {
        try {
          const chatMessages = await messageService.getMatchMessages(match.id);
          if (chatMessages.length > 0) {
            messages.set(match.id, chatMessages[chatMessages.length - 1]);
          }
        } catch (error) {
          console.error('Error loading messages for match:', match.id, error);
        }
      }
      setLastMessages(messages);
    };

    if (matches.length > 0) {
      loadLastMessages();
      const interval = setInterval(loadLastMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [matches]);

  const acceptedMatches = matches.filter(m => m.status === 'accepted');
  const pendingMatches = matches.filter(m => m.status === 'pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Chat List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MessageCircle size={24} />
            <span>{t('chat')}</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {acceptedMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageCircle size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">{t('noChatsAvailable')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {acceptedMatches.map((match) => {
                const otherUserId = user?.id === match.user1Id ? match.user2Id : match.user1Id;
                const otherUserName = getUserName(otherUserId);
                const lastMessage = lastMessages.get(match.id);

                return (
                  <button
                    key={match.id}
                    onClick={() => onSelectChat(match, otherUserName)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left border-l-4 border-transparent hover:border-primary-600"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{otherUserName}</h3>
                        {lastMessage ? (
                          <p className="text-sm text-gray-500 truncate">
                            {lastMessage.senderId === user?.id ? 'Tú: ' : ''}{lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">{t('startConversation')}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Matches Section */}
        {pendingMatches.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('pending')} ({pendingMatches.length})</h3>
            <div className="space-y-2">
              {pendingMatches.map((match) => {
                const otherUserId = user?.id === match.user1Id ? match.user2Id : match.user1Id;
                const otherUserName = getUserName(otherUserId);

                return (
                  <div key={match.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-yellow-200">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{otherUserName}</p>
                      <p className="text-xs text-gray-500">{t('waitingResponse')} {otherUserName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State for Chat Selection */}
      <div className="lg:col-span-2 hidden lg:flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('selectChat')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('noChatSelected')}</p>
        </div>
      </div>
    </div>
  );
};
