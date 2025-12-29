import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Calendar, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import EmptyState from "../EmptyState";
import { base44 } from "@/api/base44Client";

export default function PostureComparison({ posturePhotos, onUploadBaseline, onUploadProgress, isUploading }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const baselineInputRef = useRef(null);
  const progressInputRef = useRef(null);

  // Get baseline (earliest) and progress (latest) photos
  const baselinePhoto = posturePhotos
    .filter(p => p.view_type === "posture_baseline")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  
  const progressPhoto = posturePhotos
    .filter(p => p.view_type === "posture_progress")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const hasComparison = baselinePhoto && progressPhoto;

  const analyzePosture = async () => {
    if (!hasComparison) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these two posture photos from a chiropractic patient. The first is their baseline (Day 1), the second is their current progress photo.

Provide a brief, encouraging analysis covering:
1. Head and neck alignment improvements
2. Shoulder positioning changes
3. Spine alignment observations
4. Overall structural improvements
5. Specific areas that show the most progress

Keep the tone positive and motivational. Focus on visible improvements. Be specific about postural changes you observe.`,
        file_urls: [baselinePhoto.photo_url, progressPhoto.photo_url],
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze posture. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white border-teal-100">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Baseline Photo</h3>
            <p className="text-xs text-gray-500 mb-3">Your starting posture (Day 1)</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onUploadBaseline(e.target.files?.[0])}
              className="hidden"
              ref={baselineInputRef}
              disabled={isUploading}
            />
            <Button
              onClick={() => baselineInputRef.current?.click()}
              disabled={isUploading || !!baselinePhoto}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {baselinePhoto ? "Uploaded" : "Upload Baseline"}
            </Button>
            {baselinePhoto && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {format(new Date(baselinePhoto.date), 'MMM d, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-teal-100">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Progress Photo</h3>
            <p className="text-xs text-gray-500 mb-3">Your current posture</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onUploadProgress(e.target.files?.[0])}
              className="hidden"
              ref={progressInputRef}
              disabled={isUploading || !baselinePhoto}
            />
            <Button
              onClick={() => progressInputRef.current?.click()}
              disabled={isUploading || !baselinePhoto}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Progress"}
            </Button>
            {progressPhoto && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {format(new Date(progressPhoto.date), 'MMM d, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Slider */}
      {hasComparison ? (
        <Card className="bg-white border-2 border-teal-500 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">YOUR POSTURE TRANSFORMATION</h3>
            
            <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {/* Progress Photo (full) */}
              <img
                src={progressPhoto.photo_url}
                alt="Current posture"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Baseline Photo (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={baselinePhoto.photo_url}
                  alt="Baseline posture"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-teal-600" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-bold">BEFORE</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-teal-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs font-bold">AFTER</span>
              </div>
            </div>

            {/* Slider Control */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />

            {/* Date Range */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">
                {format(new Date(baselinePhoto.date), 'MMM d')} → {format(new Date(progressPhoto.date), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Analysis Button */}
            <Button
              onClick={analyzePosture}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze My Posture Progress'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Camera}
          title="Start Your Posture Journey"
          description={!baselinePhoto 
            ? "Upload your baseline photo to begin tracking your structural improvements!"
            : "Upload a progress photo to see your transformation!"
          }
          variant="info"
        />
      )}

      {/* All Progress Photos */}
      {posturePhotos.filter(p => p.view_type === "posture_progress").length > 1 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">All Progress Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {posturePhotos
                .filter(p => p.view_type === "posture_progress")
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(photo => (
                  <div key={photo.id} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    <img src={photo.photo_url} alt="Progress" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold">
                      {format(new Date(photo.date), 'MMM d')}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}