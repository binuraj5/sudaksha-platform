'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, User } from 'lucide-react';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState<Array<{ text: string, isUser: boolean, timestamp: Date }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showQuickOptions, setShowQuickOptions] = useState(true);

  // Simulate online/offline status
  useEffect(() => {
    const checkOnlineStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      // Assume online during business hours (9 AM - 8 PM IST)
      const isBusinessHours = hours >= 9 && hours < 20;
      setIsOnline(isBusinessHours);
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const quickOptions = [
    'Program Information',
    'Fee & Payment',
    'Batch Schedule',
    'Talk to Counselor'
  ];

  const handleQuickOption = (option: string) => {
    const userMessage = { text: option, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = '';
      switch (option) {
        case 'Program Information':
          botResponse = 'I can help you learn about our programs! We offer Java Full Stack, MERN Stack, Data Science, and DevOps. Which one interests you?';
          break;
        case 'Fee & Payment':
          botResponse = 'Our programs range from ₹40K-60K. We offer EMI options and Pay After Placement for eligible students. Would you like details on payment plans?';
          break;
        case 'Batch Schedule':
          botResponse = 'We have weekend batches (Sat-Sun) and weekday batches. Next batch starts in 2 weeks. Would you like to check availability for a specific program?';
          break;
        case 'Talk to Counselor':
          botResponse = 'I\'d be happy to connect you with a career counselor! They can help assess your background and recommend the best program. When would be a good time for a call?';
          break;
        default:
          botResponse = 'Thanks for your interest! How can I help you today?';
      }

      const botMessage = { text: botResponse, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setShowQuickOptions(false);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { text: currentMessage, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Track conversation
    try {
      const { trackEvent } = await import('@/lib/tracking');
      await trackEvent({
        action: 'LIVE_CHAT', // Mapping to AuditLog action
        entityType: 'USER',
        details: { message: currentMessage }
      });
    } catch (e) {
      console.error('Failed to track chat:', e);
    }

    setCurrentMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        text: 'Thanks for your message! Our team will get back to you soon. For immediate assistance, you can also call us at +91-XXXXX-XXXXX or WhatsApp us.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'
              }`}
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        )}

        {/* Status Indicator */}
        {!isOpen && (
          <div className="absolute -top-2 -left-2">
            <div className={`w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold">Hi! I'm Priya 👋</div>
                <div className="text-xs opacity-90">
                  {isOnline ? 'Online now' : 'Offline - replies by 10 AM'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {showQuickOptions && messages.length === 0 && (
              <div className="mb-4">
                <div className="text-gray-600 mb-3 text-sm">
                  How can I help you today?
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Quick Options:</div>
                  {quickOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickOption(option)}
                      className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm"
                    >
                      • {option}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-3 text-center">
                  Or type your question...
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-xs px-3 py-2 rounded-lg text-sm ${message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border'
                    }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={!isOnline}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || !isOnline}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {!isOnline && (
              <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                Currently offline. We'll respond by 10 AM tomorrow.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
