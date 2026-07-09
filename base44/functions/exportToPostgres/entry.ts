import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SCHEMAS = {
  User: { 
    email: 'TEXT', full_name: 'TEXT', role: 'TEXT', client_status: 'TEXT', user_type: 'TEXT',
    assigned_trainer_id: 'UUID', waitlist_joined_date: 'DATE', activated_date: 'DATE', discharged_date: 'DATE',
    discharge_reason: 'TEXT', clinical_category: 'TEXT', phone: 'TEXT', bio: 'TEXT', specialties: 'TEXT',
    profile_photo_url: 'TEXT', date_of_birth: 'DATE', age: 'DOUBLE PRECISION', diagnosis: 'TEXT',
    therapy_focus: 'TEXT', session_schedule: 'TEXT', parent_guardian_name: 'TEXT',
    daily_calorie_target: 'DOUBLE PRECISION', daily_protein_target: 'DOUBLE PRECISION'
  },
  TrainerClientAssignment: { trainer_id: 'UUID', client_id: 'UUID', assigned_date: 'DATE', is_active: 'BOOLEAN', notes: 'TEXT' },
  RecoveryGoal: { assigned_to_patient_id: 'UUID', created_by_chiropractor_id: 'UUID', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  RehabilitationProgram: { assigned_to_patient_id: 'UUID', created_by_chiropractor_id: 'UUID', day_of_week: 'TEXT', program_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  Appointment: { chiropractor_id: 'UUID', patient_id: 'UUID', appointment_date: 'TIMESTAMP WITH TIME ZONE', duration_minutes: 'INTEGER', appointment_type: 'TEXT', status: 'TEXT', notes: 'TEXT', chief_complaint: 'TEXT' },
  PracticeSettings: { practice_name: 'TEXT', contact_email: 'TEXT', contact_phone: 'TEXT', address: 'TEXT', timezone: 'TEXT', default_session_duration: 'INTEGER', default_sessions_per_week: 'INTEGER', compliance_target: 'INTEGER', waitlist_auto_reminders: 'BOOLEAN', parent_progress_emails: 'BOOLEAN', low_compliance_alerts: 'BOOLEAN', clinical_categories: 'JSONB' },
  WorkoutPlan: { assigned_to_client_id: 'UUID', created_by_trainer_id: 'UUID', day_of_week: 'TEXT', workout_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  FitnessGoal: { assigned_to_client_id: 'UUID', created_by_trainer_id: 'UUID', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  WorkoutLog: { logged_by_client_id: 'UUID', workout_plan_id: 'UUID', exercise_name: 'TEXT', completed_date: 'DATE', sets_completed: 'INTEGER', weight_used: 'DOUBLE PRECISION', reps_completed: 'INTEGER', notes: 'TEXT' },
  DailyMotivation: { message: 'TEXT', sent_to_client_id: 'UUID', sent_by_trainer_id: 'UUID', date: 'DATE', is_active: 'BOOLEAN' },
  ProgressMetric: { client_id: 'UUID', metric_type: 'TEXT', value: 'DOUBLE PRECISION', unit: 'TEXT', date: 'DATE', notes: 'TEXT' },
  ProgressPhoto: { client_id: 'UUID', photo_url: 'TEXT', date: 'DATE', view_type: 'TEXT', notes: 'TEXT' },
  ExerciseVideo: { title: 'TEXT', description: 'TEXT', video_url: 'TEXT', thumbnail_url: 'TEXT', category: 'TEXT', duration_minutes: 'INTEGER', difficulty_level: 'TEXT', uploaded_by_trainer_id: 'UUID', tags: 'JSONB', notes: 'TEXT' },
  TrainerNote: { trainer_id: 'UUID', client_id: 'UUID', title: 'TEXT', content: 'TEXT' },
  Announcement: { title: 'TEXT', message: 'TEXT', target_audience: 'TEXT', priority: 'TEXT', created_by_admin_id: 'UUID', sent_at: 'TIMESTAMP WITH TIME ZONE', scheduled_date: 'DATE', is_active: 'BOOLEAN' },
  ChatMessage: { sender_id: 'UUID', receiver_id: 'UUID', message: 'TEXT', is_read: 'BOOLEAN', message_type: 'TEXT' },
  ScheduledSession: { trainer_id: 'UUID', client_id: 'UUID', start_time: 'TIMESTAMP WITH TIME ZONE', duration_minutes: 'INTEGER', status: 'TEXT', notes: 'TEXT' },
  PainLog: { patient_id: 'UUID', date: 'DATE', pain_level: 'INTEGER', affected_areas: 'JSONB', pain_type: 'TEXT', notes: 'TEXT', triggers: 'TEXT' },
  TherapyPlan: { assigned_to_client_id: 'UUID', created_by_trainer_id: 'UUID', day_of_week: 'TEXT', workout_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
  ClinicalNote: { trainer_id: 'UUID', client_id: 'UUID', title: 'TEXT', content: 'TEXT' },
  PractitionerPatientAssignment: { trainer_id: 'UUID', client_id: 'UUID', assigned_date: 'DATE', is_active: 'BOOLEAN', notes: 'TEXT' },
  TherapyGoal: { assigned_to_client_id: 'UUID', created_by_trainer_id: 'UUID', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  ClinicalGoal: { assigned_to_patient_id: 'UUID', created_by_chiropractor_id: 'UUID', goal_title: 'TEXT', target_value: 'TEXT', current_value: 'TEXT', target_date: 'DATE', progress_percentage: 'DOUBLE PRECISION', linked_metric_type: 'TEXT', is_active: 'BOOLEAN' },
  TherapyActivity: { title: 'TEXT', description: 'TEXT', video_url: 'TEXT', thumbnail_url: 'TEXT', category: 'TEXT', duration_minutes: 'INTEGER', difficulty_level: 'TEXT', uploaded_by_trainer_id: 'UUID', tags: 'JSONB', notes: 'TEXT' },
  TherapyLog: { logged_by_client_id: 'UUID', workout_plan_id: 'UUID', exercise_name: 'TEXT', completed_date: 'DATE', sets_completed: 'INTEGER', weight_used: 'DOUBLE PRECISION', reps_completed: 'INTEGER', notes: 'TEXT' },
  CareProgram: { assigned_to_patient_id: 'UUID', created_by_chiropractor_id: 'UUID', day_of_week: 'TEXT', program_type: 'TEXT', exercises: 'JSONB', order: 'INTEGER' },
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

function convertToUUID(idStr) {
  if (!idStr || typeof idStr !== 'string') return 'NULL';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)) {
    return "'" + idStr + "'";
  }
  if (/^[0-9a-f]{24}$/i.test(idStr)) {
    const padded = idStr.toLowerCase() + "00000000";
    const uuid = `${padded.slice(0,8)}-${padded.slice(8,12)}-${padded.slice(12,16)}-${padded.slice(16,20)}-${padded.slice(20,32)}`;
    return "'" + uuid + "'";
  }
  return "NULL";
}

const toSnakeCasePlural = (str) => {
  if (str === 'User') return 'profiles';
  let snake = str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  if (snake.endsWith('activity')) return snake.replace(/activity$/, 'activities');
  if (snake.endsWith('settings')) return snake;
  return snake + 's';
};

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
      const tableName = toSnakeCasePlural(entityName);
      sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
      sql += `  "id" UUID PRIMARY KEY,\n`;
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
        sql += `INSERT INTO "${tableName}" ("${insertCols.join('", "')}") VALUES\n`;
        
        const values = records.map(r => {
          const rowVals = insertCols.map(c => {
            if (c === 'created_date' || c === 'updated_date') return formatTimestamp(r[c]);
            if (c === 'id' || c === 'created_by_id' || c.endsWith('_id')) return convertToUUID(r[c]);
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