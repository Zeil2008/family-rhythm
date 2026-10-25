"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function openDatabase(dbPath) {
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
      avatar TEXT NOT NULL DEFAULT '',
      avatar_path TEXT,
      color TEXT NOT NULL DEFAULT '#E36F52',
      pin_hash TEXT NOT NULL,
      pin_salt TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '习惯',
      task_type TEXT NOT NULL DEFAULT 'agreed'
        CHECK (task_type IN ('agreed', 'custom')),
      workflow_status TEXT NOT NULL DEFAULT 'active'
        CHECK (workflow_status IN ('pending_acceptance', 'pending_approval', 'active', 'rejected')),
      points INTEGER NOT NULL DEFAULT 1 CHECK (points >= 0 AND points <= 1000),
      due_time TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      recurrence TEXT NOT NULL DEFAULT 'once'
        CHECK (recurrence IN ('once', 'daily', 'weekdays', 'weekly')),
      weekdays TEXT NOT NULL DEFAULT '[]',
      require_approval INTEGER NOT NULL DEFAULT 1,
      evidence_required INTEGER NOT NULL DEFAULT 1,
      archived INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER REFERENCES members(id),
      review_note TEXT NOT NULL DEFAULT '',
      reviewed_by INTEGER REFERENCES members(id),
      reviewed_at TEXT,
      accepted_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      occurrence_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      points INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL,
      reviewed_by INTEGER REFERENCES members(id),
      reviewed_at TEXT,
      review_note TEXT NOT NULL DEFAULT '',
      evidence_note TEXT NOT NULL DEFAULT '',
      evidence_path TEXT,
      UNIQUE (task_id, member_id, occurrence_date)
    );

    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending_acceptance'
        CHECK (status IN ('pending_acceptance', 'active')),
      accepted_at TEXT,
      PRIMARY KEY (task_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS point_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      delta INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reason TEXT NOT NULL,
      type TEXT NOT NULL,
      reference_type TEXT,
      reference_id INTEGER,
      created_by INTEGER REFERENCES members(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '🎁',
      cost INTEGER NOT NULL CHECK (cost > 0),
      stock INTEGER NOT NULL DEFAULT 99 CHECK (stock >= 0),
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reward_id INTEGER NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      cost INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
      requested_at TEXT NOT NULL,
      reviewed_by INTEGER REFERENCES members(id),
      reviewed_at TEXT,
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS deduction_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      points INTEGER NOT NULL CHECK (points > 0 AND points <= 1000),
      warning_limit INTEGER NOT NULL DEFAULT 3 CHECK (warning_limit >= 0 AND warning_limit <= 99),
      warnings_used INTEGER NOT NULL DEFAULT 0 CHECK (warnings_used >= 0),
      status TEXT NOT NULL DEFAULT 'pending_acceptance'
        CHECK (status IN ('pending_acceptance', 'active')),
      accepted_at TEXT,
      archived INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER NOT NULL REFERENCES members(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deduction_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id INTEGER NOT NULL REFERENCES deduction_rules(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL CHECK (event_type IN ('warning', 'deduction', 'reset')),
      points_delta INTEGER NOT NULL DEFAULT 0,
      warning_after INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_by INTEGER NOT NULL REFERENCES members(id),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_family_member ON tasks(family_id, member_id, archived);
    CREATE INDEX IF NOT EXISTS idx_completions_occurrence ON completions(occurrence_date, status);
    CREATE INDEX IF NOT EXISTS idx_task_assignees_member
      ON task_assignees(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_points_member_date ON point_transactions(member_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_redemptions_member_status ON redemptions(member_id, status);
    CREATE INDEX IF NOT EXISTS idx_deduction_rules_family
      ON deduction_rules(family_id, member_id, archived, status);
    CREATE INDEX IF NOT EXISTS idx_deduction_events_rule
      ON deduction_events(rule_id, created_at);
  `);

  function addMissingColumn(table, column, definition) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!columns.some((item) => item.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }

  addMissingColumn("tasks", "task_type", "TEXT NOT NULL DEFAULT 'agreed'");
  addMissingColumn("tasks", "workflow_status", "TEXT NOT NULL DEFAULT 'active'");
  addMissingColumn("tasks", "evidence_required", "INTEGER NOT NULL DEFAULT 1");
  addMissingColumn("tasks", "review_note", "TEXT NOT NULL DEFAULT ''");
  addMissingColumn("tasks", "reviewed_by", "INTEGER");
  addMissingColumn("tasks", "reviewed_at", "TEXT");
  addMissingColumn("tasks", "accepted_at", "TEXT");
  addMissingColumn("completions", "evidence_note", "TEXT NOT NULL DEFAULT ''");
  addMissingColumn("completions", "evidence_path", "TEXT");
  addMissingColumn("members", "avatar_path", "TEXT");

  db.exec(`
    INSERT OR IGNORE INTO task_assignees (task_id, member_id, status, accepted_at)
    SELECT
      t.id,
      t.member_id,
      CASE
        WHEN t.workflow_status = 'pending_acceptance' THEN 'pending_acceptance'
        WHEN t.task_type = 'custom'
          AND t.workflow_status IN ('pending_approval', 'rejected') THEN 'pending_acceptance'
        ELSE 'active'
      END,
      CASE WHEN t.workflow_status = 'active' THEN COALESCE(t.accepted_at, t.created_at) ELSE NULL END
    FROM tasks t
    WHERE NOT EXISTS (
      SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_workflow
      ON tasks(family_id, member_id, workflow_status, archived);
  `);
  return db;
}

module.exports = { openDatabase };
