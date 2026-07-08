import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ENTITIES = [
  'User', 'TrainerClientAssignment', 'RecoveryGoal', 'RehabilitationProgram', 
  'Appointment', 'PracticeSettings', 'WorkoutPlan', 'FitnessGoal', 'WorkoutLog', 
  'DailyMotivation', 'ProgressMetric', 'ProgressPhoto', 'ExerciseVideo', 'TrainerNote', 
  'Announcement', 'ChatMessage', 'ScheduledSession', 'PainLog', 'TherapyPlan', 
  'ClinicalNote', 'PractitionerPatientAssignment', 'TherapyGoal', 'ClinicalGoal', 
  'TherapyActivity', 'TherapyLog', 'CareProgram'
];

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
  if (typeof str === 'number') return str;
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
  return `'${String(str).replace(/'/g, "''")}'`;
}

function mapType(schemaType, format) {
  if (schemaType === 'integer') return 'INTEGER';
  if (schemaType === 'number') return 'DOUBLE PRECISION';
  if (schemaType === 'boolean') return 'BOOLEAN';
  if (schemaType === 'array' || schemaType === 'object') return 'JSONB';
  if (format === 'date' || format === 'date-time') return 'TIMESTAMP WITH TIME ZONE';
  return 'TEXT';
}

function getFkRef(colName) {
  if (['trainer_id', 'client_id', 'patient_id', 'logged_by_client_id', 'assigned_to_client_id', 'assigned_to_patient_id', 'created_by_trainer_id', 'created_by_chiropractor_id', 'sender_id', 'receiver_id', 'created_by_admin_id', 'uploaded_by_trainer_id', 'sent_to_client_id', 'sent_by_trainer_id'].includes(colName)) return 'User';
  if (colName === 'workout_plan_id') return 'WorkoutPlan';
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    let sqlDump = `-- Base44 to Supabase PostgreSQL Export\n-- Generated at ${new Date().toISOString()}\n\n`;
    sqlDump += `CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n`;

    let fks = [];

    for (const entityName of ENTITIES) {
      try {
        let schema;
        if (base44.asServiceRole.entities[entityName] && typeof base44.asServiceRole.entities[entityName].schema === 'function') {
          try {
            schema = await base44.asServiceRole.entities[entityName].schema();
          } catch(err) {
            // User schema might fail or be restricted
          }
        }
        
        let records = [];
        try {
            records = await base44.asServiceRole.entities[entityName].filter({});
        } catch(err) {
            // skip if entity doesn't exist
            continue;
        }

        if (!schema && records.length === 0) continue; 

        const properties = schema?.properties || {};
        
        if (Object.keys(properties).length === 0 && records.length > 0) {
            Object.keys(records[0]).forEach(key => {
                if (!['id', 'created_date', 'updated_date', 'created_by_id'].includes(key)) {
                    properties[key] = { type: typeof records[0][key] === 'number' ? 'number' : 'string' };
                }
            });
        }

        sqlDump += `CREATE TABLE IF NOT EXISTS "${entityName}" (\n`;
        sqlDump += `  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,\n`;
        sqlDump += `  "created_date" TIMESTAMP WITH TIME ZONE,\n`;
        sqlDump += `  "updated_date" TIMESTAMP WITH TIME ZONE,\n`;
        sqlDump += `  "created_by_id" TEXT,\n`;
        
        for (const [colName, colSchema] of Object.entries(properties)) {
          if (['id', 'created_date', 'updated_date', 'created_by_id'].includes(colName)) continue;
          const sqlType = mapType(colSchema.type, colSchema.format);
          sqlDump += `  "${colName}" ${sqlType},\n`;
          
          const fkRef = getFkRef(colName);
          if (fkRef) {
            fks.push(`ALTER TABLE "${entityName}" ADD CONSTRAINT "fk_${entityName.toLowerCase()}_${colName}" FOREIGN KEY ("${colName}") REFERENCES "${fkRef}"("id") ON DELETE SET NULL;`);
          }
        }
        sqlDump = sqlDump.replace(/,\n$/, '\n');
        sqlDump += `);\n\n`;

        if (records && records.length > 0) {
          sqlDump += `-- Data for ${entityName}\n`;
          for (const record of records) {
            const columns = Object.keys(record);
            const values = columns.map(col => escapeSql(record[col]));
            sqlDump += `INSERT INTO "${entityName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
          }
          sqlDump += `\n`;
        }
      } catch (e) {
        console.error(`Error processing ${entityName}:`, e);
        sqlDump += `-- Error exporting ${entityName}: ${e.message}\n\n`;
      }
    }

    if (fks.length > 0) {
        sqlDump += `-- Foreign Keys\n`;
        sqlDump += fks.join('\n') + '\n\n';
    }

    return Response.json({ sql: sqlDump });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});