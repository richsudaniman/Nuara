import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, Send, Users, Award, Globe, Trash2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_audience: "all",
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
      setTimeout(() => setResult(null), 5000);
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
      priority: "normal",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    await createAnnouncementMutation.mutateAsync(formData);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
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
    if (priority === 'urgent') return 'bg-red-50 text-red-700 border-red-200';
    if (priority === 'high') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Link to={createPageUrl("AdminDashboard")}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 -ml-2">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            </div>
            <p className="text-sm text-gray-500">Send platform-wide alerts and messages</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold shadow-sm rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Result Message */}
      {result && (
        <Card className={`border-none shadow-sm rounded-xl ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold text-sm ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Success' : 'Error'}
                </p>
                <p className={`text-xs mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcement Form */}
      {showForm && (
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Create Announcement</h3>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Title *</label>
                <Input
                  placeholder="Announcement title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-50 border-gray-200 h-11"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Message *</label>
                <Textarea
                  placeholder="Type your announcement message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-gray-50 border-gray-200 h-32 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Target Audience *</label>
                  <Select 
                    value={formData.target_audience} 
                    onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
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
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Priority</label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
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

              <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={createAnnouncementMutation.isPending}
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold px-8 h-11 rounded-lg shadow-sm"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {createAnnouncementMutation.isPending ? 'Sending...' : 'Send Announcement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-gray-100" />)}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map(announcement => {
              const AudienceIcon = getAudienceIcon(announcement.target_audience);
              
              return (
                <Card key={announcement.id} className="bg-white border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{announcement.title}</h3>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{announcement.message}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                            <AudienceIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span className="font-semibold text-gray-600 capitalize">{announcement.target_audience}</span>
                          </div>
                          <span>Sent on {format(new Date(announcement.sent_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(announcement.id, e)}
                        className="text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 transition-colors"
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
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Megaphone className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No Announcements Yet</h3>
            <p className="text-gray-500 text-sm">Create your first announcement to reach your users.</p>
          </div>
        )}
      </div>
    </div>
  );
}