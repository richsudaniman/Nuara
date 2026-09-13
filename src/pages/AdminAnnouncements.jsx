import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, Send, Users, Award, Globe, Trash2, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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

      try {
        const response = await base44.functions.invoke('sendAnnouncement', {
          announcementId: announcement.id,
          title: data.title,
          message: data.message,
          targetAudience: data.target_audience,
        });
        return { announcement, emailResult: response.data };
      } catch (error) {
        // Even if email fails, announcement is created
        return { announcement, emailResult: { error: "Email sending failed" } };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setResult({ 
        success: true, 
        message: `Announcement posted successfully!` 
      });
      resetForm();
      setShowForm(false);
      setTimeout(() => setResult(null), 5000);
    },
    onError: (error) => {
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send announcement' 
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
    if (priority === 'urgent') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AdminDashboard")}>
             <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
             </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">Send platform-wide messages and updates</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold shadow-sm rounded-lg h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none shadow-md text-white">
          <CardContent className="p-6">
            <Megaphone className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="font-bold text-lg mb-1">Total Announcements</h3>
            <p className="text-3xl font-black">{announcements.length}</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 bg-white border-none shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
             <div className="p-3 bg-blue-50 rounded-lg text-[#0ea5e9]">
                <Globe className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-bold text-gray-900 mb-1">Communication Hub</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Send important updates to all users, specific groups (clinicians or clients), 
                  or schedule messages. Recipients will receive email notifications and see 
                  announcements on their dashboard.
                </p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Message */}
      {result && (
        <Card className={`border-none shadow-sm ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        {showForm && (
          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden sticky top-6">
               <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Create New</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-8 w-8 p-0 rounded-full">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
               </div>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Title *</label>
                    <Input
                      placeholder="Announcement title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Message *</label>
                    <Textarea
                      placeholder="Type your announcement message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white border-gray-200 h-32 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Target Audience *</label>
                    <Select 
                        value={formData.target_audience} 
                        onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                    >
                        <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">
                            All Users ({getAudienceCount('all')})
                        </SelectItem>
                        <SelectItem value="trainers">
                            Clinicians Only ({getAudienceCount('trainers')})
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
                        <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={createAnnouncementMutation.isPending}
                    className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold mt-2"
                  >
                    {createAnnouncementMutation.isPending ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         Sending...
                       </>
                    ) : (
                       <>
                         <Send className="w-4 h-4 mr-2" />
                         Post Announcement
                       </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List Section */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Recent History</h3>
            </div>
            
            {isLoading ? (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-gray-100" />)}
            </div>
            ) : announcements.length > 0 ? (
            <div className="space-y-3">
                {announcements.map(announcement => {
                const AudienceIcon = getAudienceIcon(announcement.target_audience);
                
                return (
                    <Card key={announcement.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all rounded-xl group">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getPriorityColor(announcement.priority)}`}>
                                    {announcement.priority}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    {format(new Date(announcement.sent_at), 'MMM d, yyyy • h:mm a')}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{announcement.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{announcement.message}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 inline-flex px-2 py-1 rounded-lg">
                                <AudienceIcon className="w-3.5 h-3.5" />
                                <span className="font-semibold capitalize">Sent to: {announcement.target_audience}</span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(announcement.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
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
                <h3 className="font-bold text-gray-900 mb-1">No Announcements</h3>
                <p className="text-sm text-gray-500">Create your first announcement to reach your users.</p>
                <Button 
                    variant="link" 
                    className="text-[#0ea5e9] font-bold mt-2"
                    onClick={() => setShowForm(true)}
                >
                    Create Announcement
                </Button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}