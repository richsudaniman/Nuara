import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Plus, Upload, X, Play, Search, Clock, Trash2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminEducationalContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "education",
    difficulty_level: "beginner",
    duration_minutes: 0,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: educationalVideos, isLoading } = useQuery({
    queryKey: ['educationalVideos'],
    queryFn: async () => {
      const allVideos = await base44.entities.ExerciseVideo.list('-created_date');
      return allVideos.filter(v => v.category === 'education' || v.category === 'tutorial');
    },
    initialData: [],
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.ExerciseVideo.create({
        ...data,
        uploaded_by_trainer_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalVideos'] });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "education",
        difficulty_level: "beginner",
        duration_minutes: 0,
      });
      setUploadProgress(0);
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => base44.entities.ExerciseVideo.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalVideos'] });
      setSelectedVideo(null);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      e.target.value = '';
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 500MB');
      e.target.value = '';
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title first');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadProgress(70);
      await uploadVideoMutation.mutateAsync({
        ...formData,
        video_url: file_url,
      });
      
      setUploadProgress(100);
      alert('Educational content uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading video: ' + error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (videoId) => {
    if (confirm('Are you sure you want to delete this educational content?')) {
      await deleteVideoMutation.mutateAsync(videoId);
    }
  };

  const filteredVideos = educationalVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <Link to={createPageUrl("AdminDashboard")}>
        <Button variant="ghost" className="gap-2 text-gray-600 hover:text-[#0ea5e9]">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">EDUCATIONAL CONTENT</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black italic text-[#1a1a1a] text-lg">UPLOAD EDUCATIONAL CONTENT</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Title *</label>
                <Input
                  placeholder="Tutorial or lesson name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-gray-300"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Description</label>
                <Textarea
                  placeholder="What does this content teach?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 h-20"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Category</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={uploading}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="bg-white border-gray-300"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Difficulty Level</label>
                <Select 
                  value={formData.difficulty_level} 
                  onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  disabled={uploading}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-semibold">Uploading...</span>
                    <span className="text-[#0ea5e9] font-black">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0ea5e9] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading || !formData.title.trim()}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    {uploading ? 'Uploading...' : 'Click to select video file'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Max size: 500MB • Formats: MP4, MOV, AVI, etc.
                  </p>
                  {!formData.title.trim() && (
                    <p className="text-xs text-red-500 mt-2">Please enter a title first</p>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search educational content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid gap-3">
          {filteredVideos.map(video => (
            <Card 
              key={video.id} 
              className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <CardContent className="p-0">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    {video.video_url ? (
                      <video 
                        src={video.video_url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-[#0ea5e9]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <h3 className="font-black italic text-[#1a1a1a] text-lg mb-1">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {video.duration_minutes > 0 && (
                        <span className="text-xs text-gray-500 font-semibold">{video.duration_minutes} min</span>
                      )}
                      <span className="px-2 py-0.5 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full">
                        {video.category}
                      </span>
                      {video.difficulty_level && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                          {video.difficulty_level}
                        </span>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          {searchQuery ? "No content found matching your search" : "No educational content uploaded yet. Click 'Upload' to add one."}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-white z-50 overflow-y-auto"
          style={{ paddingBottom: '80px' }}
        >
          <button 
            onClick={() => setSelectedVideo(null)}
            className="fixed top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black">
            <video 
              src={selectedVideo.video_url} 
              controls 
              autoPlay
              loop
              playsInline
              className="w-full"
              style={{ maxHeight: '45vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xl font-black italic text-[#1a1a1a] mb-2">{selectedVideo.title}</h2>
              
              <div className="flex items-center gap-2 flex-wrap">
                {selectedVideo.duration_minutes > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                    <Clock className="w-3 h-3 text-[#0ea5e9]" />
                    <span className="text-xs font-bold text-gray-700">{selectedVideo.duration_minutes} min</span>
                  </div>
                )}
                <span className="px-2 py-1 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full">
                  {selectedVideo.category}
                </span>
                {selectedVideo.difficulty_level && (
                  <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                    {selectedVideo.difficulty_level}
                  </span>
                )}
              </div>
            </div>

            {selectedVideo.description && (
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#0ea5e9]"></div>
                  <h3 className="font-black italic text-[#1a1a1a] uppercase text-sm">Description</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                onClick={() => setSelectedVideo(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-black italic py-6"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDelete(selectedVideo.id)}
                disabled={deleteVideoMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic py-6"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}