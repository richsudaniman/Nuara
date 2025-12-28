import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lightbulb, Link as LinkIcon, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminInviteUser() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "user",
    phone: "",
    bio: "",
    specialties: "",
    assigned_trainer_id: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: trainers } = useQuery({
    queryKey: ['allTrainers'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.user_type === 'trainer');
    },
    initialData: [],
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await base44.functions.invoke('inviteUser', userData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.warning) {
        setErrorMessage(data.warning);
        setSuccessMessage("");
      } else {
        setSuccessMessage(data.message || 'User invited successfully!');
        setErrorMessage("");
      }
      setFormData({
        email: "",
        full_name: "",
        role: "user",
        phone: "",
        bio: "",
        specialties: "",
        assigned_trainer_id: "",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allTrainers'] });
      
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMsg = 'Failed to invite user';
      
      if (errorData) {
        if (errorData.error) errorMsg = errorData.error;
        if (errorData.details) errorMsg += ': ' + errorData.details;
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setSuccessMessage("");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.email || !formData.full_name) {
      setErrorMessage("Email and full name are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (formData.role === 'user' && !formData.assigned_trainer_id) {
      setErrorMessage("Clients must be assigned to a trainer. Please select a trainer or create one first.");
      return;
    }

    const submitData = {
      email: formData.email.trim(),
      full_name: formData.full_name.trim(),
      role: formData.role,
    };

    if (formData.phone) submitData.phone = formData.phone.trim();
    
    if (formData.role === 'trainer' && formData.bio) submitData.bio = formData.bio.trim();
    if (formData.role === 'user' && formData.bio) submitData.notes = formData.bio.trim();

    if (formData.role === 'trainer' && formData.specialties) {
      submitData.specialties = formData.specialties.trim();
    }
    
    if (formData.role === 'user' && formData.assigned_trainer_id) {
      submitData.assigned_trainer_id = formData.assigned_trainer_id;
    }

    await inviteUserMutation.mutateAsync(submitData);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite New User</h1>
          <p className="text-sm text-gray-500 mt-1">Add trainers, clients, or administrators to the platform</p>
        </div>
        <Link to={createPageUrl("AdminDashboard")}>
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg text-[#0ea5e9]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invitation Details</h3>
                  <p className="text-sm text-gray-500">Enter user information to send an invite</p>
                </div>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">{successMessage}</p>
                    <p className="text-xs text-green-600 mt-1">The user has been notified via email.</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Error</p>
                    <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Client</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-gray-400">
                      {formData.role === 'trainer' && "Can manage clients and create plans"}
                      {formData.role === 'user' && "Follows plans assigned by a trainer"}
                      {formData.role === 'admin' && "Has full system access"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-white border-gray-200 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white border-gray-200 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white border-gray-200 h-10"
                    />
                  </div>
                </div>

                {formData.role === 'trainer' && (
                  <div className="space-y-6 pt-4 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Specialties</label>
                      <Input
                        placeholder="e.g. Weight Loss, Strength, HIIT"
                        value={formData.specialties}
                        onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                        className="bg-white border-gray-200 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Bio / About</label>
                      <Textarea
                        placeholder="Trainer's background and expertise..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-white border-gray-200 min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'user' && (
                  <div className="space-y-6 pt-4 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Assign Trainer</label>
                      <Select
                        value={formData.assigned_trainer_id}
                        onValueChange={(value) => setFormData({ ...formData, assigned_trainer_id: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-200 h-10">
                          <SelectValue placeholder="Select a trainer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {trainers.map(trainer => (
                            <SelectItem key={trainer.id} value={trainer.id}>
                              {trainer.full_name || trainer.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {trainers.length === 0 && (
                        <p className="text-xs text-orange-500 font-medium mt-1">
                          No trainers available. Please invite a trainer first.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Client Notes</label>
                      <Textarea
                        placeholder="Initial notes or requirements for this client..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-white border-gray-200 min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={inviteUserMutation.isPending}
                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold px-8 h-11"
                  >
                    {inviteUserMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Help Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-md rounded-xl overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lightbulb className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Quick Tips
                </h3>
                <ul className="space-y-3 text-sm text-indigo-100">
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>Invited users receive an email with login credentials.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>Trainers are automatically notified when a new client is assigned.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>You can modify user roles and permissions anytime from the Users page.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                Management Links
              </h3>
              <div className="space-y-2">
                <Link to={createPageUrl("AdminUsers")}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-[#0ea5e9] hover:bg-blue-50">
                    <Users className="w-4 h-4 mr-2" />
                    View All Users
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminTrainers")}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-purple-600 hover:bg-purple-50">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Trainers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}