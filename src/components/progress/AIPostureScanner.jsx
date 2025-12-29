import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIPostureScanner({ userId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const analyzePosture = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      // Upload file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      // Analyze with AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a chiropractic posture analysis expert. Analyze this posture photo and provide a detailed assessment.

Evaluate and provide specific feedback on:
1. **Head & Neck Position**: Forward head posture, cervical alignment
2. **Shoulder Alignment**: Level, rolled forward/back, symmetry
3. **Spine Curvature**: Thoracic curve, lumbar curve, lateral deviations
4. **Hip Alignment**: Level, anterior/posterior tilt
5. **Overall Balance**: Weight distribution, center of gravity

Provide:
- Specific observations of postural deviations
- Potential implications (e.g., muscle tension areas, compensation patterns)
- 2-3 actionable recommendations for improvement

Keep the tone professional yet encouraging. Be specific about what you observe in the photo.`,
        file_urls: [file_url],
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze posture. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI POSTURE SCANNER</h2>
              <p className="text-xs text-gray-600">Get instant feedback on your posture</p>
            </div>
          </div>

          {!previewUrl ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take or Upload Photo
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Stand sideways or face the camera. Wear fitted clothing for best results.
              </p>
            </div>
          ) : (
            <div>
              <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={analyzePosture}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Posture'}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="px-6"
                >
                  New Photo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-white border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">YOUR POSTURE ANALYSIS</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis}</p>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  <span className="font-bold">Note:</span> This AI analysis is for informational purposes. 
                  Consult with your chiropractor for personalized treatment recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}