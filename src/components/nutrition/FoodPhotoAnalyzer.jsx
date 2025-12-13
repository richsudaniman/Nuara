import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function FoodPhotoAnalyzer({ onFoodAnalyzed }) {
  const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, success, error
  const [message, setMessage] = useState('');
  const [foods, setFoods] = useState([]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setMessage('Please select an image file');
      e.target.value = '';
      return;
    }

    setStatus('uploading');
    setMessage('Uploading image...');
    setFoods([]);

    try {
      // Upload
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const imageUrl = uploadResult.file_url;

      setStatus('analyzing');
      setMessage('Analyzing food...');

      // Analyze
      const response = await base44.functions.invoke('analyzeFood', { image_url: imageUrl });
      
      if (response.data.success && response.data.foods?.length > 0) {
        setFoods(response.data.foods);
        setStatus('success');
        setMessage(`Found ${response.data.foods.length} food item(s)!`);
      } else {
        setStatus('error');
        setMessage(response.data.error || 'No food detected. Try another photo.');
      }

    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      e.target.value = '';
    }
  };

  const addFoodToLog = (food) => {
    onFoodAnalyzed({
      meal_name: food.name,
      calories: Math.round(food.calories),
      protein: Math.round(food.protein),
      carbs: Math.round(food.carbs),
      fats: Math.round(food.fats),
      date: new Date().toISOString().split('T')[0],
      meal_type: 'Snack',
    });
    
    setFoods(foods.filter(f => f !== food));
    if (foods.length === 1) {
      setStatus('idle');
      setMessage('');
    }
  };

  const isLoading = status === 'uploading' || status === 'analyzing';

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 flex items-center justify-center" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black italic text-[#1a1a1a]">SNAP & LOG</h3>
            <p className="text-xs text-gray-600">Take a photo of your food</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="hidden"
            />
            <div className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white font-black italic px-4 py-3 rounded-md flex items-center justify-center transition-colors cursor-pointer`}>
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
              {isLoading ? 'PROCESSING...' : 'CAMERA'}
            </div>
          </label>

          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="hidden"
            />
            <div className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-[#0ea5e9] hover:bg-[#0284c7]'} text-white font-black italic px-4 py-3 rounded-md flex items-center justify-center transition-colors cursor-pointer`}>
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              {isLoading ? 'PROCESSING...' : 'UPLOAD'}
            </div>
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded border-l-4 ${
            status === 'error' ? 'bg-red-50 border-red-500' :
            status === 'success' ? 'bg-green-50 border-green-500' :
            'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-center gap-2">
              {status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              {status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              <p className={`text-sm font-semibold ${
                status === 'error' ? 'text-red-700' :
                status === 'success' ? 'text-green-700' :
                'text-blue-700'
              }`}>{message}</p>
            </div>
          </div>
        )}

        {foods.length > 0 && (
          <div className="space-y-3">
            {foods.map((food, idx) => (
              <Card key={idx} className="bg-white border-2 border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-black italic text-[#1a1a1a] text-lg mb-3">{food.name}</h4>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xl font-black text-[#0ea5e9]">{Math.round(food.calories)}</p>
                      <p className="text-xs text-gray-500">cal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-purple-600">{Math.round(food.protein)}g</p>
                      <p className="text-xs text-gray-500">protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-orange-600">{Math.round(food.carbs)}g</p>
                      <p className="text-xs text-gray-500">carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-yellow-600">{Math.round(food.fats)}g</p>
                      <p className="text-xs text-gray-500">fats</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => addFoodToLog(food)}
                    className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    ADD TO LOG
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}