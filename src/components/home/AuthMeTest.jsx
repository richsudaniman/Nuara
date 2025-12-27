import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthMeTest() {
  const [authMeResult, setAuthMeResult] = useState(null);
  const [userListResult, setUserListResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    
    try {
      console.log('Calling base44.auth.me()...');
      const authMe = await base44.auth.me();
      console.log('auth.me() result:', authMe);
      setAuthMeResult(authMe);

      console.log('Calling User.list() to find same user...');
      const allUsers = await base44.entities.User.list();
      const matchingUser = allUsers.find(u => u.id === authMe.id);
      console.log('User.list() result for same ID:', matchingUser);
      setUserListResult(matchingUser);

    } catch (error) {
      console.error('Error:', error);
      setAuthMeResult({ error: error.message });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 border-none">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-white mb-1">
            Auth.me() vs User.list() Test
          </h2>
          <p className="text-purple-100 text-xs">
            Compare what auth.me() returns vs User.list()
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={runTest} 
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? 'Testing...' : 'Run Test Again'}
      </Button>

      {authMeResult && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2 text-blue-900">
              1️⃣ auth.me() Result:
            </h3>
            <pre className="bg-white p-3 rounded text-[10px] overflow-auto max-h-48 border border-blue-200">
              {JSON.stringify(authMeResult, null, 2)}
            </pre>
            
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <div className="font-mono text-xs">
                <span className="text-gray-600">assigned_trainer_id: </span>
                <span className={`font-bold ${authMeResult.assigned_trainer_id ? 'text-green-600' : 'text-red-600'}`}>
                  {authMeResult.assigned_trainer_id || 'NULL ❌'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userListResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2 text-green-900">
              2️⃣ User.list() Result:
            </h3>
            <pre className="bg-white p-3 rounded text-[10px] overflow-auto max-h-48 border border-green-200">
              {JSON.stringify(userListResult, null, 2)}
            </pre>
            
            <div className="mt-3 p-2 bg-green-100 rounded">
              <div className="font-mono text-xs">
                <span className="text-gray-600">assigned_trainer_id: </span>
                <span className={`font-bold ${userListResult.assigned_trainer_id ? 'text-green-600' : 'text-red-600'}`}>
                  {userListResult.assigned_trainer_id || 'NULL ❌'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {authMeResult && userListResult && (
        <Card className={`border-2 ${
          authMeResult.assigned_trainer_id === userListResult.assigned_trainer_id
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }`}>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">⚖️ Comparison:</h3>
            {authMeResult.assigned_trainer_id === userListResult.assigned_trainer_id ? (
              <div className="text-green-700 font-semibold text-sm">
                ✅ MATCH - Both return the same assigned_trainer_id
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-700 font-semibold text-sm">
                  ❌ MISMATCH - Different values!
                </div>
                <div className="text-xs text-red-600">
                  <div>auth.me(): <span className="font-mono font-bold">{authMeResult.assigned_trainer_id || 'null'}</span></div>
                  <div>User.list(): <span className="font-mono font-bold">{userListResult.assigned_trainer_id || 'null'}</span></div>
                </div>
                <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                  <div className="font-bold text-red-900 text-xs mb-1">🔍 This is the problem!</div>
                  <div className="text-xs text-red-800">
                    auth.me() is returning cached data that doesn't match the database.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}