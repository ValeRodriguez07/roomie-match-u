import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';
import type { Message, Match } from '../types';
import { messageService } from '../services/MessageService';
import { useApp } from '../context/AppContext';

interface ChatInterfaceProps {
  match: Match;
  otherUserName: string;
  onBackClick?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ match, otherUserName, onBackClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, t } = useApp();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const chatMessages = await messageService.getMatchMessages(match.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await messageService.sendMessage({
        matchId: match.id,
        senderId: user.id,
        content: messageContent,
        type: 'text'
      });
      
      // Recargar mensajes para incluir el nuevo
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Simular recepción de mensajes en tiempo real
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">{t('loading')}...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4 border-b border-primary-200">
        <div className="flex items-center space-x-3">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="hover:bg-primary-500 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
          )}
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('chatWith')} {otherUserName}</h3>
            <p className="text-sm text-primary-100">
              {match.status === 'accepted' ? t('online') : t('pending')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{t('startConversation')}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : message.senderId === 'system'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id
                      ? 'text-primary-200'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {match.status === 'accepted' ? (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <p className="text-sm text-blue-700 text-center">{t('acceptMatchToChatStart')}</p>
        </div>
      )}
    </div>
  );
};