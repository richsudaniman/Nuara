import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import EmptyState from "../components/EmptyState";

export default function Messages() {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: trainer } = useQuery({
    queryKey: ['trainer', user?.assigned_trainer_id],
    queryFn: async () => {
      if (!user?.assigned_trainer_id) return null;
      const trainers = await base44.entities.User.filter({ id: user.assigned_trainer_id });
      return trainers[0] || null;
    },
    enabled: !!user?.assigned_trainer_id,
    staleTime: 30 * 60 * 1000,
  });

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', user?.id, trainer?.id],
    queryFn: async () => {
      if (!user?.id || !trainer?.id) return [];
      const sent = await base44.entities.ChatMessage.filter({ 
        sender_id: user.id, 
        receiver_id: trainer.id 
      });
      const received = await base44.entities.ChatMessage.filter({ 
        sender_id: trainer.id, 
        receiver_id: user.id 
      });
      
      // Mark received messages as read
      const unreadMessages = received.filter(m => !m.is_read);
      for (const msg of unreadMessages) {
        await base44.entities.ChatMessage.update(msg.id, { is_read: true });
      }
      
      return [...sent, ...received].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
    initialData: [],
    enabled: !!user?.id && !!trainer?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user?.id || !trainer?.id) return;

    await sendMessageMutation.mutateAsync({
      sender_id: user.id,
      receiver_id: trainer.id,
      message: messageText.trim(),
      message_type: "text",
      is_read: false
    });

    // Send email notification to trainer
    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'EJT Fitness',
        to: trainer.email,
        subject: `New Message from ${user.full_name}`,
        body: `Hi ${trainer.full_name},

You have a new message from your client ${user.full_name}:

"${messageText.trim()}"

Please log in to the trainer portal to reply.

Best regards,
EJT Fitness Team`
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 30000);
    setAutoRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refetchMessages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!trainer) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MessageCircle}
          title="No Trainer Assigned"
          description="You need to be assigned to a trainer before you can send messages."
          variant="info"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#0ea5e9] p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
            {trainer.profile_photo_url ? (
              <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-[#0ea5e9]" />
            )}
          </div>
          <div>
            <h2 className="font-black italic text-[#1a1a1a]">{trainer.full_name}</h2>
            <p className="text-xs text-gray-500">Your Trainer</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ paddingBottom: '120px' }}>
        {messagesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg bg-gray-100" />)}
          </div>
        ) : messages.length > 0 ? (
          messages.map(msg => {
            const isSentByMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isSentByMe ? 'bg-[#0ea5e9] text-white' : 'bg-gray-100 text-[#1a1a1a]'} rounded-2xl p-3`}>
                  {msg.message_type === 'notification' && (
                    <div className="flex items-center gap-1 mb-1 opacity-80">
                      <MessageCircle className="w-3 h-3" />
                      <span className="text-xs font-bold">Notification</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${isSentByMe ? 'text-white/70' : 'text-gray-500'}`}>
                    <span>{format(new Date(msg.created_date), 'h:mm a')}</span>
                    {isSentByMe && msg.is_read && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            No messages yet. Send a message to start the conversation!
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex gap-3">
          <Textarea
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-50 border-gray-300 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white self-end"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}