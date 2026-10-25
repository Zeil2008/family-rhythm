"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "family.db");
if (!fs.existsSync(dbPath)) {
  console.error(`找不到数据库：${dbPath}`);
  process.exit(1);
}

const backupDir = process.env.BACKUP_DIR || path.join(path.dirname(dbPath), "backups");
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = process.env.BACKUP_PATH || path.join(backupDir, `family-${stamp}.db`);
if (fs.existsSync(output)) {
  console.error(`备份文件已经存在：${output}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath, { readOnly: true });
try {
  db.exec(`VACUUM INTO '${output.replaceAll("'", "''")}'`);
} finally {
  db.close();
}
const uploadsDir = path.join(path.dirname(dbPath), "uploads");
if (fs.existsSync(uploadsDir)) {
  const uploadsBackup = path.join(backupDir, `uploads-${stamp}`);
  fs.cpSync(uploadsDir, uploadsBackup, { recursive: true, errorOnExist: true });
  console.log(`成果照片备份完成：${uploadsBackup}`);
}
console.log(`数据库备份完成：${output}`);
