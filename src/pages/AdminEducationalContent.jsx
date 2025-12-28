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
                <h1 className="text-2xl font-bold text-gray-900">Educational Content</h1>
            </div>
            <p className="text-sm text-gray-500">Manage learning materials and tutorials</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold shadow-sm rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Content
        </Button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden relative z-10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Upload Content</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="rounded-full h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Title *</label>
                <Input
                  placeholder="Tutorial or lesson name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-50 border-gray-200 h-11"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Description</label>
                <Textarea
                  placeholder="What does this content teach?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-50 border-gray-200 h-24 resize-none"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Category</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={uploading}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="bg-gray-50 border-gray-200 h-11"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Difficulty Level</label>
                <Select 
                  value={formData.difficulty_level} 
                  onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  disabled={uploading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
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
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0ea5e9] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <label className="cursor-pointer block w-full h-full">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading || !formData.title.trim()}
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {uploading ? 'Uploading...' : 'Click to select video file'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Max size: 500MB • Formats: MP4, MOV, AVI
                  </p>
                  {!formData.title.trim() && (
                    <p className="text-xs text-orange-500 mt-2 font-semibold">Please enter a title first</p>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search educational content by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-50 border-transparent focus:bg-white focus:border-[#0ea5e9] h-11 rounded-lg transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />)}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <Card 
              key={video.id} 
              className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer group flex flex-col h-full"
              onClick={() => setSelectedVideo(video)}
            >
                <div className="aspect-video bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                    {video.video_url ? (
                      <video 
                        src={video.video_url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Play className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 text-[#0ea5e9] ml-1" />
                      </div>
                    </div>
                    {video.duration_minutes > 0 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-medium text-white">
                        {video.duration_minutes}m
                      </div>
                    )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{video.title}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0ea5e9] rounded-md flex-shrink-0">
                            {video.category}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{video.description}</p>
                    
                     <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                         {video.difficulty_level && (
                            <span className="capitalize px-2 py-0.5 bg-gray-50 rounded-md font-medium text-gray-600">
                                {video.difficulty_level}
                            </span>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-300 hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(video.id);
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <GraduationCap className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No Content Found</h3>
            <p className="text-gray-500 text-sm">Upload educational videos to build your library.</p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="relative bg-black aspect-video flex-shrink-0">
                    <button 
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <video 
                        src={selectedVideo.video_url} 
                        controls 
                        autoPlay
                        className="w-full h-full"
                    />
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#0ea5e9] rounded-md">
                            {selectedVideo.category}
                        </span>
                        {selectedVideo.difficulty_level && (
                             <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">
                                {selectedVideo.difficulty_level}
                            </span>
                        )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                         <Button
                            variant="destructive"
                            onClick={() => {
                                if(confirm('Delete this video?')) {
                                    deleteVideoMutation.mutate(selectedVideo.id);
                                }
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Content
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}