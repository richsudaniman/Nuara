import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ClientMessages({ clientId, trainerId }) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: clientId });
      return users[0] || null;
    },
    enabled: !!clientId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['clientMessages', clientId, trainerId],
    queryFn: async () => {
      const allMessages = await base44.entities.ChatMessage.list('-created_date', 200);
      return allMessages.filter(msg => 
        (msg.sender_id === trainerId && msg.receiver_id === clientId) ||
        (msg.sender_id === clientId && msg.receiver_id === trainerId)
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    initialData: [],
    enabled: !!clientId && !!trainerId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Mark received messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === trainerId && !msg.is_read
      );
      
      for (const msg of unreadMessages) {
        try {
          await base44.entities.ChatMessage.update(msg.id, { is_read: true });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['clientMessages'] });
        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      }
    };

    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, trainerId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const newMessage = await base44.entities.ChatMessage.create({
        sender_id: trainerId,
        receiver_id: clientId,
        message: text,
        message_type: 'text',
        is_read: false,
      });

      // Send email notification to client
      try {
        await base44.integrations.Core.SendEmail({
          to: client.email,
          subject: 'New Message from Your Clinician',
          body: `You have a new message from your clinician:\n\n"${text}"\n\nLog in to your EJT Fitness account to reply.`,
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }

      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientMessages'] });
      setMessageText("");
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    await sendMessageMutation.mutateAsync(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[#0ea5e9]" />
        <h3 className="font-black italic text-[#1a1a1a] text-lg">MESSAGES WITH CLIENT</h3>
      </div>

      {/* Messages Container */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-0">
          {messagesLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg bg-gray-100" />)}
            </div>
          ) : (
            <div className="h-[400px] overflow-y-auto p-5 space-y-3">
              {messages.length > 0 ? (
                <>
                  {messages.map((msg) => {
                    const isTrainer = msg.sender_id === trainerId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isTrainer
                              ? 'bg-[#0ea5e9] text-white'
                              : 'bg-gray-100 text-[#1a1a1a]'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isTrainer ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 italic">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start a conversation with your client</p>
                </div>
              )}
            </div>
          )}

          {/* Message Input */}
          <div className="border-t-2 border-gray-200 p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-[60px] max-h-[120px] bg-white border-gray-300 resize-none"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic h-[60px] px-6 glow-blue"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-sm text-gray-700 mb-3">💡 Quick Message Templates</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessageText("Great work on today's workout! Keep it up! 💪")}
              className="text-xs"
            >
              Workout Praise
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessageText("Don't forget to log your meals today. Nutrition is key! 🥗")}
              className="text-xs"
            >
              Nutrition Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessageText("How are you feeling about your progress? Let's discuss your goals.")}
              className="text-xs"
            >
              Check-In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessageText("I've updated your workout plan. Check it out and let me know if you have any questions!")}
              className="text-xs"
            >
              Plan Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}