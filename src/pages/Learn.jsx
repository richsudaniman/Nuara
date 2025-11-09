import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Search, Play, Clock, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: async () => {
      const allVideos = await base44.entities.ExerciseVideo.list('-created_date');
      return allVideos;
    },
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a]">LEARN & GROW</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="chest">Chest</SelectItem>
            <SelectItem value="back">Back</SelectItem>
            <SelectItem value="legs">Legs</SelectItem>
            <SelectItem value="shoulders">Shoulders</SelectItem>
            <SelectItem value="arms">Arms</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="mobility">Mobility</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
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
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">{video.duration_minutes} min</span>
                        </div>
                      )}
                      <span className="px-2 py-0.5 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full capitalize">
                        {video.category}
                      </span>
                      {video.difficulty_level && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full capitalize">
                          {video.difficulty_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title={searchQuery ? "No Videos Found" : "No Videos Yet"}
          description={searchQuery ? "Try adjusting your search or filters" : "Check back soon for exercise videos and educational content from your trainers!"}
          variant="info"
        />
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
                <span className="px-2 py-1 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full capitalize">
                  {selectedVideo.category}
                </span>
                {selectedVideo.difficulty_level && (
                  <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full capitalize">
                    {selectedVideo.difficulty_level}
                  </span>
                )}
              </div>
            </div>

            {selectedVideo.description && (
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#0ea5e9]"></div>
                  <h3 className="font-black italic text-[#1a1a1a] uppercase text-sm">About This Video</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => setSelectedVideo(null)}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic text-base py-6 glow-blue"
              >
                Back to Videos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}