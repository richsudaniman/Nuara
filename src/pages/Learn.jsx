import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Search, Play, Clock, X, Filter, Gamepad2, Star } from "lucide-react";
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
    <div className="p-5 space-y-5 bg-gradient-to-b from-pink-50/30 via-purple-50/20 to-white min-h-screen relative overscroll-contain touch-pan-y">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
          <Gamepad2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Extra Practice & Games</h1>
          <p className="text-xs text-gray-500">Boost your skills and earn points!</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search practice activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-purple-200 rounded-xl"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full bg-white border-purple-200 rounded-xl pl-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="articulation">Articulation</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="fluency">Fluency</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="phonology">Phonology</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
              className="bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-lg shadow-sm rounded-2xl transition-all cursor-pointer overflow-hidden group"
              onClick={() => setSelectedVideo(video)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                  <div className="w-full sm:w-40 h-48 sm:h-auto bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0 relative overflow-hidden">
                    {video.video_url ? (
                      <video 
                        src={video.video_url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-10 h-10 text-purple-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-7 h-7 text-white fill-current" />
                      </div>
                    </div>
                    {/* Points Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 text-white fill-white" />
                      <span className="text-[10px] font-black text-white">+{video.duration_minutes || 10}</span>
                    </div>
                  </div>

                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2 mb-2">
                       <span className="px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 rounded-lg uppercase tracking-wider">
                        {video.category}
                      </span>
                      {video.difficulty_level && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {video.difficulty_level}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-[#1e293b] text-lg mb-2 leading-tight">{video.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{video.description}</p>
                    
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-purple-600 text-xs font-bold uppercase tracking-wider group-hover:underline">
                        Start Practice
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-600">+{video.duration_minutes || 10} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Gamepad2}
          title={searchQuery ? "No Activities Found" : "No Practice Activities Yet"}
          description={searchQuery ? "Try adjusting your search or filters" : "Extra practice games and activities will appear here soon. Check back later!"}
          variant="info"
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
           <div className="h-full flex flex-col bg-white sm:max-w-4xl sm:mx-auto sm:h-auto sm:my-10 sm:rounded-2xl overflow-hidden relative">
             {/* Close Button */}
             <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>

             {/* Video Container */}
            <div className="w-full bg-black relative aspect-video flex-shrink-0">
              <video 
                src={selectedVideo.video_url} 
                controls 
                autoPlay
                playsInline
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-50/50 to-white">
               <div className="flex items-center gap-3 mb-4 flex-wrap">
                 <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg uppercase tracking-wider shadow-md shadow-purple-200">
                    {selectedVideo.category}
                  </span>
                  {selectedVideo.difficulty_level && (
                    <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">
                      {selectedVideo.difficulty_level}
                    </span>
                  )}
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-xs font-black text-white">+{selectedVideo.duration_minutes || 10} Points</span>
                  </div>
               </div>

              <h2 className="text-2xl font-bold text-[#1e293b] mb-4 leading-tight">{selectedVideo.title}</h2>
              
              {selectedVideo.description && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedVideo.description}</p>
                </div>
              )}

              {selectedVideo.notes && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-gray-700">{selectedVideo.notes}</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <p className="text-sm font-bold text-gray-700">Complete this activity to earn <span className="text-yellow-600">+{selectedVideo.duration_minutes || 10} points</span> and level up!</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-100 flex justify-end">
                <Button
                  onClick={() => setSelectedVideo(null)}
                  variant="outline"
                  className="font-bold border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Close
                </Button>
              </div>
            </div>
           </div>
        </div>
      )}
    </div>
  );
}