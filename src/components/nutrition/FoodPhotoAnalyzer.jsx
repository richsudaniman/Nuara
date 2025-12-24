import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Plus, AlertCircle, Scan, X, Package } from "lucide-react";

export default function FoodPhotoAnalyzer({ onFoodAnalyzed }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState('photo'); // 'photo' or 'barcode'
  const [barcode, setBarcode] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureAndScanBarcode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          setAnalyzing(true);
          setError('');
          
          const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
          
          // Try to detect barcode first
          const barcodeResult = await base44.integrations.Core.InvokeLLM({
            prompt: "Detect any barcodes in this image. Extract the barcode number if found. If no barcode is visible, return false.",
            file_urls: [file_url],
            response_json_schema: {
              type: "object",
              properties: {
                barcode_detected: { type: "boolean" },
                barcode_number: { type: "string" }
              }
            }
          });

          if (barcodeResult.barcode_detected && barcodeResult.barcode_number) {
            setBarcode(barcodeResult.barcode_number);
            stopCamera();
            await handleBarcodeSearch(barcodeResult.barcode_number);
          } else {
            // No barcode, analyze as food instead
            const nutritionSchema = {
              type: "object",
              properties: {
                name: { type: "string", description: "Food name" },
                calories: { type: "number", description: "Total calories" },
                protein: { type: "number", description: "Protein in grams" },
                carbs: { type: "number", description: "Carbs in grams" },
                fats: { type: "number", description: "Fats in grams" }
              },
              required: ["name", "calories", "protein", "carbs", "fats"]
            };

            const foodResult = await base44.integrations.Core.InvokeLLM({
              prompt: "Analyze this food image. Identify the food, estimate realistic portion sizes, and provide accurate nutritional information for calories, protein, carbs, and fats.",
              file_urls: [file_url],
              response_json_schema: nutritionSchema
            });

            setResults(foodResult);
            stopCamera();
            
            const today = new Date().toISOString().split('T')[0];
            await onFoodAnalyzed({
              date: today,
              meal_name: foodResult.name,
              calories: foodResult.calories,
              protein: foodResult.protein,
              carbs: foodResult.carbs,
              fats: foodResult.fats,
              meal_type: 'Snack'
            });
          }
        } catch (error) {
          setError("Failed to analyze image. Please try again.");
        }
        setAnalyzing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleBarcodeSearch = async (barcodeNumber = barcode) => {
    if (!barcodeNumber.trim()) return;

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const nutritionSchema = {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name" },
          calories: { type: "number", description: "Calories per serving" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbs in grams" },
          fats: { type: "number", description: "Fats in grams" }
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Look up nutritional information for product with barcode: ${barcodeNumber}. Provide product name and nutritional values per serving.`,
        add_context_from_internet: true,
        response_json_schema: nutritionSchema
      });

      setResults(result);
      
      const today = new Date().toISOString().split('T')[0];
      await onFoodAnalyzed({
        date: today,
        meal_name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        meal_type: 'Snack'
      });
    } catch (err) {
      setError(err.message || 'Barcode lookup failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const nutritionSchema = {
        type: "object",
        properties: {
          name: { type: "string", description: "Food name" },
          calories: { type: "number", description: "Total calories" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbs in grams" },
          fats: { type: "number", description: "Fats in grams" }
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyze this food image. Identify the food, estimate realistic portion sizes, and provide accurate nutritional information for calories, protein, carbs, and fats.",
        file_urls: [file_url],
        response_json_schema: nutritionSchema
      });

      setResults(result);
      
      const today = new Date().toISOString().split('T')[0];
      await onFoodAnalyzed({
        date: today,
        meal_name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        meal_type: 'Snack'
      });
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
      e.target.value = '';
    }
  };

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={stopCamera}
            className="rounded-full bg-black/30 hover:bg-black/50 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-white font-semibold">Scan Barcode</h1>
          <div className="w-10"></div>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-32 border-4 border-white border-dashed rounded-lg">
            <p className="text-white text-sm text-center px-4 mt-12">
              Scan barcode or capture food
            </p>
          </div>
        </div>

        {analyzing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 z-30">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
            <p className="text-white text-lg font-semibold">Scanning...</p>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={captureAndScanBarcode}
            disabled={analyzing}
            className="bg-white text-black rounded-full w-20 h-20 p-0 shadow-lg"
          >
            <Scan className="w-8 h-8" />
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
            {mode === 'photo' ? <Camera className="w-5 h-5 text-white" /> : <Scan className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="font-black italic text-[#1a1a1a]">
              {mode === 'photo' ? 'SNAP & TRACK' : 'SCAN BARCODE'}
            </h3>
            <p className="text-xs text-gray-600">
              {mode === 'photo' ? 'Take a photo to analyze nutrition' : 'Scan packaged foods instantly'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode(mode === 'photo' ? 'barcode' : 'photo');
              setError('');
              setResults(null);
            }}
            className="text-xs"
          >
            {mode === 'photo' ? <Package className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </Button>
        </div>

        {mode === 'photo' ? (
          <>
            <input
              id="food-photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={analyzing}
              className="hidden"
            />
            <label htmlFor="food-photo-upload" className="block">
              <Button
                type="button"
                disabled={analyzing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('food-photo-upload').click();
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    UPLOAD PHOTO
                  </>
                )}
              </Button>
            </label>
          </>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Enter barcode number..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="text-center font-mono"
            />
            <Button
              onClick={() => handleBarcodeSearch()}
              disabled={!barcode.trim() || analyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  SEARCHING...
                </>
              ) : (
                'LOOK UP PRODUCT'
              )}
            </Button>
            <Button
              onClick={startCamera}
              variant="outline"
              className="w-full border-purple-300"
              disabled={analyzing}
            >
              <Scan className="w-4 h-4 mr-2" />
              OPEN CAMERA
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {results && (
          <div className="p-4 bg-white border-2 border-purple-300 rounded space-y-2">
            <h4 className="font-black italic text-purple-900">{results.name.toUpperCase()}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Calories:</span>
                <span className="font-bold ml-1">{results.calories}</span>
              </div>
              <div>
                <span className="text-gray-600">Protein:</span>
                <span className="font-bold ml-1">{results.protein}g</span>
              </div>
              <div>
                <span className="text-gray-600">Carbs:</span>
                <span className="font-bold ml-1">{results.carbs}g</span>
              </div>
              <div>
                <span className="text-gray-600">Fats:</span>
                <span className="font-bold ml-1">{results.fats}g</span>
              </div>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Added to your log!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}