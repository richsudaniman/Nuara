import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AuthMeTest() {
  const [authMeResult, setAuthMeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const runTest = async () => {
    setLoading(true);
    
    try {
      console.log('Calling base44.auth.me()...');
      const authMe = await base44.auth.me();
      console.log('auth.me() result:', authMe);
      setAuthMeResult(authMe);
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      setAuthMeResult({ error: error.message });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  const forceLogoutAndLogin = () => {
    alert('Please log out completely, close all tabs, then log back in. This will clear the authentication session cache.');
  };

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-3">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-purple-900">🔧 Auth Debug Test</span>
            {authMeResult && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                authMeResult.assigned_trainer_id 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {authMeResult.assigned_trainer_id ? '✅ OK' : '❌ NULL'}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={runTest} 
                disabled={loading}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-xs flex-1"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
              <Button 
                onClick={forceLogoutAndLogin}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-xs flex-1"
              >
                🚪 Logout Info
              </Button>
            </div>

            {authMeResult && (
              <>
                <pre className="bg-white p-2 rounded text-[9px] overflow-auto max-h-32 border border-purple-200">
                  {JSON.stringify(authMeResult, null, 2)}
                </pre>

                <div className={`p-2 rounded border ${
                  authMeResult.assigned_trainer_id 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-red-100 border-red-300'
                }`}>
                  <div className="text-[10px] text-gray-600">assigned_trainer_id:</div>
                  <div className={`font-mono text-xs font-bold ${
                    authMeResult.assigned_trainer_id ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {authMeResult.assigned_trainer_id || '❌ NULL - Log out & back in'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}