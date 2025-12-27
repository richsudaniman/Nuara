import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthMeTest() {
  const [authMeResult, setAuthMeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

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
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 border-none">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-white mb-1">
            Client Auth Test - What Do I See?
          </h2>
          <p className="text-purple-100 text-xs">
            Testing what base44.auth.me() returns for the logged-in client
          </p>
          <p className="text-purple-100 text-[10px] mt-1">
            Refreshed: {refreshCount} times
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={runTest} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-sm"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </Button>

        <Button 
          onClick={forceLogoutAndLogin}
          className="bg-orange-600 hover:bg-orange-700 text-sm"
        >
          🚪 Logout Info
        </Button>
      </div>

      {authMeResult && (
        <>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-2 text-blue-900">
                📋 Your User Data:
              </h3>
              <pre className="bg-white p-3 rounded text-[10px] overflow-auto max-h-48 border border-blue-200">
                {JSON.stringify(authMeResult, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className={`border-2 ${
            authMeResult.assigned_trainer_id 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-2">🎯 Critical Field Check:</h3>
              
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border text-xs">
                  <span className="text-gray-600">User ID: </span>
                  <span className="font-mono font-bold text-blue-900">{authMeResult.id || 'N/A'}</span>
                </div>

                <div className="p-2 bg-white rounded border text-xs">
                  <span className="text-gray-600">Email: </span>
                  <span className="font-mono font-bold text-blue-900">{authMeResult.email || 'N/A'}</span>
                </div>

                <div className={`p-3 rounded border-2 ${
                  authMeResult.assigned_trainer_id 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-red-100 border-red-500'
                }`}>
                  <div className="text-xs font-semibold mb-1">assigned_trainer_id:</div>
                  <div className={`font-mono text-sm font-bold ${
                    authMeResult.assigned_trainer_id 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {authMeResult.assigned_trainer_id || '❌ NULL (NOT SET)'}
                  </div>
                </div>
              </div>

              {!authMeResult.assigned_trainer_id && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                  <div className="font-bold text-red-900 text-xs mb-1">⚠️ PROBLEM CONFIRMED</div>
                  <div className="text-[10px] text-red-800">
                    Your assigned_trainer_id is NULL. Log out completely and log back in to refresh your session.
                  </div>
                </div>
              )}

              {authMeResult.assigned_trainer_id && (
                <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                  <div className="font-bold text-green-900 text-xs mb-1">✅ TRAINER ASSIGNED!</div>
                  <div className="text-[10px] text-green-800">
                    Your trainer ID is properly set.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}