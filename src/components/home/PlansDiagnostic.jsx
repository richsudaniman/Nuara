import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PlansDiagnostic() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const diagnostics = {
      user: null,
      workoutPlans: { success: false, data: null, error: null },
      nutritionPlans: { success: false, data: null, error: null },
      permissions: {
        workoutPlan: { read: false, error: null },
        nutritionPlan: { read: false, error: null }
      }
    };

    try {
      // Get current user
      diagnostics.user = await base44.auth.me();
      console.log('Current user:', diagnostics.user);

      // Test WorkoutPlan access
      try {
        console.log('Testing WorkoutPlan.filter()...');
        const workoutPlans = await base44.entities.TherapyPlan.filter({
          assigned_to_client_id: diagnostics.user.id
        });
        diagnostics.workoutPlans.success = true;
        diagnostics.workoutPlans.data = workoutPlans;
        diagnostics.permissions.workoutPlan.read = true;
        console.log('WorkoutPlan access: SUCCESS', workoutPlans);
      } catch (error) {
        diagnostics.workoutPlans.error = error.message;
        diagnostics.permissions.workoutPlan.error = error.message;
        console.error('WorkoutPlan access: FAILED', error);
      }

      // Test NutritionPlan access
      try {
        console.log('Testing NutritionPlan.filter()...');
        const nutritionPlans = await base44.entities.TherapyGoal.filter({
          assigned_to_client_id: diagnostics.user.id
        });
        diagnostics.nutritionPlans.success = true;
        diagnostics.nutritionPlans.data = nutritionPlans;
        diagnostics.permissions.nutritionPlan.read = true;
        console.log('NutritionPlan access: SUCCESS', nutritionPlans);
      } catch (error) {
        diagnostics.nutritionPlans.error = error.message;
        diagnostics.permissions.nutritionPlan.error = error.message;
        console.error('NutritionPlan access: FAILED', error);
      }

      // Alternative: Try listing all plans (no filter)
      if (!diagnostics.workoutPlans.success) {
        try {
          console.log('Attempting WorkoutPlan.list() without filter...');
          const allWorkoutPlans = await base44.entities.TherapyPlan.list();
          diagnostics.workoutPlans.alternativeSuccess = true;
          diagnostics.workoutPlans.alternativeData = allWorkoutPlans.filter(
            p => p.assigned_to_client_id === diagnostics.user.id
          );
        } catch (error) {
          diagnostics.workoutPlans.alternativeError = error.message;
        }
      }

      if (!diagnostics.nutritionPlans.success) {
        try {
          console.log('Attempting NutritionPlan.list() without filter...');
          const allNutritionPlans = await base44.entities.TherapyGoal.list();
          diagnostics.nutritionPlans.alternativeSuccess = true;
          diagnostics.nutritionPlans.alternativeData = allNutritionPlans.filter(
            p => p.assigned_to_client_id === diagnostics.user.id
          );
        } catch (error) {
          diagnostics.nutritionPlans.alternativeError = error.message;
        }
      }

    } catch (error) {
      console.error('Diagnostic failed:', error);
      diagnostics.error = error.message;
    }

    setResults(diagnostics);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (!results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Running diagnostics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-24">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-none">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-white mb-1">
            📊 Plans & Permissions Diagnostic
          </h2>
          <p className="text-blue-100 text-xs">
            Testing why workout and nutrition plans aren't displaying
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={runDiagnostic} 
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Running...' : '🔄 Run Diagnostic Again'}
      </Button>

      {/* User Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Your User Info
          </h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono truncate">{results.user?.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Email:</span>
              <span className="truncate">{results.user?.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">Clinician ID:</span>
              <span className={`font-mono ${results.user?.assigned_trainer_id ? 'text-green-600 font-bold' : 'text-red-600'}`}>
                {results.user?.assigned_trainer_id || 'NOT SET ❌'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans */}
      <Card className={`border-2 ${
        results.workoutPlans.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
      }`}>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            {results.workoutPlans.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            Workout Plans Access
          </h3>

          {results.workoutPlans.success ? (
            <div className="space-y-2">
              <div className="text-green-700 font-semibold text-xs">
                ✅ Permission Granted - Can read WorkoutPlan entity
              </div>
              <div className="p-2 bg-white rounded border border-green-300">
                <div className="text-xs text-gray-600">Plans Found:</div>
                <div className="text-xl font-bold text-green-700">
                  {results.workoutPlans.data?.length || 0}
                </div>
              </div>
              {results.workoutPlans.data?.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-700">Your Plans:</div>
                  {results.workoutPlans.data.slice(0, 3).map((plan, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border text-[10px]">
                      <div className="font-semibold">{plan.plan_name || plan.day_of_week || 'Unnamed Plan'}</div>
                      <div className="text-gray-500">ID: {plan.id}</div>
                    </div>
                  ))}
                  {results.workoutPlans.data.length > 3 && (
                    <div className="text-[10px] text-gray-500">...and {results.workoutPlans.data.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-700 font-semibold text-xs">
                ❌ Permission Denied - Cannot read WorkoutPlan entity
              </div>
              <div className="p-2 bg-red-100 rounded border border-red-300">
                <div className="text-[10px] font-semibold text-red-900 mb-1">Error:</div>
                <code className="text-[10px] text-red-700 break-all">
                  {results.workoutPlans.error}
                </code>
              </div>
              
              {results.workoutPlans.alternativeSuccess && (
                <div className="p-2 bg-yellow-50 rounded border border-yellow-300">
                  <div className="text-[10px] font-semibold text-yellow-900 mb-1">
                    ⚠️ Alternative Method Works:
                  </div>
                  <div className="text-[10px] text-yellow-800">
                    Can access via WorkoutPlan.list() - found {results.workoutPlans.alternativeData?.length || 0} plans
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Plans */}
      <Card className={`border-2 ${
        results.nutritionPlans.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
      }`}>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            {results.nutritionPlans.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            Nutrition Plans Access
          </h3>

          {results.nutritionPlans.success ? (
            <div className="space-y-2">
              <div className="text-green-700 font-semibold text-xs">
                ✅ Permission Granted - Can read NutritionPlan entity
              </div>
              <div className="p-2 bg-white rounded border border-green-300">
                <div className="text-xs text-gray-600">Plans Found:</div>
                <div className="text-xl font-bold text-green-700">
                  {results.nutritionPlans.data?.length || 0}
                </div>
              </div>
              {results.nutritionPlans.data?.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-700">Your Plans:</div>
                  {results.nutritionPlans.data.slice(0, 3).map((plan, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border text-[10px]">
                      <div className="font-semibold">{plan.plan_name || plan.meal_name || 'Unnamed Plan'}</div>
                      <div className="text-gray-500">ID: {plan.id}</div>
                    </div>
                  ))}
                  {results.nutritionPlans.data.length > 3 && (
                    <div className="text-[10px] text-gray-500">...and {results.nutritionPlans.data.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-700 font-semibold text-xs">
                ❌ Permission Denied - Cannot read NutritionPlan entity
              </div>
              <div className="p-2 bg-red-100 rounded border border-red-300">
                <div className="text-[10px] font-semibold text-red-900 mb-1">Error:</div>
                <code className="text-[10px] text-red-700 break-all">
                  {results.nutritionPlans.error}
                </code>
              </div>

              {results.nutritionPlans.alternativeSuccess && (
                <div className="p-2 bg-yellow-50 rounded border border-yellow-300">
                  <div className="text-[10px] font-semibold text-yellow-900 mb-1">
                    ⚠️ Alternative Method Works:
                  </div>
                  <div className="text-[10px] text-yellow-800">
                    Can access via NutritionPlan.list() - found {results.nutritionPlans.alternativeData?.length || 0} plans
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solution Card */}
      {(!results.workoutPlans.success || !results.nutritionPlans.success) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2 text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              How to Fix This
            </h3>
            <div className="space-y-2 text-xs text-orange-900">
              <p>
                The client user doesn't have permission to read entities.
              </p>
              <div className="p-2 bg-orange-100 rounded border border-orange-300">
                <div className="font-semibold mb-1 text-[10px]">Required Fix:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                  <li>Go to Base44 Admin → Entities</li>
                  <li>Select <strong>WorkoutPlan</strong></li>
                  <li>Go to <strong>Permissions</strong> tab</li>
                  <li>Grant <strong>READ</strong> to <code className="bg-orange-200 px-1">user</code></li>
                  <li>Add filter: <code className="bg-orange-200 px-1">assigned_to_client_id = $user.id</code></li>
                  <li>Repeat for <strong>NutritionPlan</strong></li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}