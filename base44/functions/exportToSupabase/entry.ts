import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only allow admins to export data
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entities = [
      'User', 'TrainerClientAssignment', 'RecoveryGoal', 'RehabilitationProgram', 
      'Appointment', 'PracticeSettings', 'WorkoutPlan', 'FitnessGoal', 'WorkoutLog', 
      'DailyMotivation', 'ProgressMetric', 'ProgressPhoto', 'ExerciseVideo', 
      'TrainerNote', 'Announcement', 'ChatMessage', 'ScheduledSession', 'PainLog', 
      'TherapyPlan', 'ClinicalNote', 'PractitionerPatientAssignment', 'TherapyGoal', 
      'ClinicalGoal', 'TherapyActivity', 'TherapyLog', 'CareProgram'
    ];

    let sql = `-- Base44 Export for Supabase (PostgreSQL)\n-- Generated: ${new Date().toISOString()}\n\n`;

    const escapeSql = (val) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
      if (typeof val === 'number') return val;
      if (typeof val === 'object') {
        const str = JSON.stringify(val);
        return `'${str.replace(/'/g, "''")}'`;
      }
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    for (const entity of entities) {
      try {
        let items = [];
        let hasMore = true;
        let skip = 0;
        const limit = 500;
        
        while (hasMore) {
           // Provide an empty query and high limit to fetch data
           // We use filter because it returns an array of records
           const batch = await base44.asServiceRole.entities[entity].filter({}, '-created_date', limit, skip);
           if (!batch || batch.length === 0) {
             hasMore = false;
             break;
           }
           items.push(...batch);
           if (batch.length < limit) {
             hasMore = false;
           } else {
             skip += limit;
           }
        }

        if (items.length > 0) {
          sql += `-- Table: ${entity}\n`;
          for (const item of items) {
            const keys = Object.keys(item);
            // Quote identifiers for PostgreSQL compatibility
            const cols = keys.map(k => `"${k}"`).join(', ');
            const vals = keys.map(k => escapeSql(item[k])).join(', ');
            sql += `INSERT INTO "${entity}" (${cols}) VALUES (${vals});\n`;
          }
          sql += '\n';
        }
      } catch (err) {
        sql += `-- Warning: Could not fetch ${entity} or no records exist.\n\n`;
      }
    }

    // Return the response as a downloadable SQL file
    return new Response(sql, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': 'attachment; filename="supabase_export.sql"'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});