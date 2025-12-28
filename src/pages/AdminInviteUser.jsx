
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
        setSuccessMessage(""); // Clear success message if there's a warning
      } else {
        setSuccessMessage(data.message || 'User invited successfully!');
        setErrorMessage(""); // Clear error message on success
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
      
      // Clear messages after 5 seconds
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
        if (errorData.serverResponse) {
          console.error('Server response:', errorData.serverResponse);
          errorMsg += ' (Check console for details)';
        }
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

    // Validation
    if (!formData.email || !formData.full_name) {
      setErrorMessage("Email and full name are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // For clients, require trainer assignment
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
    
    // Add bio based on role
    if (formData.role === 'trainer' && formData.bio) submitData.bio = formData.bio.trim();
    if (formData.role === 'user' && formData.bio) submitData.notes = formData.bio.trim(); // Client notes are stored as 'notes'

    // Add trainer-specific fields
    if (formData.role === 'trainer') {
      if (formData.specialties) {
        submitData.specialties = formData.specialties.trim();
      }
      console.log('Creating trainer with specialties:', submitData.specialties);
    }
    
    // Add client-specific fields
    if (formData.role === 'user' && formData.assigned_trainer_id) {
      submitData.assigned_trainer_id = formData.assigned_trainer_id;
    }

    console.log('Submitting user data:', submitData);
    await inviteUserMutation.mutateAsync(submitData);
  };

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      {/* Back Button */}
      <Link to={createPageUrl("AdminDashboard")}>
        <Button variant="ghost" className="gap-2 text-gray-600 hover:text-[#0ea5e9]">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">INVITE NEW USER</h1>
          <p className="text-sm text-gray-600 italic">Add trainers or clients to your platform</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="bg-green-50 border-2 border-green-500">
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
        <Card className="bg-red-50 border-2 border-red-500">
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

      {/* Invite Form */}
      <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                User Role *
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Client</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'trainer' && "Trainers can manage clients, create plans, and upload videos"}
                {formData.role === 'user' && "Clients follow workout and nutrition plans from their trainer"}
                {formData.role === 'admin' && "Admins have full platform access"}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Full Name *
              </label>
              <Input
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-white border-gray-300"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                User will receive a welcome email with login instructions
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>

            {/* Trainer-specific fields */}
            {formData.role === 'trainer' && (
              <>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Specialties
                  </label>
                  <Input
                    placeholder="e.g., Strength Training, Weight Loss, Nutrition"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the trainer's areas of expertise (optional)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Bio / About
                  </label>
                  <Textarea
                    placeholder="Tell clients about this trainer's experience and expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white border-gray-300 h-24"
                  />
                </div>
              </>
            )}

            {/* Client-specific fields */}
            {formData.role === 'user' && (
              <>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Assign to Trainer *
                  </label>
                  <Select
                    value={formData.assigned_trainer_id}
                    onValueChange={(value) => setFormData({ ...formData, assigned_trainer_id: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
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
                  <p className="text-xs text-gray-500 mt-1">
                    {trainers.length === 0 ? (
                      <span className="text-orange-600">⚠️ Please invite trainers first before adding clients</span>
                    ) : (
                      "Trainer will be notified via email about the new client"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any special notes about this client..."
                    value={formData.bio} // Re-using bio field for client notes
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white border-gray-300 h-20"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={inviteUserMutation.isPending}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic py-6 text-lg glow-blue-intense"
            >
              {inviteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] mb-3">💡 TIPS</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-[#0ea5e9] font-bold">•</span>
              <span>Invited users will receive an email with login instructions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0ea5e9] font-bold">•</span>
              <span>Trainers are notified when clients are assigned to them</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0ea5e9] font-bold">•</span>
              <span>You can update user roles later from the Users page</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#0ea5e9] font-bold">•</span>
              <span>Clients must be assigned to a trainer to access workout plans</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] mb-3">AFTER INVITING</h3>
          <div className="space-y-2">
            <Link to={createPageUrl("AdminUsers")}>
              <Button variant="outline" className="w-full justify-start">
                → View All Users
              </Button>
            </Link>
            <Link to={createPageUrl("AdminTrainers")}>
              <Button variant="outline" className="w-full justify-start">
                → Manage Trainers
              </Button>
            </Link>
            <Link to={createPageUrl("AdminClientAssignments")}>
              <Button variant="outline" className="w-full justify-start">
                → Manage Client Assignments
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
