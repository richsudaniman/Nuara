import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';

export default function DiagnosticTool() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults(null);

    try {
      // Get current logged-in trainer
      const trainer = await base44.auth.me();
      
      // Find the client by email
      const allUsers = await base44.entities.User.list();
      const client = allUsers.find(u => u.email === email);
      
      if (!client) {
        setResults({
          error: 'User not found with that email',
          clientFound: false
        });
        setLoading(false);
        return;
      }

      // Find assignment
      const allAssignments = await base44.entities.PractitionerPatientAssignment.list();
      const assignment = allAssignments.find(a => 
        a.client_id === client.id && a.is_active
      );

      // Find plans
      const workoutPlans = await base44.entities.TherapyPlan.filter({
        assigned_to_client_id: client.id
      });

      // Identify issues
      const issues = [];
      if (!client.assigned_trainer_id) {
        issues.push({
          severity: 'error',
          message: 'Client User record has NO assigned_trainer_id'
        });
      } else if (assignment && client.assigned_trainer_id !== assignment.trainer_id) {
        issues.push({
          severity: 'error',
          message: `MISMATCH: User.assigned_trainer_id (${client.assigned_trainer_id}) ≠ Assignment.trainer_id (${assignment.trainer_id})`
        });
      } else if (!assignment && client.assigned_trainer_id) {
        issues.push({
          severity: 'warning',
          message: 'User has assigned_trainer_id but NO active TrainerClientAssignment record'
        });
      }

      if (!assignment) {
        issues.push({
          severity: 'error',
          message: 'NO active TrainerClientAssignment record found'
        });
      }

      if (client.assigned_trainer_id !== trainer.id && assignment?.trainer_id !== trainer.id) {
        issues.push({
          severity: 'warning',
          message: 'Client is NOT assigned to YOU (the logged-in user)'
        });
      }

      setResults({
        clientFound: true,
        client: {
          id: client.id,
          email: client.email,
          full_name: client.full_name,
          assigned_trainer_id: client.assigned_trainer_id,
          user_type: client.user_type,
          role: client.role
        },
        assignment: assignment ? {
          id: assignment.id,
          trainer_id: assignment.trainer_id,
          client_id: assignment.client_id,
          is_active: assignment.is_active,
          assigned_date: assignment.assigned_date
        } : null,
        trainer: {
          id: trainer.id,
          email: trainer.email,
          full_name: trainer.full_name
        },
        workoutPlans: workoutPlans.length,
        issues
      });

    } catch (error) {
      setResults({
        error: error.message,
        clientFound: false
      });
    }

    setLoading(false);
  };

  const fixClient = async () => {
    if (!results || !results.client) return;
    
    setLoading(true);
    try {
      const trainer = await base44.auth.me();
      
      // Update the User entity
      await base44.entities.User.update(results.client.id, {
        assigned_trainer_id: trainer.id
      });

      // Check if assignment exists
      const allAssignments = await base44.entities.PractitionerPatientAssignment.list();
      const existingAssignment = allAssignments.find(a => 
        a.client_id === results.client.id && a.is_active
      );

      if (!existingAssignment) {
        // Create assignment
        await base44.entities.PractitionerPatientAssignment.create({
          trainer_id: trainer.id,
          client_id: results.client.id,
          assigned_date: new Date().toISOString().split('T')[0],
          is_active: true
        });
      }

      alert('Client fixed! Run diagnostics again to verify.');
      runDiagnostics();
    } catch (error) {
      alert('Error fixing client: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-none">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Trainer Assignment Diagnostic Tool
          </h1>
          <p className="text-blue-100 text-sm">
            Check why a client can't see their assigned trainer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter client email (e.g., ahhmedabdlrahim72@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={runDiagnostics} 
              disabled={loading || !email}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Checking...' : 'Run Diagnostics'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          {results.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">{results.error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {results.clientFound && (
            <>
              {/* Issues */}
              {results.issues.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Issues Found ({results.issues.length})
                    </h3>
                    <ul className="space-y-2">
                      {results.issues.map((issue, idx) => (
                        <li key={idx} className={`p-3 rounded ${
                          issue.severity === 'error' ? 'bg-red-100 text-red-900' : 'bg-yellow-100 text-yellow-900'
                        }`}>
                          <span className="font-semibold">
                            {issue.severity === 'error' ? '🚨' : '⚠️'}
                          </span> {issue.message}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={fixClient}
                      disabled={loading}
                      className="mt-4 bg-red-600 hover:bg-red-700 w-full"
                    >
                      🔧 Attempt Auto-Fix
                    </Button>
                  </CardContent>
                </Card>
              )}

              {results.issues.length === 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">No issues found! Assignment looks correct.</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Client Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Client Details</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-semibold">{results.client.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Email:</span>
                      <span>{results.client.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Name:</span>
                      <span>{results.client.full_name || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">User Type:</span>
                      <span>{results.client.user_type || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Role:</span>
                      <span>{results.client.role || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">assigned_trainer_id:</span>
                      <span className={`font-bold ${results.client.assigned_trainer_id ? 'text-green-600' : 'text-red-600'}`}>
                        {results.client.assigned_trainer_id || 'NULL ❌'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">PractitionerPatientAssignment Record</h3>
                  {results.assignment ? (
                    <div className="space-y-2 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">Assignment ID:</span>
                        <span>{results.assignment.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">trainer_id:</span>
                        <span className="font-semibold">{results.assignment.trainer_id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">client_id:</span>
                        <span>{results.assignment.client_id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">is_active:</span>
                        <span className={results.assignment.is_active ? 'text-green-600 font-bold' : 'text-red-600'}>
                          {results.assignment.is_active ? 'TRUE ✓' : 'FALSE ❌'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">assigned_date:</span>
                        <span>{results.assignment.assigned_date}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">
                      ❌ NO RECORD FOUND
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plans Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Assigned Plans</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="font-semibold">Therapy Plans:</span>
                      <span className={`font-bold ${results.workoutPlans > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {results.workoutPlans}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trainer Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Your Info (Logged In)</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-semibold">{results.trainer.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Email:</span>
                      <span>{results.trainer.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Name:</span>
                      <span>{results.trainer.full_name || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}