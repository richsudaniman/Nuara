import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { analyzeFood } from "@/functions/analyzeFood";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, CheckCircle, XCircle, Plus, Edit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FoodPhotoAnalyzer({ onFoodAnalyzed }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedFood, setEditedFood] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image is too large. Maximum size is 10MB');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    setDetectedFoods([]);

    try {
      // Upload image to Base44 storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setUploading(false);
      setAnalyzing(true);

      // Analyze food with Passio API
      const response = await analyzeFood({ image_url: file_url });

      console.log('Full API Response:', response);

      if (response.data.success && response.data.foods.length > 0) {
        setDetectedFoods(response.data.foods);
        if (response.data.warning) {
          setError('⚠️ ' + response.data.warning);
        }
      } else {
        // Show detailed error information
        const errorMsg = response.data.error || 'Analysis failed';
        const errorDetails = response.data.details || response.data.message || '';
        const statusCode = response.data.status || '';

        let fullError = errorMsg;
        if (statusCode) fullError += ` (Status: ${statusCode})`;
        if (errorDetails) fullError += ` - ${errorDetails}`;

        console.error('Analysis Error:', fullError);
        setError(fullError);
      }
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError('Failed to analyze food. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
      e.target.value = '';
    }
  };

  const handleEditFood = (index) => {
    setEditingIndex(index);
    setEditedFood({ ...detectedFoods[index] });
  };

  const handleSaveEdit = () => {
    const updated = [...detectedFoods];
    updated[editingIndex] = editedFood;
    setDetectedFoods(updated);
    setEditingIndex(null);
    setEditedFood(null);
  };

  const handleAddToLog = (food, index) => {
    onFoodAnalyzed({
      meal_name: food.name,
      calories: Math.round(food.calories),
      protein: Math.round(food.protein),
      carbs: Math.round(food.carbs),
      fats: Math.round(food.fats),
      date: new Date().toISOString().split('T')[0],
      meal_type: 'Snack',
    });

    // Remove the added food from the list
    setDetectedFoods(detectedFoods.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 glow-blue">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 flex items-center justify-center" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black italic text-[#1a1a1a]">SNAP & LOG CALORIES</h3>
            <p className="text-xs text-gray-600">Take a photo of your food to log nutrition</p>
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading || analyzing}
            />
            <div className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black italic cursor-pointer px-4 py-3 rounded-md flex items-center justify-center transition-colors">
              {uploading || analyzing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 mr-2" />
              )}
              {uploading ? "UPLOADING..." : analyzing ? "ANALYZING..." : "TAKE PHOTO"}
            </div>
          </label>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading || analyzing}
            />
            <div className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic cursor-pointer px-4 py-3 rounded-md flex items-center justify-center transition-colors">
              {uploading || analyzing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {uploading ? "UPLOADING..." : analyzing ? "ANALYZING..." : "UPLOAD"}
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Detected Foods */}
        {detectedFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-700">Detected Food Items</h4>
            </div>

            {detectedFoods.map((food, index) => (
              <Card key={index} className="bg-white border-2 border-gray-200">
                <CardContent className="p-4">
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <Input
                        value={editedFood.name}
                        onChange={(e) => setEditedFood({ ...editedFood, name: e.target.value })}
                        className="font-bold"
                        placeholder="Food name"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={editedFood.calories}
                          onChange={(e) => setEditedFood({ ...editedFood, calories: parseFloat(e.target.value) || 0 })}
                          placeholder="Calories"
                        />
                        <Input
                          type="number"
                          value={editedFood.protein}
                          onChange={(e) => setEditedFood({ ...editedFood, protein: parseFloat(e.target.value) || 0 })}
                          placeholder="Protein (g)"
                        />
                        <Input
                          type="number"
                          value={editedFood.carbs}
                          onChange={(e) => setEditedFood({ ...editedFood, carbs: parseFloat(e.target.value) || 0 })}
                          placeholder="Carbs (g)"
                        />
                        <Input
                          type="number"
                          value={editedFood.fats}
                          onChange={(e) => setEditedFood({ ...editedFood, fats: parseFloat(e.target.value) || 0 })}
                          placeholder="Fats (g)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditedFood(null);
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-black italic text-[#1a1a1a] text-lg">{food.name}</h4>
                          <p className="text-xs text-gray-500">{food.serving_size}</p>
                          {food.confidence < 0.7 && (
                            <p className="text-xs text-yellow-600 mt-1">⚠️ Low confidence - verify data</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleEditFood(index)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-2xl font-black text-[#0ea5e9]">{Math.round(food.calories)}</p>
                          <p className="text-xs text-gray-500">cal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-purple-600">{Math.round(food.protein)}</p>
                          <p className="text-xs text-gray-500">protein</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-orange-600">{Math.round(food.carbs)}</p>
                          <p className="text-xs text-gray-500">carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-yellow-600">{Math.round(food.fats)}</p>
                          <p className="text-xs text-gray-500">fats</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAddToLog(food, index)}
                        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        ADD TO LOG
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          📸 Max size: 10MB • Supported: JPG, PNG, HEIC
        </p>
      </CardContent>
    </Card>
  );
}