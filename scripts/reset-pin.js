"use strict";

const crypto = require("node:crypto");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data", "family.db");
const target = process.argv[2];
const newPin = process.env.NEW_PIN;

if (!target || !/^\d{4,8}$/.test(newPin || "")) {
  console.error("用法：NEW_PIN=新的4到8位数字 node scripts/reset-pin.js 成员称呼或ID");
  console.error("执行前建议先停止家庭节奏服务，并先备份数据库。");
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
const member = db
  .prepare("SELECT id, name FROM members WHERE id = ? OR name = ? ORDER BY id LIMIT 1")
  .get(Number(target) || -1, target);
if (!member) {
  db.close();
  console.error(`找不到成员：${target}`);
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(newPin, salt, 64).toString("hex");
db.exec("BEGIN IMMEDIATE");
try {
  db.prepare("UPDATE members SET pin_hash = ?, pin_salt = ? WHERE id = ?")
    .run(hash, salt, member.id);
  db.prepare("DELETE FROM sessions WHERE member_id = ?").run(member.id);
  db.exec("COMMIT");
  console.log(`已重置 ${member.name} 的登录密码，并让旧登录会话失效。`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
