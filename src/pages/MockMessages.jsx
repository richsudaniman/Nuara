import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function MockMessages() {
  const [newMessage, setNewMessage] = useState("");

  const mockMessages = [
    { id: 1, sender: "therapist", text: "Hi Sarah! Great job on your homework this week! 🎉", time: "10:30 AM" },
    { id: 2, sender: "client", text: "Thank you! I've been practicing every day.", time: "10:32 AM" },
    { id: 3, sender: "therapist", text: "That's wonderful! I noticed you completed all your /s/ sound exercises. How did those feel?", time: "10:33 AM" },
    { id: 4, sender: "client", text: "They were good! The minimal pairs activity was really helpful.", time: "10:35 AM" },
    { id: 5, sender: "therapist", text: "Excellent! Keep up the great work. I've added some new sentence building activities for tomorrow.", time: "10:37 AM" },
  ];

  const handleSend = () => {
    if (newMessage.trim()) setNewMessage("");
  };

  return (
    <div className="bg-[#FAFAFB] min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#EFEFF2] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#A78BFA] flex items-center justify-center text-white font-semibold text-base">
            E
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em]">Your therapist</p>
            <h1 className="text-[16px] font-semibold text-[#0F0F12]">Dr. Emily Chen</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-5 py-5 space-y-3">
        {mockMessages.map((msg) => {
          const isClient = msg.sender === 'client';
          return (
            <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%]`}>
                <div className={`px-4 py-2.5 rounded-2xl ${
                  isClient
                    ? 'bg-[#A78BFA] text-white rounded-br-md'
                    : 'bg-white border border-[#EFEFF2] text-[#0F0F12] rounded-bl-md'
                }`}>
                  <p className="text-[14px] leading-relaxed">{msg.text}</p>
                </div>
                <p className={`text-[10px] text-[#9CA3AF] mt-1 px-1 ${isClient ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#EFEFF2] px-5 py-3.5 sticky bottom-0">
        <div className="flex items-center gap-2.5">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-11 bg-[#FAFAFB] border-[#EFEFF2] rounded-xl text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#A78BFA]"
          />
          <button
            onClick={handleSend}
            className="w-11 h-11 bg-[#A78BFA] hover:bg-[#9275F5] text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}