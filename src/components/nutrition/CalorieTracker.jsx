import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function CalorieTracker({ logs = [], onAddLog, onDeleteLog, dailyTarget, proteinTarget = 150, carbsTarget = 250, fatsTarget = 70 }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    meal_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    meal_type: "Breakfast",
    date: new Date().toISOString().split('T')[0]
  });

  const todayDate = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(log => log.date === todayDate);
  const todayCalories = todayLogs.reduce((sum, log) => sum + (parseFloat(log.calories) || 0), 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + (parseFloat(log.protein) || 0), 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + (parseFloat(log.carbs) || 0), 0);
  const todayFats = todayLogs.reduce((sum, log) => sum + (parseFloat(log.fats) || 0), 0);
  const percentage = dailyTarget > 0 ? Math.min((todayCalories / dailyTarget) * 100, 100) : 0;
  
  const proteinPercent = proteinTarget > 0 ? Math.min((todayProtein / proteinTarget) * 100, 100) : 0;
  const carbsPercent = carbsTarget > 0 ? Math.min((todayCarbs / carbsTarget) * 100, 100) : 0;
  const fatsPercent = fatsTarget > 0 ? Math.min((todayFats / fatsTarget) * 100, 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.meal_name.trim()) {
      alert("Please enter a meal name");
      return;
    }
    
    const calories = parseFloat(formData.calories);
    if (isNaN(calories) || calories <= 0) {
      alert("Please enter valid calories");
      return;
    }

    onAddLog({
      ...formData,
      calories: calories,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
    });

    setFormData({
      meal_name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      meal_type: "Breakfast",
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  return (
    <Card className="bg-white border-2 border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-[#1a1a1a]">CALORIE TRACKER</h3>
          <Button 
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1" />
            {showForm ? "Cancel" : "Log Meal"}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Meal name *"
                value={formData.meal_name}
                onChange={(e) => setFormData({...formData, meal_name: e.target.value})}
                className="bg-white"
                required
              />
              <Select
                value={formData.meal_type}
                onValueChange={(value) => setFormData({...formData, meal_type: value})}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Calories *"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: e.target.value})}
                className="bg-white"
                min="0"
                step="1"
                required
              />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-white"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Protein (g)"
                value={formData.protein}
                onChange={(e) => setFormData({...formData, protein: e.target.value})}
                className="bg-white text-sm"
                min="0"
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={formData.carbs}
                onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                className="bg-white text-sm"
                min="0"
                step="0.1"
              />
              <Input
                type="number"
                placeholder="Fats (g)"
                value={formData.fats}
                onChange={(e) => setFormData({...formData, fats: e.target.value})}
                className="bg-white text-sm"
                min="0"
                step="0.1"
              />
            </div>

            <Button type="submit" className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold">
              Add Log
            </Button>
          </form>
        )}

        {/* Today's Summary */}
        <div className="bg-gradient-to-r from-[#0ea5e9]/10 to-[#0284c7]/10 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700">Today's Calories</span>
            <span className="text-lg font-black italic">
              <span className="text-[#0ea5e9]">{Math.round(todayCalories)}</span> / {dailyTarget}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-[#0ea5e9] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/50 p-2 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 font-bold">Protein</p>
                <p className="text-xs text-purple-600 font-bold">{Math.round(proteinPercent)}%</p>
              </div>
              <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-purple-600 transition-all" style={{width: `${proteinPercent}%`}}></div>
              </div>
              <p className="text-xs font-black text-purple-600 text-center">{Math.round(todayProtein)}g / {proteinTarget}g</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 font-bold">Carbs</p>
                <p className="text-xs text-orange-600 font-bold">{Math.round(carbsPercent)}%</p>
              </div>
              <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-orange-600 transition-all" style={{width: `${carbsPercent}%`}}></div>
              </div>
              <p className="text-xs font-black text-orange-600 text-center">{Math.round(todayCarbs)}g / {carbsTarget}g</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 font-bold">Fats</p>
                <p className="text-xs text-yellow-600 font-bold">{Math.round(fatsPercent)}%</p>
              </div>
              <div className="h-1.5 bg-yellow-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-yellow-600 transition-all" style={{width: `${fatsPercent}%`}}></div>
              </div>
              <p className="text-xs font-black text-yellow-600 text-center">{Math.round(todayFats)}g / {fatsTarget}g</p>
            </div>
          </div>
        </div>

        {/* Meal Logs */}
        <div>
          <h4 className="font-bold text-sm text-gray-700 mb-3">RECENT MEALS</h4>
          {logs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-[#1a1a1a]">{log.meal_name}</p>
                      <span className="px-2 py-0.5 text-xs font-bold bg-[#0ea5e9]/20 text-[#0ea5e9] rounded">
                        {log.meal_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="font-semibold">{log.calories} cal</span>
                      {log.protein > 0 && <span>P: {log.protein}g</span>}
                      {log.carbs > 0 && <span>C: {log.carbs}g</span>}
                      {log.fats > 0 && <span>F: {log.fats}g</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (confirm("Delete this meal log?")) {
                        onDeleteLog(log.id);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic py-4 text-sm">No meals logged yet. Start tracking!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}