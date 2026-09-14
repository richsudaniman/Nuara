import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Bell, CheckCheck, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MOCK_MESSAGE_CLIENTS, MOCK_MESSAGE_THREADS } from "@/lib/mockMessages";

export default function TrainerMessages() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('clientId');
  
  const [selectedClient, setSelectedClient] = useState(clientId || null);
  const [messageText, setMessageText] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  const { data: trainer } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['trainerAssignments', trainer?.id],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ trainer_id: trainer.id, is_active: true }),
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 15 * 60 * 1000,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['assignedClients', trainer?.id],
    queryFn: async () => {
      const clientIds = assignments.map(a => a.client_id);
      if (clientIds.length === 0) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => clientIds.includes(u.id));
    },
    initialData: [],
    enabled: !!trainer?.id && assignments.length > 0,
    staleTime: 15 * 60 * 1000,
  });

  const { data: allMessages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['allTrainerMessages', trainer?.id],
    queryFn: async () => {
      if (!trainer?.id) return [];
      const sent = await base44.entities.ChatMessage.filter({ sender_id: trainer.id });
      const received = await base44.entities.ChatMessage.filter({ receiver_id: trainer.id });
      return [...sent, ...received];
    },
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTrainerMessages'] });
      setMessageText("");
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      const message = await base44.entities.ChatMessage.create(data);
      
      // Send email notification
      const client = clients.find(c => c.id === data.receiver_id);
      if (client) {
        await base44.integrations.Core.SendEmail({
          from_name: 'EJT Fitness',
          to: client.email,
          subject: `🔔 Important Message from Your Clinician`,
          body: `Hi ${client.full_name},

Your clinician ${trainer.full_name} sent you an important message:

"${data.message}"

Please log in to the app to respond.

Best regards,
EJT Fitness Team`
        });
      }
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTrainerMessages'] });
      setNotificationText("");
      setShowNotificationForm(false);
    },
  });

  // Show a sample clinic inbox until the clinician has live threads
  const isDemo = !assignmentsLoading && !clientsLoading && clients.length === 0;
  const [demoThreads, setDemoThreads] = useState(MOCK_MESSAGE_THREADS);
  const displayClients = isDemo ? MOCK_MESSAGE_CLIENTS : clients;

  const client = displayClients.find(c => c.id === selectedClient);
  const clientMessages = !selectedClient ? [] : isDemo
    ? (demoThreads[selectedClient] || [])
    : allMessages.filter(msg =>
        (msg.sender_id === selectedClient && msg.receiver_id === trainer?.id) ||
        (msg.sender_id === trainer?.id && msg.receiver_id === selectedClient)
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const isMine = (msg) => (isDemo ? msg.sender_id === "me" : msg.sender_id === trainer?.id);

  const getUnreadCount = (clientId) => {
    if (isDemo) {
      return (demoThreads[clientId] || []).filter(msg => msg.sender_id !== "me" && !msg.is_read).length;
    }
    return allMessages.filter(msg => 
      msg.sender_id === clientId && 
      msg.receiver_id === trainer?.id && 
      !msg.is_read
    ).length;
  };

  const appendDemoMessage = (text, type) => {
    setDemoThreads(prev => ({
      ...prev,
      [selectedClient]: [
        ...(prev[selectedClient] || []),
        { id: `demo-${Date.now()}`, sender_id: "me", message: text, message_type: type, is_read: false, created_date: new Date().toISOString() },
      ],
    }));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedClient) return;

    if (isDemo) {
      appendDemoMessage(messageText.trim(), "text");
      setMessageText("");
      return;
    }
    if (!trainer?.id) return;

    await sendMessageMutation.mutateAsync({
      sender_id: trainer.id,
      receiver_id: selectedClient,
      message: messageText.trim(),
      message_type: "text",
      is_read: false
    });

    // Send email notification to client
    const client = clients.find(c => c.id === selectedClient);
    if (client) {
      try {
        await base44.integrations.Core.SendEmail({
          from_name: 'EJT Fitness',
          to: client.email,
          subject: `New Message from Your Clinician`,
          body: `Hi ${client.full_name},

Your clinician ${trainer.full_name} sent you a message:

"${messageText.trim()}"

Please log in to the app to respond.

Best regards,
EJT Fitness Team`
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim() || !selectedClient) return;

    if (isDemo) {
      appendDemoMessage(notificationText.trim(), "notification");
      setNotificationText("");
      setShowNotificationForm(false);
      return;
    }
    if (!trainer?.id) return;

    await sendNotificationMutation.mutateAsync({
      sender_id: trainer.id,
      receiver_id: selectedClient,
      message: notificationText.trim(),
      message_type: "notification",
      is_read: false
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchMessages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedClient && trainer?.id && !isDemo) {
      const unreadMessages = clientMessages.filter(msg => 
        msg.sender_id === selectedClient && 
        msg.receiver_id === trainer.id && 
        !msg.is_read
      );
      
      unreadMessages.forEach(async (msg) => {
        await base44.entities.ChatMessage.update(msg.id, { is_read: true });
      });
    }
  }, [selectedClient, clientMessages, trainer]);

  const isLoading = assignmentsLoading || clientsLoading;

  if (!selectedClient) {
    return (
      <div className="p-6 space-y-5 relative">
        <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">CLIENT MESSAGES</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
          </div>
        ) : displayClients.length > 0 ? (
          <div className="space-y-3">
            {displayClients.map(client => {
              const unreadCount = getUnreadCount(client.id);
              return (
                <Card 
                  key={client.id} 
                  className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors cursor-pointer"
                  onClick={() => setSelectedClient(client.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center relative">
                        {client.profile_photo_url ? (
                          <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-[#0ea5e9]" />
                        )}
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-black">{unreadCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black italic text-[#1a1a1a]">{client.full_name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        {unreadCount > 0 && (
                          <p className="text-xs text-red-600 font-bold mt-1">{unreadCount} new messages</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            No clients assigned yet
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#0ea5e9] p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSelectedClient(null)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {client && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
                {client.profile_photo_url ? (
                  <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-[#0ea5e9]" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-black italic text-[#1a1a1a]">{client.full_name}</h2>
                <p className="text-xs text-gray-500">Client</p>
              </div>
              <Button
                onClick={() => setShowNotificationForm(!showNotificationForm)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notify</span>
              </Button>
            </>
          )}
        </div>

        {/* Notification Form */}
        {showNotificationForm && (
          <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <h3 className="font-black italic text-purple-900 mb-2 text-sm">SEND NOTIFICATION</h3>
            <Textarea
              placeholder="Type important notification..."
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              className="bg-white border-purple-300 mb-2"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowNotificationForm(false);
                  setNotificationText("");
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={!notificationText.trim() || sendNotificationMutation.isPending}
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
            <p className="text-xs text-purple-700 mt-2">✉️ Client will receive an email notification</p>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ paddingBottom: '120px' }}>
        {messagesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg bg-gray-100" />)}
          </div>
        ) : clientMessages.length > 0 ? (
          clientMessages.map(msg => {
            const isSentByMe = isMine(msg);
            return (
              <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isSentByMe ? 'bg-[#0ea5e9] text-white' : 'bg-gray-100 text-[#1a1a1a]'} rounded-2xl p-3`}>
                  {msg.message_type === 'notification' && (
                    <div className="flex items-center gap-1 mb-1 opacity-80">
                      <Bell className="w-3 h-3" />
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
            No messages yet. Start the conversation!
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