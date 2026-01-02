import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Smile } from "lucide-react";

export default function MockMessages() {
  const [newMessage, setNewMessage] = useState("");

  // Mock conversation with therapist
  const mockMessages = [
    { id: 1, sender: "therapist", text: "Hi Sarah! Great job on your homework this week! 🎉", time: "10:30 AM", senderName: "Dr. Emily Chen" },
    { id: 2, sender: "client", text: "Thank you! I've been practicing every day.", time: "10:32 AM", senderName: "You" },
    { id: 3, sender: "therapist", text: "That's wonderful! I noticed you completed all your /s/ sound exercises. How did those feel?", time: "10:33 AM", senderName: "Dr. Emily Chen" },
    { id: 4, sender: "client", text: "They were good! The minimal pairs activity was really helpful.", time: "10:35 AM", senderName: "You" },
    { id: 5, sender: "therapist", text: "Excellent! Keep up the great work. I've added some new sentence building activities for tomorrow. Let me know if you have any questions! 😊", time: "10:37 AM", senderName: "Dr. Emily Chen" },
  ];

  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-blue-50/30 to-white min-h-screen flex flex-col">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dr. Emily Chen</h1>
              <p className="text-sm text-purple-100">Speech-Language Pathologist</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 space-y-3">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.sender === 'client' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'client' 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 px-2 ${msg.sender === 'client' ? 'text-right' : 'text-left'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <Card className="bg-white border-purple-100 shadow-lg sticky bottom-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border-gray-300 rounded-xl"
            />
            <Button 
              onClick={handleSend}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}