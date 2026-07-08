import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const entities = [
  'User',
  'PractitionerPatientAssignment',
  'TherapyGoal',
  'CareProgram',
  'Appointment',
  'PracticeSettings',
  'TherapyPlan',
  'FitnessGoal',
  'TherapyLog',
  'DailyMotivation',
  'ProgressMetric',
  'ProgressPhoto',
  'TherapyActivity',
  'ClinicalNote',
  'Announcement',
  'ChatMessage',
  'ScheduledSession',
  'PainLog'
];

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return val.toString();
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${val.toString().replace(/'/g, "''")}'`;
}

function generateCreateTable(entityName, rows) {
  if (!rows || rows.length === 0) return '';
  const firstRow = rows[0];
  const columns = Object.keys(firstRow).map(key => {
    let type = 'TEXT';
    const val = firstRow[key];
    if (key === 'id') type = 'UUID PRIMARY KEY';
    else if (typeof val === 'number') type = 'NUMERIC';
    else if (typeof val === 'boolean') type = 'BOOLEAN';
    else if (typeof val === 'object') type = 'JSONB';
    return `    "${key}" ${type}`;
  }).join(',\n');

  return `CREATE TABLE IF NOT EXISTS "${entityName}" (\n${columns}\n);\n`;
}

function generateInsertStatements(entityName, rows) {
  if (!rows || rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const colString = columns.map(c => `"${c}"`).join(', ');

  const inserts = rows.map(row => {
    const values = columns.map(c => escapeSql(row[c])).join(', ');
    return `INSERT INTO "${entityName}" (${colString}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;`;
  }).join('\n');

  return inserts + '\n\n';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let sqlOutput = '-- Base44 Data Export for PostgreSQL\\n\\n';

    for (const entity of entities) {
      try {
        if (!base44.asServiceRole.entities[entity]) continue;
        
        let allRows = [];
        let hasMore = true;
        let skip = 0;
        const limit = 100;

        while (hasMore) {
          const rows = await base44.asServiceRole.entities[entity].list('-created_date', limit, skip);
          if (rows.length > 0) {
            allRows = allRows.concat(rows);
            skip += limit;
          }
          if (rows.length < limit) {
            hasMore = false;
          }
        }

        if (allRows.length > 0) {
          sqlOutput += `-- Table: ${entity}\n`;
          sqlOutput += generateCreateTable(entity, allRows);
          sqlOutput += generateInsertStatements(entity, allRows);
        }
      } catch (err) {
        console.error(`Error exporting entity ${entity}:`, err.message);
        sqlOutput += `-- Error exporting entity ${entity}: ${err.message}\n\n`;
      }
    }

    return new Response(sqlOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="base44_export.sql"'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});