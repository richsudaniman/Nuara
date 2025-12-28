import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, Send, Users, Award, Globe, Trash2, Edit, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_audience: "all",
    scheduled_date: "",
    priority: "normal",
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => base44.entities.Announcement.list('-created_date'),
    initialData: [],
  });

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data) => {
      const announcement = await base44.entities.Announcement.create({
        ...data,
        created_by_admin_id: user.id,
        is_active: true,
        sent_at: new Date().toISOString(),
      });

      // Send emails to targeted users
      const response = await base44.functions.invoke('sendAnnouncement', {
        announcementId: announcement.id,
        title: data.title,
        message: data.message,
        targetAudience: data.target_audience,
      });

      return { announcement, emailResult: response.data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setResult({ 
        success: true, 
        message: `Announcement sent successfully! ${data.emailResult.emailsSent} emails delivered.` 
      });
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      setResult({ 
        success: false, 
        message: error.response?.data?.error || 'Failed to send announcement' 
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      target_audience: "all",
      scheduled_date: "",
      priority: "normal",
    });
    setEditingAnnouncement(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    await createAnnouncementMutation.mutateAsync(formData);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this announcement?')) {
      await deleteAnnouncementMutation.mutateAsync(id);
    }
  };

  const getAudienceCount = (targetAudience) => {
    if (targetAudience === 'all') return allUsers.length;
    if (targetAudience === 'trainers') return allUsers.filter(u => u.role === 'trainer').length;
    if (targetAudience === 'clients') return allUsers.filter(u => u.role === 'user' || !u.role).length;
    return 0;
  };

  const getAudienceIcon = (targetAudience) => {
    if (targetAudience === 'all') return Globe;
    if (targetAudience === 'trainers') return Award;
    return Users;
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'bg-red-100 text-red-700 border-red-300';
    if (priority === 'high') return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">ANNOUNCEMENTS</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic gap-2"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-black italic text-[#1a1a1a] mb-2">📢 Communication Hub</h3>
          <p className="text-sm text-gray-700">
            Send platform-wide announcements to all users, specific groups (trainers or clients), 
            or schedule messages for future delivery. All recipients will receive email notifications.
          </p>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
        <Card className={`border-2 ${result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Success!' : 'Error'}
                </p>
                <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcement Form */}
      {showForm && (
        <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-[#1a1a1a] text-lg">CREATE ANNOUNCEMENT</h3>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  ✕
                </Button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Title *</label>
                <Input
                  placeholder="Announcement title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Message *</label>
                <Textarea
                  placeholder="Type your announcement message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-300 h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Target Audience *</label>
                  <Select 
                    value={formData.target_audience} 
                    onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Users ({getAudienceCount('all')})
                      </SelectItem>
                      <SelectItem value="trainers">
                        Trainers Only ({getAudienceCount('trainers')})
                      </SelectItem>
                      <SelectItem value="clients">
                        Clients Only ({getAudienceCount('clients')})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Priority</label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createAnnouncementMutation.isPending}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic glow-blue gap-2"
              >
                <Send className="w-4 h-4" />
                {createAnnouncementMutation.isPending ? 'Sending...' : 'Send Announcement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div>
        <h3 className="font-black italic text-gray-600 text-sm uppercase mb-3">Recent Announcements</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map(announcement => {
              const AudienceIcon = getAudienceIcon(announcement.target_audience);
              
              return (
                <Card key={announcement.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-black italic text-[#1a1a1a] text-lg">{announcement.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{announcement.message}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <AudienceIcon className="w-4 h-4" />
                            <span className="font-semibold capitalize">{announcement.target_audience}</span>
                          </div>
                          <span>•</span>
                          <span>{format(new Date(announcement.sent_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            No announcements yet. Create your first announcement above.
          </div>
        )}
      </div>
    </div>
  );
}