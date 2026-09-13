import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Messages() {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: trainer, isLoading: trainerLoading } = useQuery({
    queryKey: ['assignedTrainer', user?.assigned_trainer_id],
    queryFn: async () => {
      if (!user?.assigned_trainer_id) return null;
      const trainers = await base44.entities.User.filter({ id: user.assigned_trainer_id });
      return trainers[0] || null;
    },
    enabled: !!user?.assigned_trainer_id,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', user?.id, trainer?.id],
    queryFn: async () => {
      const allMessages = await base44.entities.ChatMessage.list('-created_date', 200);
      return allMessages.filter(msg => 
        (msg.sender_id === user.id && msg.receiver_id === trainer.id) ||
        (msg.sender_id === trainer.id && msg.receiver_id === user.id)
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    initialData: [],
    enabled: !!user?.id && !!trainer?.id,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Mark received messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.receiver_id === user?.id && !msg.is_read
      );
      
      for (const msg of unreadMessages) {
        try {
          await base44.entities.ChatMessage.update(msg.id, { is_read: true });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
      
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      }
    };

    if (messages.length > 0 && user?.id) {
      markAsRead();
    }
  }, [messages, user?.id, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const newMessage = await base44.entities.ChatMessage.create({
        sender_id: user.id,
        receiver_id: trainer.id,
        message: text,
        message_type: 'text',
        is_read: false,
      });

      // Send email notification to trainer
      try {
        await base44.integrations.Core.SendEmail({
          to: trainer.email,
          subject: `New Message from ${user.full_name}`,
          body: `You have a new message from your client ${user.full_name}:\n\n"${text}"\n\nLog in to your EJT Fitness trainer portal to reply.`,
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }

      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
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

  if (!user?.assigned_trainer_id) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">MESSAGES</h1>
        </div>

        <Card className="bg-yellow-50 border-2 border-yellow-300">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-black italic text-[#1a1a1a] text-lg mb-2">No Clinician Assigned</h3>
            <p className="text-sm text-gray-600">
              You don't have a clinician assigned yet. Once a clinician is assigned to you, you'll be able to message them here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a]">MESSAGES</h1>
      </div>

      {/* Trainer Info Card */}
      {trainerLoading ? (
        <Skeleton className="h-24 rounded-lg bg-gray-100" />
      ) : trainer ? (
        <Card className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] border-none glow-blue">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40">
                {trainer.profile_photo_url ? (
                  <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/70 uppercase font-bold">Your Clinician</p>
                <h3 className="text-xl font-black italic text-white">{trainer.full_name}</h3>
                <p className="text-sm text-white/80">{trainer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Messages Container */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-0">
          {messagesLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg bg-gray-100" />)}
            </div>
          ) : (
            <div className="h-[450px] overflow-y-auto p-5 space-y-3">
              {messages.length > 0 ? (
                <>
                  {messages.map((msg) => {
                    const isClient = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isClient
                              ? 'bg-[#0ea5e9] text-white'
                              : 'bg-gray-100 text-[#1a1a1a]'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isClient ? 'text-white/70' : 'text-gray-500'
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
                  <p className="text-sm text-gray-400 mt-2">Send your clinician a message below</p>
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

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-sm text-gray-700 mb-2">💡 Messaging Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Your clinician receives email notifications when you send a message</li>
            <li>• Messages refresh automatically every 30 seconds</li>
            <li>• Use this to ask questions about your workout or nutrition plan</li>
            <li>• Share your progress updates and achievements!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}