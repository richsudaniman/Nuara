import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SCHEMAS = {
  User: { email: 'TEXT', full_name: 'TEXT', role: 'TEXT', client_status: 'TEXT', user_type: 'TEXT' },
  TrainerClientAssignment: { trainer_id: 'TEXT', client_id: 'TEXT', assigned_date: 'DATE', is_active: 'BOOLEAN', notes: 'TEXT' },
  RecoveryGoal: { assigned_to_patient_id: 'TEXT', created_by_chiropractor_id: 'TEXT', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  RehabilitationProgram: { assigned_to_patient_id: 'TEXT', created_by_chiropractor_id: 'TEXT', day_of_week: 'TEXT', program_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  Appointment: { chiropractor_id: 'TEXT', patient_id: 'TEXT', appointment_date: 'TIMESTAMP WITH TIME ZONE', duration_minutes: 'INTEGER', appointment_type: 'TEXT', status: 'TEXT', notes: 'TEXT', chief_complaint: 'TEXT' },
  PracticeSettings: { practice_name: 'TEXT', contact_email: 'TEXT', contact_phone: 'TEXT', address: 'TEXT', timezone: 'TEXT', default_session_duration: 'INTEGER', default_sessions_per_week: 'INTEGER', compliance_target: 'INTEGER', waitlist_auto_reminders: 'BOOLEAN', parent_progress_emails: 'BOOLEAN', low_compliance_alerts: 'BOOLEAN', clinical_categories: 'JSONB' },
  WorkoutPlan: { assigned_to_client_id: 'TEXT', created_by_trainer_id: 'TEXT', day_of_week: 'TEXT', workout_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  FitnessGoal: { assigned_to_client_id: 'TEXT', created_by_trainer_id: 'TEXT', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  WorkoutLog: { logged_by_client_id: 'TEXT', workout_plan_id: 'TEXT', exercise_name: 'TEXT', completed_date: 'DATE', sets_completed: 'INTEGER', weight_used: 'DOUBLE PRECISION', reps_completed: 'INTEGER', notes: 'TEXT' },
  DailyMotivation: { message: 'TEXT', sent_to_client_id: 'TEXT', sent_by_trainer_id: 'TEXT', date: 'DATE', is_active: 'BOOLEAN' },
  ProgressMetric: { client_id: 'TEXT', metric_type: 'TEXT', value: 'DOUBLE PRECISION', unit: 'TEXT', date: 'DATE', notes: 'TEXT' },
  ProgressPhoto: { client_id: 'TEXT', photo_url: 'TEXT', date: 'DATE', view_type: 'TEXT', notes: 'TEXT' },
  ExerciseVideo: { title: 'TEXT', description: 'TEXT', video_url: 'TEXT', thumbnail_url: 'TEXT', category: 'TEXT', duration_minutes: 'INTEGER', difficulty_level: 'TEXT', uploaded_by_trainer_id: 'TEXT', tags: 'JSONB', notes: 'TEXT' },
  TrainerNote: { trainer_id: 'TEXT', client_id: 'TEXT', title: 'TEXT', content: 'TEXT' },
  Announcement: { title: 'TEXT', message: 'TEXT', target_audience: 'TEXT', priority: 'TEXT', created_by_admin_id: 'TEXT', sent_at: 'TIMESTAMP WITH TIME ZONE', scheduled_date: 'DATE', is_active: 'BOOLEAN' },
  ChatMessage: { sender_id: 'TEXT', receiver_id: 'TEXT', message: 'TEXT', is_read: 'BOOLEAN', message_type: 'TEXT' },
  ScheduledSession: { trainer_id: 'TEXT', client_id: 'TEXT', start_time: 'TIMESTAMP WITH TIME ZONE', duration_minutes: 'INTEGER', status: 'TEXT', notes: 'TEXT' },
  PainLog: { patient_id: 'TEXT', date: 'DATE', pain_level: 'INTEGER', affected_areas: 'JSONB', pain_type: 'TEXT', notes: 'TEXT', triggers: 'TEXT' },
  TherapyPlan: { assigned_to_client_id: 'TEXT', created_by_trainer_id: 'TEXT', day_of_week: 'TEXT', workout_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  ClinicalNote: { trainer_id: 'TEXT', client_id: 'TEXT', title: 'TEXT', content: 'TEXT' },
  PractitionerPatientAssignment: { trainer_id: 'TEXT', client_id: 'TEXT', assigned_date: 'DATE', is_active: 'BOOLEAN', notes: 'TEXT' },
  TherapyGoal: { assigned_to_client_id: 'TEXT', created_by_trainer_id: 'TEXT', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  ClinicalGoal: { assigned_to_patient_id: 'TEXT', created_by_chiropractor_id: 'TEXT', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  TherapyActivity: { title: 'TEXT', description: 'TEXT', video_url: 'TEXT', thumbnail_url: 'TEXT', category: 'TEXT', duration_minutes: 'INTEGER', difficulty_level: 'TEXT', uploaded_by_trainer_id: 'TEXT', tags: 'JSONB', notes: 'TEXT' },
  TherapyLog: { logged_by_client_id: 'TEXT', workout_plan_id: 'TEXT', exercise_name: 'TEXT', completed_date: 'DATE', sets_completed: 'INTEGER', weight_used: 'DOUBLE PRECISION', reps_completed: 'INTEGER', notes: 'TEXT' },
  CareProgram: { assigned_to_patient_id: 'TEXT', created_by_chiropractor_id: 'TEXT', day_of_week: 'TEXT', program_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
};

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
  if (typeof str === 'number') return str;
  if (typeof str === 'object') return "'" + JSON.stringify(str).replace(/'/g, "''") + "'";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Convert timestamp string to ISO 8601 or pass through if already ISO-like
function formatTimestamp(val) {
  if (!val) return 'NULL';
  const d = new Date(val);
  if (!isNaN(d.getTime())) return escapeSql(d.toISOString());
  return escapeSql(val);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let sql = `-- Base44 to PostgreSQL Export\n`;
    sql += `-- Generated at ${new Date().toISOString()}\n\n`;
    sql += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

    // We fetch and export data for each schema
    for (const [entityName, columns] of Object.entries(SCHEMAS)) {
      sql += `CREATE TABLE IF NOT EXISTS "${entityName}" (\n`;
      sql += `  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n`;
      sql += `  "created_date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`;
      sql += `  "updated_date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`;
      sql += `  "created_by_id" UUID,\n`;
      
      const colNames = Object.keys(columns);
      for (const col of colNames) {
        sql += `  "${col}" ${columns[col]},\n`;
      }
      sql = sql.replace(/,\n$/, '\n');
      sql += `);\n\n`;

      // Fetch all records for this entity
      let records = [];
      try {
        records = await base44.asServiceRole.entities[entityName].filter({}, "-created_date", 2000);
      } catch (err) {
        // If entity has no records, list might fail or just return empty
      }

      if (records.length > 0) {
        const insertCols = ['id', 'created_date', 'updated_date', 'created_by_id', ...colNames];
        sql += `INSERT INTO "${entityName}" ("${insertCols.join('", "')}") VALUES\n`;
        
        const values = records.map(r => {
          const rowVals = insertCols.map(c => {
            if (c === 'created_date' || c === 'updated_date') return formatTimestamp(r[c]);
            return escapeSql(r[c]);
          });
          return `(${rowVals.join(', ')})`;
        });
        sql += values.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
      }
    }

    const enc = new TextEncoder();
    const sqlBytes = enc.encode(sql);
    
    return new Response(sqlBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': 'attachment; filename="base44_postgres_export.sql"'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});