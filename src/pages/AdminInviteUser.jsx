import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
      console.log('Sending invitation with data:', userData);
      try {
        const response = await base44.functions.invoke('inviteUser', userData);
        console.log('Invitation response:', response);
        return response.data;
      } catch (error) {
        console.error('Function invoke error:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Invitation successful:', data);
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
      console.error("Invite error:", error);
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
          <div className="flex items-center gap-2 mb-1">
             <Link to={createPageUrl("AdminDashboard")}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 -ml-2">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Invite New User</h1>
          </div>
          <p className="text-sm text-gray-500">Add trainers or clients to your platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <Card className="bg-green-50 border-none shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-bold">{successMessage}</p>
                      <p className="text-sm mt-1">Welcome email has been sent to the user.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Card className="bg-red-50 border-none shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-red-800">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Error</p>
                      <p className="text-sm mt-1">{errorMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                        User Role *
                    </label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                        <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="user">Client</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-2">
                        {formData.role === 'trainer' && "Trainers can manage clients, create plans, and upload videos"}
                        {formData.role === 'user' && "Clients follow workout and nutrition plans from their trainer"}
                        {formData.role === 'admin' && "Admins have full platform access"}
                    </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Full Name *
                        </label>
                        <Input
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-11"
                            required
                        />
                        </div>

                        {/* Email */}
                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Email Address *
                        </label>
                        <Input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-11"
                            required
                        />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                        Phone Number
                    </label>
                    <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-gray-50 border-gray-200 h-11"
                    />
                    </div>

                    {/* Trainer-specific fields */}
                    {formData.role === 'trainer' && (
                    <>
                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Specialties
                        </label>
                        <Input
                            placeholder="e.g., Strength Training, Weight Loss, Nutrition"
                            value={formData.specialties}
                            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-11"
                        />
                        </div>

                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Bio / About
                        </label>
                        <Textarea
                            placeholder="Tell clients about this trainer's experience and expertise..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-32 resize-none"
                        />
                        </div>
                    </>
                    )}

                    {/* Client-specific fields */}
                    {formData.role === 'user' && (
                    <>
                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Assign to Trainer *
                        </label>
                        <Select
                            value={formData.assigned_trainer_id}
                            onValueChange={(value) => setFormData({ ...formData, assigned_trainer_id: value })}
                        >
                            <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                            <SelectValue placeholder="Select a trainer..." />
                            </SelectTrigger>
                            <SelectContent>
                            {trainers.length > 0 ? (
                                trainers.map(trainer => (
                                <SelectItem key={trainer.id} value={trainer.id}>
                                    {trainer.full_name || trainer.email}
                                </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No trainers available</SelectItem>
                            )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-400 mt-2">
                            {trainers.length === 0 ? (
                            <span className="text-orange-600">⚠️ Please invite trainers first before adding clients</span>
                            ) : (
                            "Trainer will be notified via email about the new client"
                            )}
                        </p>
                        </div>

                        <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                            Notes (Optional)
                        </label>
                        <Textarea
                            placeholder="Any special notes about this client..."
                            value={formData.bio} // Re-using bio field for client notes
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-gray-50 border-gray-200 h-32 resize-none"
                        />
                        </div>
                    </>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button
                        type="submit"
                        disabled={inviteUserMutation.isPending}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold px-8 h-11 rounded-lg shadow-sm"
                        >
                        {inviteUserMutation.isPending ? (
                            <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Invitation...
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

        {/* Sidebar Info */}
        <div className="space-y-6">
             {/* Help Section */}
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        💡 Quick Tips
                    </h3>
                </div>
                <CardContent className="p-6">
                <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                    <span>Invited users will receive an email with login instructions instantly.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">2</span>
                    <span>Trainers are automatically notified when new clients are assigned to them.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">3</span>
                    <span>You can update user roles and assignments later from the Users page.</span>
                    </li>
                </ul>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        <Link to={createPageUrl("AdminUsers")} className="block p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">View All Users</span>
                                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                            </div>
                        </Link>
                        <Link to={createPageUrl("AdminTrainers")} className="block p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Manage Trainers</span>
                                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                            </div>
                        </Link>
                        <Link to={createPageUrl("AdminClientAssignments")} className="block p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Manage Assignments</span>
                                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}