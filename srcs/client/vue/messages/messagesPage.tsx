import { useState } from 'react';
import { Send } from 'lucide-react';
import Footer from '../ts/Footer';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'friend';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([

  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate friend response
    setTimeout(() => {
      const responses = [
        'Cool ! 😊',
        'Bonne idée !',
        'D\'accord, allons-y !',
        'Super ! personnage approuve ! 🐶',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const friendMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'friend',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, friendMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]"> 
      {/* flex-col + min-h-screen pour que footer reste en bas */}
      <div className="text-center">
          <div className="inline-block">
            <img
              src="../shared-assets/pompompurin/profil/ip2.jpeg"
              alt="bas de page"
              className="w-15 h-15 object-cover cursor-pointer rounded-full"
            />
          </div>
        </div>

      {/* Chat container */}
      <div className="flex-1 max-w-4xl w-full mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-[#FEE96E] flex flex-col overflow-hidden">
        {/* Header chat */}
        <div className="bg-[#FEE96E] p-6 rounded-t-3xl flex-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B5A3C] rounded-full flex items-center justify-center text-white text-xl">
              P
            </div>
            <div>
              <h2 className="text-xl text-[#8B5A3C]">personnage Friend</h2>
              <p className="text-sm text-[#A67C52]">En ligne</p>
            </div>
          </div>
        </div>

        {/* Messages scrollables */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-6 py-3 rounded-3xl ${
                  message.sender === 'user'
                    ? 'bg-[#FEE96E] text-[#8B5A3C]'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t-4 border-[#FEE96E] flex-none">
          <div className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
            />
            <button
              onClick={sendMessage}
              className="bg-[#FEE96E] text-[#8B5A3C] px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
        <Footer />
    </div>
  );
}