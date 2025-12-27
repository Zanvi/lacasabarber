import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { initializeChat, sendMessageToGemini } from '../services/geminiService';
import { db } from '../services/dataService';
import { Send, Menu, CalendarCheck, Share2 } from 'lucide-react';
import { BARBERSHOP_INFO } from '../constants';

interface ChatInterfaceProps {
  user: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onToggleSidebar, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat(user.name);
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'model',
      text: `Olá ${user.name}, seja bem-vindo à ${BARBERSHOP_INFO.name}! ✂️ Eu sou o assistente virtual do Danilo. Como posso te ajudar hoje?`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  }, [user.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const processResponse = (responseText: string) => {
    // Regex to find the hidden JSON booking confirmation
    const bookingRegex = /\[BOOKING_CONFIRMED: ({.*?})\]/;
    const match = responseText.match(bookingRegex);
    
    let cleanText = responseText;
    let bookingData = null;

    if (match) {
      try {
        bookingData = JSON.parse(match[1]);
        cleanText = responseText.replace(match[0], '').trim();
        
        // Save to Mock DB
        db.addAppointment({
          userId: user.id,
          userName: user.name,
          serviceName: bookingData.service,
          date: bookingData.date,
          time: bookingData.time
        });
        
      } catch (e) {
        console.error("Failed to parse booking JSON", e);
      }
    }

    return { cleanText, bookingData };
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsgText = inputText;
    setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const fullResponse = await sendMessageToGemini(userMsgText);
      const { cleanText, bookingData } = processResponse(fullResponse);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText,
        timestamp: new Date(),
        isBookingConfirmation: !!bookingData
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Tive um erro de conexão. Pode tentar novamente?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-barber-black relative">
      {/* Header Mobile */}
      <div className="flex items-center justify-between p-4 bg-barber-dark border-b border-zinc-800 z-10 shadow-md">
        <div className="flex items-center gap-3">
           <button onClick={onToggleSidebar} className="text-white md:hidden">
            <Menu size={24} />
           </button>
           <div className="w-8 h-8 bg-barber-red rounded-full flex items-center justify-center text-sm">✂️</div>
           <div>
             <span className="font-bold text-white block leading-tight">{BARBERSHOP_INFO.name}</span>
             <span className="text-xs text-green-500 flex items-center gap-1">● Online</span>
           </div>
        </div>
        <button onClick={onLogout} className="text-xs text-zinc-500 hover:text-white border border-zinc-700 px-3 py-1 rounded-full">
          Sair
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                  max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md relative
                  ${msg.role === 'user' 
                    ? 'bg-barber-red text-white rounded-br-none' 
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'}
                `}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0 min-h-[1em]">{line}</p>
                ))}
              </div>
            </div>

            {/* Special UI for Booking Confirmation */}
            {msg.isBookingConfirmation && (
              <div className="flex justify-center mt-4 mb-2 animate-fade-in-up">
                <div className="bg-zinc-900 border border-green-900/50 rounded-xl p-4 w-full max-w-sm shadow-xl">
                  <div className="flex items-center gap-3 mb-3 border-b border-zinc-800 pb-2">
                    <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
                      <CalendarCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-green-500 font-bold">Agendamento Confirmado!</h3>
                      <p className="text-xs text-zinc-400">Adicionado à agenda do Danilo</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button className="bg-zinc-800 hover:bg-zinc-700 text-xs text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors">
                      📅 Google Agenda
                    </button>
                    <button className="bg-[#25D366] hover:bg-[#128C7E] text-xs text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors font-bold">
                      <Share2 size={14} /> WhatsApp
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-zinc-500">Um lembrete será enviado 1h antes.</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-zinc-800 p-4 rounded-2xl rounded-bl-none border border-zinc-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-barber-dark border-t border-zinc-800">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-full px-6 py-4 focus:outline-none focus:border-barber-red focus:ring-1 focus:ring-barber-red transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-barber-red hover:bg-barber-redHover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg hover:shadow-red-900/50 transform active:scale-95"
          >
            <Send size={24} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;