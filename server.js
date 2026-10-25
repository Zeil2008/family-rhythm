"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { URL } = require("node:url");
const { openDatabase } = require("./src/database");
const {
  addDays,
  dateInTimeZone,
  dateRange,
  isValidDate,
  isValidTime,
  normalizedWeekdays,
  occursOn,
} = require("./src/date");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const SESSION_DAYS = 30;
const loginAttempts = new Map();
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function failure(message, status = 400) {
  throw new HttpError(status, message);
}

function cleanText(value, label, { required = false, max = 100 } = {}) {
  const text = String(value ?? "").trim();
  if (required && !text) failure(`请填写${label}`);
  if (text.length > max) failure(`${label}不能超过 ${max} 个字符`);
  return text;
}

function parseInteger(value, label, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    failure(`${label}必须是 ${minimum} 到 ${maximum} 之间的整数`);
  }
  return number;
}

function validPin(value) {
  return /^\d{4,8}$/.test(String(value || ""));
}

function hashPin(pin, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(String(pin), salt, 64).toString("hex"),
  };
}

function pinMatches(pin, member) {
  const candidate = hashPin(pin, member.pin_salt).hash;
  const expected = Buffer.from(member.pin_hash, "hex");
  const actual = Buffer.from(candidate, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function publicMember(member) {
  const avatarPath = member.avatar_path || "";
  const avatarVersion = avatarPath ? path.basename(avatarPath) : "";
  return {
    id: Number(member.id),
    name: member.name,
    role: member.role,
    avatar: "",
    avatarUrl: avatarPath
      ? `/api/members/${member.id}/avatar?v=${encodeURIComponent(avatarVersion)}`
      : null,
    color: member.color,
    points: Number(member.points),
    active: Boolean(member.active),
  };
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim().split("="))
      .filter(([key, value]) => key && value !== undefined)
      .map(([key, ...parts]) => [key, decodeURIComponent(parts.join("="))])
  );
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > 6 * 1024 * 1024) {
        reject(new HttpError(413, "请求内容过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new HttpError(400, "请求格式不正确"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, value, headers = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

function sendError(res, error) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error(error);
  sendJson(res, status, {
    error: status >= 500 ? "服务器暂时开小差了，请稍后重试" : error.message,
  });
}

function withTransaction(db, callback) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function getFamily(db, familyId) {
  const family = db.prepare("SELECT * FROM families WHERE id = ?").get(familyId);
  if (!family) failure("家庭不存在", 404);
  return family;
}

function memberInFamily(db, memberId, familyId) {
  const member = db
    .prepare("SELECT * FROM members WHERE id = ? AND family_id = ?")
    .get(memberId, familyId);
  if (!member) failure("家庭成员不存在", 404);
  return member;
}

function ensureParent(user) {
  if (user.role !== "parent") failure("只有家长可以进行此操作", 403);
}

function addPointTransaction(db, member, delta, {
  reason,
  type,
  referenceType = null,
  referenceId = null,
  createdBy = null,
}) {
  const next = Number(member.points) + Number(delta);
  if (next < 0) failure("积分不足");
  db.prepare("UPDATE members SET points = ? WHERE id = ?").run(next, member.id);
  db.prepare(`
    INSERT INTO point_transactions
      (family_id, member_id, delta, balance_after, reason, type, reference_type,
       reference_id, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    member.family_id,
    member.id,
    delta,
    next,
    reason,
    type,
    referenceType,
    referenceId,
    createdBy,
    nowIso()
  );
  return next;
}

function getTasks(db, familyId, memberId = null, { activeOnly = false } = {}) {
  const sql = `
    SELECT t.*, m.name AS member_name, m.avatar AS member_avatar,
           m.avatar_path AS member_avatar_path, m.color AS member_color,
           creator.name AS creator_name, creator.role AS creator_role
    FROM tasks t
    JOIN members m ON m.id = t.member_id
    LEFT JOIN members creator ON creator.id = t.created_by
    WHERE t.family_id = ? AND t.archived = 0
    ${memberId ? "AND t.member_id = ?" : ""}
    ${activeOnly ? "AND t.workflow_status = 'active'" : ""}
    ORDER BY t.due_time IS NULL, t.due_time, t.id
  `;
  return memberId
    ? db.prepare(sql).all(familyId, memberId)
    : db.prepare(sql).all(familyId);
}

function taskJson(task) {
  let weekdays = [];
  try {
    weekdays = JSON.parse(task.weekdays || "[]");
  } catch {
    weekdays = [];
  }
  return {
    id: Number(task.id),
    memberId: Number(task.member_id),
    memberName: task.member_name,
    memberAvatar: task.member_avatar,
    memberAvatarUrl: task.member_avatar_path
      ? `/api/members/${task.member_id}/avatar?v=${encodeURIComponent(path.basename(task.member_avatar_path))}`
      : null,
    memberColor: task.member_color,
    title: task.title,
    notes: task.notes,
    category: task.category,
    taskType: task.task_type,
    workflowStatus: task.workflow_status,
    points: Number(task.points),
    dueTime: task.due_time,
    startDate: task.start_date,
    endDate: task.end_date,
    recurrence: task.recurrence,
    weekdays,
    requireApproval: Boolean(task.require_approval),
    evidenceRequired: Boolean(task.evidence_required),
    reviewNote: task.review_note || "",
    creatorName: task.creator_name || "",
    creatorRole: task.creator_role || "",
    createdAt: task.created_at,
    acceptedAt: task.accepted_at,
  };
}

function getTaskRow(db, familyId, taskId) {
  return db.prepare(`
    SELECT t.*, m.name AS member_name, m.avatar AS member_avatar,
           m.avatar_path AS member_avatar_path, m.color AS member_color,
           creator.name AS creator_name, creator.role AS creator_role
    FROM tasks t
    JOIN members m ON m.id = t.member_id
    LEFT JOIN members creator ON creator.id = t.created_by
    WHERE t.id = ? AND t.family_id = ? AND t.archived = 0
  `).get(taskId, familyId);
}

function getDeductionRules(db, familyId, memberId = null, { activeOnly = false } = {}) {
  return db.prepare(`
    SELECT d.*, m.name AS member_name, m.color AS member_color,
           m.avatar_path AS member_avatar_path,
           creator.name AS creator_name
    FROM deduction_rules d
    JOIN members m ON m.id = d.member_id
    LEFT JOIN members creator ON creator.id = d.created_by
    WHERE d.family_id = ? AND d.archived = 0
      ${memberId ? "AND d.member_id = ?" : ""}
      ${activeOnly ? "AND d.status = 'active'" : ""}
    ORDER BY d.status = 'pending_acceptance' DESC, d.id DESC
  `).all(familyId, ...(memberId ? [memberId] : []));
}

function getDeductionEvents(db, ruleId, limit = 20) {
  return db.prepare(`
    SELECT e.*, actor.name AS actor_name
    FROM deduction_events e
    LEFT JOIN members actor ON actor.id = e.created_by
    WHERE e.rule_id = ?
    ORDER BY e.id DESC LIMIT ?
  `).all(ruleId, limit);
}

function deductionRuleJson(rule, events = []) {
  return {
    id: Number(rule.id),
    memberId: Number(rule.member_id),
    memberName: rule.member_name,
    memberColor: rule.member_color,
    memberAvatarUrl: rule.member_avatar_path
      ? `/api/members/${rule.member_id}/avatar?v=${encodeURIComponent(path.basename(rule.member_avatar_path))}`
      : null,
    title: rule.title,
    description: rule.description,
    points: Number(rule.points),
    warningLimit: Number(rule.warning_limit),
    warningsUsed: Number(rule.warnings_used),
    remainingWarnings: Math.max(0, Number(rule.warning_limit) - Number(rule.warnings_used)),
    status: rule.status,
    acceptedAt: rule.accepted_at,
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
    creatorName: rule.creator_name || "",
    events: events.map((event) => ({
      id: Number(event.id),
      type: event.event_type,
      pointsDelta: Number(event.points_delta),
      warningAfter: Number(event.warning_after),
      balanceAfter: Number(event.balance_after),
      note: event.note,
      actorName: event.actor_name || "",
      createdAt: event.created_at,
    })),
  };
}

function occurrenceRows(db, familyId, start, end, memberId = null) {
  const dates = dateRange(start, end, 94);
  if (dates.length === 0) return [];
  const tasks = getTasks(db, familyId, memberId, { activeOnly: true });
  if (tasks.length === 0) return [];
  const taskIds = tasks.map((task) => task.id);
  const placeholders = taskIds.map(() => "?").join(",");
  const completions = db.prepare(`
    SELECT c.*, reviewer.name AS reviewer_name
    FROM completions c
    LEFT JOIN members reviewer ON reviewer.id = c.reviewed_by
    WHERE c.task_id IN (${placeholders})
      AND c.occurrence_date BETWEEN ? AND ?
  `).all(...taskIds, start, end);
  const completionMap = new Map(
    completions.map((completion) => [
      `${completion.task_id}:${completion.member_id}:${completion.occurrence_date}`,
      completion,
    ])
  );
  const result = [];
  for (const date of dates) {
    for (const task of tasks) {
      if (!occursOn(task, date)) continue;
      const completion = completionMap.get(`${task.id}:${task.member_id}:${date}`);
      result.push({
        ...taskJson(task),
        taskId: Number(task.id),
        date,
        status: completion?.status || "todo",
        completionId: completion ? Number(completion.id) : null,
        completedAt: completion?.completed_at || null,
        reviewedAt: completion?.reviewed_at || null,
        reviewerName: completion?.reviewer_name || null,
        reviewNote: completion?.review_note || "",
        evidenceNote: completion?.evidence_note || "",
        hasEvidence: Boolean(completion?.evidence_path),
      });
    }
  }
  return result.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99") ||
      a.taskId - b.taskId
  );
}

function calculateStreak(memberId, start, end, rows) {
  let cursor = end;
  if (cursor === dateInTimeZone("Asia/Shanghai")) {
    const todayRows = rows.filter((row) => row.date === cursor && row.memberId === memberId);
    if (
      todayRows.length > 0 &&
      todayRows.some((row) => row.status !== "approved")
    ) {
      cursor = addDays(cursor, -1);
    }
  }
  let streak = 0;
  while (cursor >= start) {
    const dayRows = rows.filter((row) => row.date === cursor && row.memberId === memberId);
    if (dayRows.length > 0) {
      if (dayRows.every((row) => row.status === "approved")) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function memberDailyStats(member, rows) {
  const mine = rows.filter((row) => row.memberId === member.id);
  const approved = mine.filter((row) => row.status === "approved").length;
  const pending = mine.filter((row) => row.status === "pending").length;
  return {
    ...publicMember(member),
    total: mine.length,
    approved,
    pending,
    percent: mine.length ? Math.round((approved / mine.length) * 100) : 0,
  };
}

function normalizeTaskPayload(body, current = null) {
  const source = current
    ? {
        title: body.title ?? current.title,
        memberId: body.memberId ?? current.member_id,
        notes: body.notes ?? current.notes,
        category: body.category ?? current.category,
        points: body.points ?? current.points,
        dueTime: body.dueTime !== undefined ? body.dueTime : current.due_time,
        startDate: body.startDate ?? current.start_date,
        endDate: body.endDate !== undefined ? body.endDate : current.end_date,
        recurrence: body.recurrence ?? current.recurrence,
        weekdays:
          body.weekdays !== undefined
            ? body.weekdays
            : JSON.parse(current.weekdays || "[]"),
        requireApproval:
          body.requireApproval !== undefined
            ? body.requireApproval
            : Boolean(current.require_approval),
        evidenceRequired:
          body.evidenceRequired !== undefined
            ? body.evidenceRequired
            : Boolean(current.evidence_required),
      }
    : body;
  const title = cleanText(source.title, "任务名称", { required: true, max: 80 });
  const notes = cleanText(source.notes, "备注", { max: 500 });
  const category = cleanText(source.category || "习惯", "分类", { max: 20 });
  const points = parseInteger(source.points ?? 1, "积分", 0, 1000);
  const startDate = String(source.startDate || "");
  if (!isValidDate(startDate)) failure("开始日期无效");
  const endDate = source.endDate ? String(source.endDate) : null;
  if (endDate && (!isValidDate(endDate) || endDate < startDate)) failure("结束日期无效");
  const dueTime = source.dueTime ? String(source.dueTime) : null;
  if (!isValidTime(dueTime)) failure("提醒时间无效");
  const recurrence = String(source.recurrence || "once");
  if (!["once", "daily", "weekdays", "weekly"].includes(recurrence)) {
    failure("重复方式无效");
  }
  const weekdays =
    recurrence === "weekly" ? normalizedWeekdays(source.weekdays) : [];
  if (recurrence === "weekly" && weekdays.length === 0) {
    const date = new Date(`${startDate}T12:00:00Z`);
    const day = date.getUTCDay() || 7;
    weekdays.push(day);
  }
  return {
    title,
    memberId: Number(source.memberId),
    notes,
    category,
    points,
    dueTime,
    startDate,
    endDate,
    recurrence,
    weekdays: JSON.stringify(weekdays),
    requireApproval: source.requireApproval === false ? 0 : 1,
    evidenceRequired: source.evidenceRequired === false ? 0 : 1,
  };
}

function insertDemoData(db, familyId, parentId, child) {
  const created = nowIso();
  const tasks = [
    ["整理床铺", "起床后把自己的小天地整理好", "习惯", 2, "07:20", "daily", 0],
    ["认真完成作业", "先检查文具，再开始今天的作业", "学习", 5, "18:30", "weekdays", 1],
    ["阅读 20 分钟", "选一本喜欢的书，安静读完", "学习", 3, "20:00", "daily", 0],
    ["周末家务小帮手", "和家人一起收拾客厅", "家务", 4, "10:00", "weekly", 1],
  ];
  const today = dateInTimeZone("Asia/Shanghai");
  const insertTask = db.prepare(`
    INSERT INTO tasks
      (family_id, member_id, title, notes, category, task_type, workflow_status,
       points, due_time, start_date, end_date, recurrence, weekdays,
       require_approval, evidence_required, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, 'agreed', 'pending_acceptance', ?, ?, ?, NULL, ?, ?, 1, 1, ?, ?)
  `);
  for (const [title, notes, category, points, dueTime, recurrence, approval] of tasks) {
    const weekdays = recurrence === "weekly" ? "[6]" : "[]";
    insertTask.run(
      familyId,
      child.id,
      title,
      notes,
      category,
      points,
      dueTime,
      today,
      recurrence,
      weekdays,
      parentId,
      created
    );
  }
  const insertReward = db.prepare(`
    INSERT INTO rewards
      (family_id, title, description, icon, cost, stock, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  insertReward.run(familyId, "挑选周末电影", "全家一起看一部你选的电影", "🎬", 30, 9, created);
  insertReward.run(familyId, "额外游戏时间", "周末增加 30 分钟游戏时间", "🎮", 60, 12, created);
  insertReward.run(familyId, "亲子甜品约会", "和爸爸妈妈一起去吃喜欢的甜品", "🍦", 80, 6, created);
}

function createApplication({
  dbPath = process.env.DB_PATH || path.join(ROOT, "data", "family.db"),
  publicDir = PUBLIC_DIR,
  sessionSecure = process.env.COOKIE_SECURE === "true",
  uploadDir = process.env.UPLOAD_DIR ||
    path.join(dbPath === ":memory:" ? os.tmpdir() : path.dirname(dbPath), "uploads"),
} = {}) {
  const db = openDatabase(dbPath);

  function saveEvidenceImage(dataUrl) {
    if (!dataUrl) return null;
    const match = String(dataUrl).match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) failure("成果照片格式无效，请使用 JPG、PNG 或 WebP");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0) failure("成果照片内容为空");
    if (buffer.length > 4 * 1024 * 1024) failure("成果照片不能超过 4 MB");
    fs.mkdirSync(uploadDir, { recursive: true });
    const extension = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `${crypto.randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer, { flag: "wx" });
    return filename;
  }

  function removeEvidenceImage(filename) {
    if (!filename) return;
    try {
      fs.unlinkSync(path.join(uploadDir, path.basename(filename)));
    } catch {
      // A missing evidence file should not break the surrounding transaction.
    }
  }

  function saveAvatarImage(dataUrl) {
    if (!dataUrl) failure("请选择一张头像照片");
    const match = String(dataUrl).match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) failure("头像照片格式无效，请使用 JPG、PNG 或 WebP");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0) failure("头像照片内容为空");
    if (buffer.length > 4 * 1024 * 1024) failure("头像照片不能超过 4 MB");
    const avatarDir = path.join(uploadDir, "avatars");
    fs.mkdirSync(avatarDir, { recursive: true });
    const extension = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `${crypto.randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(avatarDir, filename), buffer, { flag: "wx" });
    return filename;
  }

  function removeAvatarImage(filename) {
    if (!filename) return;
    try {
      fs.unlinkSync(path.join(uploadDir, "avatars", path.basename(filename)));
    } catch {
      // Removing a missing prior avatar should not block the new upload.
    }
  }

  function currentUser(req) {
    const token = parseCookies(req.headers.cookie).session;
    if (!token) return null;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = db.prepare(`
      SELECT s.expires_at, m.*
      FROM sessions s JOIN members m ON m.id = s.member_id
      WHERE s.token_hash = ? AND m.active = 1
    `).get(tokenHash);
    if (!session) return null;
    if (session.expires_at <= nowIso()) {
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
      return null;
    }
    return session;
  }

  function issueSession(res, memberId) {
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    db.prepare(`
      INSERT INTO sessions (token_hash, member_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, memberId, expires.toISOString(), nowIso());
    const secure = sessionSecure ? "; Secure" : "";
    res.setHeader(
      "Set-Cookie",
      `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`
    );
  }

  function authContext(body) {
    const family = db.prepare("SELECT * FROM families ORDER BY id LIMIT 1").get();
    if (!family) {
      return { setupRequired: true, family: null, members: [] };
    }
    const members = db.prepare(`
      SELECT * FROM members WHERE family_id = ? AND active = 1 ORDER BY role = 'child', id
    `).all(family.id);
    return {
      setupRequired: false,
      family: { id: Number(family.id), name: family.name, timezone: family.timezone },
      members: members.map(publicMember),
      user: body.user ? publicMember(body.user) : null,
    };
  }

  async function routeApi(req, res, url) {
    const user = currentUser(req);
    const family = user ? getFamily(db, user.family_id) : null;
    const pathname = url.pathname;
    const method = req.method;

    if (method === "GET" && pathname === "/api/auth") {
      return sendJson(res, 200, authContext({ user }));
    }

    if (method === "POST" && pathname === "/api/setup") {
      if (db.prepare("SELECT COUNT(*) AS count FROM families").get().count > 0) {
        failure("家庭已经完成初始化", 409);
      }
      const body = await readJson(req);
      const familyName = cleanText(body.familyName, "家庭名称", { required: true, max: 40 });
      const parentName = cleanText(body.parentName, "家长称呼", { required: true, max: 20 });
      if (!validPin(body.pin)) failure("登录密码需为 4–8 位数字");
      const childName = cleanText(body.childName, "孩子称呼", { max: 20 });
      if (childName && !validPin(body.childPin)) failure("孩子登录密码需为 4–8 位数字");
      const result = withTransaction(db, () => {
        const familyId = Number(
          db.prepare("INSERT INTO families (name, timezone, created_at) VALUES (?, ?, ?)")
            .run(familyName, "Asia/Shanghai", nowIso()).lastInsertRowid
        );
        const parentPin = hashPin(body.pin);
        const parentId = Number(db.prepare(`
          INSERT INTO members
            (family_id, name, role, avatar, color, pin_hash, pin_salt, created_at)
          VALUES (?, ?, 'parent', '', '#47766F', ?, ?, ?)
        `).run(familyId, parentName, parentPin.hash, parentPin.salt, nowIso()).lastInsertRowid);
        let child = null;
        if (childName) {
          const childPin = hashPin(body.childPin);
          child = {
            id: Number(db.prepare(`
              INSERT INTO members
                (family_id, name, role, avatar, color, pin_hash, pin_salt, created_at)
              VALUES (?, ?, 'child', '', '#E36F52', ?, ?, ?)
            `).run(familyId, childName, childPin.hash, childPin.salt, nowIso()).lastInsertRowid),
            family_id: familyId,
          };
        }
        if (body.demoData === true && child) {
          insertDemoData(db, familyId, parentId, child);
        }
        return { parentId };
      });
      issueSession(res, result.parentId);
      return sendJson(res, 201, { ok: true });
    }

    if (method === "POST" && pathname === "/api/login") {
      const body = await readJson(req);
      const memberId = Number(body.memberId);
      const attemptKey = `${req.socket.remoteAddress}:${memberId}`;
      const attempts = (loginAttempts.get(attemptKey) || []).filter(
        (time) => time > Date.now() - 10 * 60 * 1000
      );
      if (attempts.length >= 8) failure("尝试次数过多，请 10 分钟后再试", 429);
      const member = db.prepare("SELECT * FROM members WHERE id = ? AND active = 1").get(memberId);
      if (!member || !validPin(body.pin) || !pinMatches(body.pin, member)) {
        attempts.push(Date.now());
        loginAttempts.set(attemptKey, attempts);
        failure("成员或密码不正确", 401);
      }
      loginAttempts.delete(attemptKey);
      db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(nowIso());
      issueSession(res, member.id);
      return sendJson(res, 200, { ok: true, user: publicMember(member) });
    }

    if (method === "POST" && pathname === "/api/logout") {
      const token = parseCookies(req.headers.cookie).session;
      if (token) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
      }
      res.setHeader(
        "Set-Cookie",
        `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${sessionSecure ? "; Secure" : ""}`
      );
      return sendJson(res, 200, { ok: true });
    }

    if (!user) failure("请先登录", 401);
    const today = dateInTimeZone(family.timezone);

    if (method === "GET" && pathname === "/api/dashboard") {
      const date = url.searchParams.get("date") || today;
      if (!isValidDate(date)) failure("日期无效");
      const start = addDays(today, -59);
      const rows = occurrenceRows(db, family.id, start, today);
      const todayRows = rows.filter((row) => row.date === date);
      const members = db.prepare(`
        SELECT * FROM members WHERE family_id = ? AND active = 1
        ORDER BY role = 'child', id
      `).all(family.id);
      const pendingCompletions = user.role === "parent"
        ? Number(db.prepare("SELECT COUNT(*) AS count FROM completions WHERE status = 'pending'").get().count)
        : 0;
      const pendingRedemptions = user.role === "parent"
        ? Number(db.prepare("SELECT COUNT(*) AS count FROM redemptions WHERE status = 'pending'").get().count)
        : 0;
      const taskInbox =
        user.role === "child"
          ? getTasks(db, family.id, user.id)
              .filter((task) =>
                ["pending_acceptance", "pending_approval", "rejected"].includes(task.workflow_status)
              )
              .map(taskJson)
          : [];
      const pendingTaskReviews = user.role === "parent"
        ? Number(db.prepare(`
            SELECT COUNT(*) AS count FROM tasks
            WHERE family_id = ? AND workflow_status = 'pending_approval' AND archived = 0
          `).get(family.id).count)
        : 0;
      const pendingAgreements = user.role === "parent"
        ? Number(db.prepare(`
            SELECT COUNT(*) AS count FROM tasks
            WHERE family_id = ? AND workflow_status = 'pending_acceptance' AND archived = 0
          `).get(family.id).count)
        : taskInbox.filter((task) => task.workflowStatus === "pending_acceptance").length;
      const deductionRules = getDeductionRules(
        db,
        family.id,
        user.role === "child" ? user.id : null
      ).map((rule) =>
        deductionRuleJson(rule, getDeductionEvents(db, rule.id, 5))
      );
      const deductionInbox = user.role === "child"
        ? deductionRules.filter((rule) => rule.status === "pending_acceptance")
        : [];
      const activeDeductionRules = user.role === "child"
        ? deductionRules.filter((rule) => rule.status === "active")
        : [];
      const pendingDeductionAgreements = user.role === "child"
        ? deductionInbox.length
        : Number(db.prepare(`
            SELECT COUNT(*) AS count FROM deduction_rules
            WHERE family_id = ? AND status = 'pending_acceptance' AND archived = 0
          `).get(family.id).count);
      const recentPoints = db.prepare(`
        SELECT id, delta, balance_after, reason, type, created_at
        FROM point_transactions WHERE member_id = ?
        ORDER BY id DESC LIMIT 8
      `).all(user.id);
      return sendJson(res, 200, {
        date,
        today,
        family: { id: Number(family.id), name: family.name },
        user: publicMember(user),
        tasks: todayRows
          .filter((row) => row.memberId === user.id)
          .map((row) => ({ ...row, overdue: row.status === "todo" && date < today })),
        familyTasks: todayRows,
        taskInbox,
        deductionInbox,
        deductionRules: activeDeductionRules,
        members: members.map((member) => ({
          ...memberDailyStats(member, todayRows),
          streak: calculateStreak(member.id, start, today, rows),
        })),
        reviewCount: pendingCompletions + pendingRedemptions + pendingTaskReviews,
        pendingCompletions,
        pendingRedemptions,
        pendingTaskReviews,
        pendingAgreements,
        pendingDeductionAgreements,
        recentPoints: recentPoints.map((item) => ({
          ...item,
          id: Number(item.id),
        })),
      });
    }

    if (method === "GET" && pathname === "/api/occurrences") {
      const start = url.searchParams.get("start");
      const end = url.searchParams.get("end");
      if (!isValidDate(start) || !isValidDate(end) || start > end) failure("日期范围无效");
      if (dateRange(start, end, 94).length > 93) failure("最多查询 3 个月");
      const memberId = url.searchParams.get("memberId");
      if (memberId && !memberInFamily(db, Number(memberId), family.id)) failure("家庭成员不存在", 404);
      return sendJson(res, 200, {
        occurrences: occurrenceRows(
          db,
          family.id,
          start,
          end,
          memberId ? Number(memberId) : null
        ),
      });
    }

    if (method === "GET" && pathname === "/api/tasks") {
      const tasks = getTasks(db, family.id, user.role === "child" ? user.id : null);
      return sendJson(res, 200, { tasks: tasks.map(taskJson) });
    }

    if (method === "POST" && pathname === "/api/tasks") {
      const body = await readJson(req);
      if (user.role === "child") body.memberId = user.id;
      const task = normalizeTaskPayload(body);
      const member = memberInFamily(db, task.memberId, family.id);
      if (!member.active) failure("该成员已停用");
      if (user.role === "child" && member.id !== user.id) failure("不能为其他成员创建任务", 403);
      const taskType = user.role === "parent" ? "agreed" : "custom";
      const workflowStatus =
        user.role === "child"
          ? "pending_approval"
          : member.role === "child"
            ? "pending_acceptance"
            : "active";
      const requireApproval = member.role === "child" ? 1 : task.requireApproval;
      const evidenceRequired = member.role === "child" ? 1 : task.evidenceRequired;
      const acceptedAt = workflowStatus === "active" ? nowIso() : null;
      const id = Number(db.prepare(`
        INSERT INTO tasks
          (family_id, member_id, title, notes, category, task_type, workflow_status,
           points, due_time, start_date, end_date, recurrence, weekdays,
           require_approval, evidence_required, created_by, accepted_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        family.id,
        task.memberId,
        task.title,
        task.notes,
        task.category,
        taskType,
        workflowStatus,
        task.points,
        task.dueTime,
        task.startDate,
        task.endDate,
        task.recurrence,
        task.weekdays,
        requireApproval,
        evidenceRequired,
        user.id,
        acceptedAt,
        nowIso()
      ).lastInsertRowid);
      const created = getTaskRow(db, family.id, id);
      return sendJson(res, 201, { task: taskJson(created) });
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (taskMatch && (method === "PUT" || method === "DELETE")) {
      const taskId = Number(taskMatch[1]);
      const current = db
        .prepare("SELECT * FROM tasks WHERE id = ? AND family_id = ?")
        .get(taskId, family.id);
      if (!current) failure("日程不存在", 404);
      if (method === "DELETE") {
        if (
          user.role === "child" &&
          (current.task_type !== "custom" || current.created_by !== user.id)
        ) {
          failure("孩子不能修改约定任务清单", 403);
        }
        db.prepare("UPDATE tasks SET archived = 1 WHERE id = ?").run(taskId);
        return sendJson(res, 200, { ok: true });
      }
      if (
        user.role === "child" &&
        (current.task_type !== "custom" || current.created_by !== user.id)
      ) {
        failure("约定任务由家长维护，孩子只能按约定上报成果", 403);
      }
      if (user.role === "parent" && current.task_type === "custom") {
        failure("孩子自建任务的内容由孩子调整，家长可在审核时退回并填写意见", 403);
      }
      const body = await readJson(req);
      if (user.role === "child") body.memberId = user.id;
      const task = normalizeTaskPayload(body, current);
      const member = memberInFamily(db, task.memberId, family.id);
      if (!member.active) failure("该成员已停用");
      const workflowStatus =
        user.role === "child"
          ? "pending_approval"
          : member.role === "child"
            ? "pending_acceptance"
            : "active";
      const acceptedAt = workflowStatus === "active" ? nowIso() : null;
      db.prepare(`
        UPDATE tasks SET
          member_id = ?, title = ?, notes = ?, category = ?, points = ?,
          due_time = ?, start_date = ?, end_date = ?, recurrence = ?,
          weekdays = ?, require_approval = ?, evidence_required = ?,
          workflow_status = ?, accepted_at = ?, review_note = '',
          reviewed_by = NULL, reviewed_at = NULL
        WHERE id = ?
      `).run(
        task.memberId,
        task.title,
        task.notes,
        task.category,
        task.points,
        task.dueTime,
        task.startDate,
        task.endDate,
        task.recurrence,
        task.weekdays,
        member.role === "child" ? 1 : task.requireApproval,
        member.role === "child" ? 1 : task.evidenceRequired,
        workflowStatus,
        acceptedAt,
        taskId
      );
      const updated = getTaskRow(db, family.id, taskId);
      return sendJson(res, 200, { task: taskJson(updated) });
    }

    const taskAcceptMatch = pathname.match(/^\/api\/tasks\/(\d+)\/accept$/);
    if (taskAcceptMatch && method === "POST") {
      if (user.role !== "child") failure("只有孩子可以接受约定任务", 403);
      const task = getTaskRow(db, family.id, Number(taskAcceptMatch[1]));
      if (!task || task.member_id !== user.id) failure("约定任务不存在", 404);
      if (task.task_type !== "agreed") failure("这不是约定任务");
      if (task.workflow_status !== "pending_acceptance") failure("这份约定已经处理过了");
      db.prepare(`
        UPDATE tasks SET workflow_status = 'active', accepted_at = ?, review_note = ''
        WHERE id = ?
      `).run(nowIso(), task.id);
      return sendJson(res, 200, { task: taskJson(getTaskRow(db, family.id, task.id)) });
    }

    const taskReviewMatch = pathname.match(/^\/api\/tasks\/(\d+)\/review$/);
    if (taskReviewMatch && method === "POST") {
      ensureParent(user);
      const body = await readJson(req);
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : null;
      if (!status) failure("审核结果无效");
      const task = getTaskRow(db, family.id, Number(taskReviewMatch[1]));
      if (!task) failure("任务不存在", 404);
      if (task.task_type !== "custom") failure("只有孩子自建任务需要审核");
      if (task.workflow_status !== "pending_approval") failure("这条任务已经审核过了");
      const workflowStatus = status === "approved" ? "active" : "rejected";
      db.prepare(`
        UPDATE tasks SET
          workflow_status = ?, accepted_at = ?, review_note = ?,
          reviewed_by = ?, reviewed_at = ?
        WHERE id = ?
      `).run(
        workflowStatus,
        workflowStatus === "active" ? nowIso() : null,
        cleanText(body.note, "审核意见", { max: 300 }),
        user.id,
        nowIso(),
        task.id
      );
      return sendJson(res, 200, {
        task: taskJson(getTaskRow(db, family.id, task.id)),
      });
    }

    if (method === "GET" && pathname === "/api/deduction-rules") {
      const rules = getDeductionRules(
        db,
        family.id,
        user.role === "child" ? user.id : null
      ).map((rule) => deductionRuleJson(rule, getDeductionEvents(db, rule.id)));
      return sendJson(res, 200, { rules });
    }

    if (method === "POST" && pathname === "/api/deduction-rules") {
      ensureParent(user);
      const body = await readJson(req);
      const member = memberInFamily(db, Number(body.memberId), family.id);
      if (!member.active) failure("该成员已停用");
      if (member.role !== "child") failure("扣分项只能分配给家庭中的孩子");
      const title = cleanText(body.title, "扣分项名称", { required: true, max: 80 });
      const description = cleanText(body.description, "说明", { max: 500 });
      const points = parseInteger(body.points, "扣分分值", 1, 1000);
      const warningLimit = parseInteger(body.warningLimit ?? 3, "警告次数", 0, 99);
      const now = nowIso();
      const id = Number(db.prepare(`
        INSERT INTO deduction_rules
          (family_id, member_id, title, description, points, warning_limit,
           warnings_used, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'pending_acceptance', ?, ?, ?)
      `).run(
        family.id,
        member.id,
        title,
        description,
        points,
        warningLimit,
        user.id,
        now,
        now
      ).lastInsertRowid);
      const rule = getDeductionRules(db, family.id).find((item) => item.id === id);
      return sendJson(res, 201, {
        rule: deductionRuleJson(rule, getDeductionEvents(db, rule.id)),
      });
    }

    const deductionActionMatch = pathname.match(
      /^\/api\/deduction-rules\/(\d+)\/(accept|record|reset)$/
    );
    if (deductionActionMatch && method === "POST") {
      const ruleId = Number(deductionActionMatch[1]);
      const action = deductionActionMatch[2];
      const rule = getDeductionRules(db, family.id)
        .find((item) => item.id === ruleId);
      if (!rule) failure("扣分项不存在", 404);

      if (action === "accept") {
        if (user.role !== "child" || rule.member_id !== user.id) {
          failure("只有被约定的孩子可以接受扣分项", 403);
        }
        if (rule.status !== "pending_acceptance") failure("这个扣分项已经接受过了");
        db.prepare(`
          UPDATE deduction_rules SET status = 'active', accepted_at = ?, updated_at = ?
          WHERE id = ?
        `).run(nowIso(), nowIso(), rule.id);
        return sendJson(res, 200, {
          rule: deductionRuleJson(
            getDeductionRules(db, family.id).find((item) => item.id === rule.id),
            getDeductionEvents(db, rule.id)
          ),
        });
      }

      ensureParent(user);
      if (rule.status !== "active") failure("孩子接受扣分项后才能记录", 409);
      const body = await readJson(req);
      if (action === "reset") {
        withTransaction(db, () => {
          db.prepare(`
            UPDATE deduction_rules
            SET warnings_used = 0, updated_at = ?
            WHERE id = ?
          `).run(nowIso(), rule.id);
          const member = memberInFamily(db, rule.member_id, family.id);
          db.prepare(`
            INSERT INTO deduction_events
              (rule_id, member_id, event_type, points_delta, warning_after,
               balance_after, note, created_by, created_at)
            VALUES (?, ?, 'reset', 0, 0, ?, ?, ?, ?)
          `).run(
            rule.id,
            rule.member_id,
            member.points,
            cleanText(body.note || "家长开启新一轮警告", "备注", { max: 200 }),
            user.id,
            nowIso()
          );
        });
        return sendJson(res, 200, {
          result: "reset",
          rule: deductionRuleJson(
            getDeductionRules(db, family.id).find((item) => item.id === rule.id),
            getDeductionEvents(db, rule.id)
          ),
        });
      }

      const note = cleanText(body.note, "本次记录说明", { max: 200 });
      const result = withTransaction(db, () => {
        const freshRule = db.prepare(`
          SELECT * FROM deduction_rules
          WHERE id = ? AND family_id = ? AND archived = 0
        `).get(rule.id, family.id);
        if (!freshRule) failure("扣分项不存在", 404);
        if (freshRule.warnings_used < freshRule.warning_limit) {
          const warningAfter = Number(freshRule.warnings_used) + 1;
          db.prepare(`
            UPDATE deduction_rules SET warnings_used = ?, updated_at = ? WHERE id = ?
          `).run(warningAfter, nowIso(), freshRule.id);
          const member = memberInFamily(db, freshRule.member_id, family.id);
          const eventId = Number(db.prepare(`
            INSERT INTO deduction_events
              (rule_id, member_id, event_type, points_delta, warning_after,
               balance_after, note, created_by, created_at)
            VALUES (?, ?, 'warning', 0, ?, ?, ?, ?, ?)
          `).run(
            freshRule.id,
            freshRule.member_id,
            warningAfter,
            member.points,
            note,
            user.id,
            nowIso()
          ).lastInsertRowid);
          return {
            result: "warning",
            eventId,
            warningAfter,
            remainingWarnings: Math.max(0, Number(freshRule.warning_limit) - warningAfter),
            deducted: 0,
          };
        }

        const member = memberInFamily(db, freshRule.member_id, family.id);
        const deducted = Math.min(Number(freshRule.points), Number(member.points));
        if (deducted > 0) {
          addPointTransaction(db, member, -deducted, {
            reason: `扣分项：${freshRule.title}`,
            type: "deduction",
            referenceType: "deduction_rule",
            referenceId: freshRule.id,
            createdBy: user.id,
          });
        }
        const balanceAfter = Number(member.points) - deducted;
        const eventId = Number(db.prepare(`
          INSERT INTO deduction_events
            (rule_id, member_id, event_type, points_delta, warning_after,
             balance_after, note, created_by, created_at)
          VALUES (?, ?, 'deduction', ?, ?, ?, ?, ?, ?)
        `).run(
          freshRule.id,
          freshRule.member_id,
          -deducted,
          freshRule.warnings_used,
          balanceAfter,
          note,
          user.id,
          nowIso()
        ).lastInsertRowid);
        return {
          result: "deduction",
          eventId,
          warningAfter: Number(freshRule.warnings_used),
          remainingWarnings: 0,
          deducted,
          balanceAfter,
        };
      });
      return sendJson(res, 200, {
        ...result,
        rule: deductionRuleJson(
          getDeductionRules(db, family.id).find((item) => item.id === rule.id),
          getDeductionEvents(db, rule.id)
        ),
      });
    }

    const deductionRuleMatch = pathname.match(/^\/api\/deduction-rules\/(\d+)$/);
    if (deductionRuleMatch && (method === "PATCH" || method === "DELETE")) {
      ensureParent(user);
      const ruleId = Number(deductionRuleMatch[1]);
      const rule = getDeductionRules(db, family.id)
        .find((item) => item.id === ruleId);
      if (!rule) failure("扣分项不存在", 404);
      if (method === "DELETE") {
        db.prepare("UPDATE deduction_rules SET archived = 1 WHERE id = ?").run(rule.id);
        return sendJson(res, 200, { ok: true });
      }
      const body = await readJson(req);
      const title = cleanText(body.title ?? rule.title, "扣分项名称", {
        required: true,
        max: 80,
      });
      const description = cleanText(body.description ?? rule.description, "说明", {
        max: 500,
      });
      const points = parseInteger(body.points ?? rule.points, "扣分分值", 1, 1000);
      const warningLimit = parseInteger(
        body.warningLimit ?? rule.warning_limit,
        "警告次数",
        0,
        99
      );
      db.prepare(`
        UPDATE deduction_rules SET
          title = ?, description = ?, points = ?, warning_limit = ?,
          warnings_used = 0, status = 'pending_acceptance', accepted_at = NULL,
          updated_at = ?
        WHERE id = ?
      `).run(title, description, points, warningLimit, nowIso(), rule.id);
      return sendJson(res, 200, {
        rule: deductionRuleJson(
          getDeductionRules(db, family.id).find((item) => item.id === rule.id),
          getDeductionEvents(db, rule.id)
        ),
      });
    }

    if (method === "GET" && pathname === "/api/family") {
      const members = db.prepare(`
        SELECT * FROM members WHERE family_id = ? ORDER BY active DESC, role = 'child', id
      `).all(family.id);
      return sendJson(res, 200, {
        family: { id: Number(family.id), name: family.name, timezone: family.timezone },
        user: publicMember(user),
        members: members.map(publicMember),
      });
    }

    if (method === "PATCH" && pathname === "/api/family") {
      ensureParent(user);
      const body = await readJson(req);
      const name = cleanText(body.name, "家庭名称", { required: true, max: 40 });
      db.prepare("UPDATE families SET name = ? WHERE id = ?").run(name, family.id);
      return sendJson(res, 200, { family: { id: Number(family.id), name, timezone: family.timezone } });
    }

    if (method === "POST" && pathname === "/api/members") {
      ensureParent(user);
      const body = await readJson(req);
      const name = cleanText(body.name, "成员称呼", { required: true, max: 20 });
      const role = body.role === "parent" ? "parent" : "child";
      if (!validPin(body.pin)) failure("登录密码需为 4–8 位数字");
      const existing = db
        .prepare("SELECT id FROM members WHERE family_id = ? AND lower(name) = lower(?)")
        .get(family.id, name);
      if (existing) failure("家庭里已经有同名成员");
      const color = /^#[0-9a-fA-F]{6}$/.test(String(body.color || ""))
        ? body.color
        : role === "parent"
          ? "#47766F"
          : "#E36F52";
      const pin = hashPin(body.pin);
      const id = Number(db.prepare(`
        INSERT INTO members
          (family_id, name, role, avatar, color, pin_hash, pin_salt, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(family.id, name, role, "", color, pin.hash, pin.salt, nowIso()).lastInsertRowid);
      return sendJson(res, 201, {
        member: publicMember(memberInFamily(db, id, family.id)),
      });
    }

    const avatarMatch = pathname.match(/^\/api\/members\/(\d+)\/avatar$/);
    if (avatarMatch && method === "GET") {
      const member = memberInFamily(db, Number(avatarMatch[1]), family.id);
      if (!member.avatar_path) failure("该成员还没有设置头像照片", 404);
      const filePath = path.join(
        uploadDir,
        "avatars",
        path.basename(member.avatar_path)
      );
      if (!fs.existsSync(filePath)) failure("头像照片已不存在", 404);
      const extension = path.extname(filePath).toLowerCase();
      const contentType =
        extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": fs.statSync(filePath).size,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      });
      return fs.createReadStream(filePath).pipe(res);
    }

    const memberMatch = pathname.match(/^\/api\/members\/(\d+)$/);
    if (memberMatch && method === "PATCH") {
      ensureParent(user);
      const member = memberInFamily(db, Number(memberMatch[1]), family.id);
      const body = await readJson(req);
      const name = cleanText(body.name ?? member.name, "成员称呼", { required: true, max: 20 });
      const duplicate = db.prepare(`
        SELECT id FROM members
        WHERE family_id = ? AND lower(name) = lower(?) AND id != ?
      `).get(family.id, name, member.id);
      if (duplicate) failure("家庭里已经有同名成员");
      const color = /^#[0-9a-fA-F]{6}$/.test(String(body.color ?? member.color))
        ? (body.color ?? member.color)
        : member.color;
      const active = body.active === undefined ? Number(member.active) : body.active ? 1 : 0;
      if (!active && member.role === "parent") {
        const parentCount = Number(db.prepare(`
          SELECT COUNT(*) AS count FROM members
          WHERE family_id = ? AND role = 'parent' AND active = 1
        `).get(family.id).count);
        if (parentCount <= 1) failure("至少要保留一位启用中的家长");
      }
      let pinUpdate = "";
      const parameters = [name, color, active];
      if (body.pin) {
        if (!validPin(body.pin)) failure("登录密码需为 4–8 位数字");
        const pin = hashPin(body.pin);
        pinUpdate = ", pin_hash = ?, pin_salt = ?";
        parameters.push(pin.hash, pin.salt);
      }
      parameters.push(member.id);
      db.prepare(`
        UPDATE members SET name = ?, color = ?, active = ?
        ${pinUpdate} WHERE id = ?
      `).run(...parameters);
      return sendJson(res, 200, {
        member: publicMember(memberInFamily(db, member.id, family.id)),
      });
    }

    if (method === "POST" && pathname === "/api/me/pin") {
      const body = await readJson(req);
      if (!pinMatches(body.currentPin, user)) failure("当前密码不正确", 403);
      if (!validPin(body.newPin)) failure("新密码需为 4–8 位数字");
      const pin = hashPin(body.newPin);
      db.prepare("UPDATE members SET pin_hash = ?, pin_salt = ? WHERE id = ?")
        .run(pin.hash, pin.salt, user.id);
      db.prepare("DELETE FROM sessions WHERE member_id = ?").run(user.id);
      issueSession(res, user.id);
      return sendJson(res, 200, { ok: true });
    }

    if (method === "PATCH" && pathname === "/api/me/profile") {
      const body = await readJson(req);
      const avatarPath = saveAvatarImage(body.avatarImage);
      const previousAvatar = user.avatar_path;
      db.prepare("UPDATE members SET avatar = '', avatar_path = ? WHERE id = ?")
        .run(avatarPath, user.id);
      if (previousAvatar && previousAvatar !== avatarPath) {
        removeAvatarImage(previousAvatar);
      }
      return sendJson(res, 200, {
        member: publicMember(memberInFamily(db, user.id, family.id)),
      });
    }

    if (method === "DELETE" && pathname === "/api/me/avatar") {
      const previousAvatar = user.avatar_path;
      db.prepare("UPDATE members SET avatar = '', avatar_path = NULL WHERE id = ?")
        .run(user.id);
      removeAvatarImage(previousAvatar);
      return sendJson(res, 200, {
        member: publicMember(memberInFamily(db, user.id, family.id)),
      });
    }

    if (method === "POST" && pathname === "/api/points/adjust") {
      ensureParent(user);
      const body = await readJson(req);
      const member = memberInFamily(db, Number(body.memberId), family.id);
      const delta = parseInteger(body.delta, "调整积分", -1000, 1000);
      if (delta === 0) failure("调整积分不能为 0");
      const reason = cleanText(body.reason || (delta > 0 ? "家庭奖励" : "积分调整"), "原因", {
        required: true,
        max: 100,
      });
      const balance = withTransaction(db, () =>
        addPointTransaction(db, member, delta, {
          reason,
          type: "manual",
          createdBy: user.id,
        })
      );
      return sendJson(res, 200, { points: balance });
    }

    const evidenceMatch = pathname.match(/^\/api\/completions\/(\d+)\/evidence$/);
    if (evidenceMatch && method === "GET") {
      const completion = db.prepare(`
        SELECT c.*, t.family_id
        FROM completions c JOIN tasks t ON t.id = c.task_id
        WHERE c.id = ? AND t.family_id = ?
      `).get(Number(evidenceMatch[1]), family.id);
      if (!completion) failure("成果记录不存在", 404);
      if (user.role === "child" && completion.member_id !== user.id) failure("无权查看", 403);
      if (!completion.evidence_path) failure("没有上传成果照片", 404);
      const filename = path.basename(completion.evidence_path);
      const filePath = path.join(uploadDir, filename);
      if (!fs.existsSync(filePath)) failure("成果照片已不存在", 404);
      const extension = path.extname(filename).toLowerCase();
      const contentType =
        extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": fs.statSync(filePath).size,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      });
      return fs.createReadStream(filePath).pipe(res);
    }

    if (method === "GET" && pathname === "/api/completions") {
      ensureParent(user);
      const status = url.searchParams.get("status") || "pending";
      if (!["pending", "approved", "rejected"].includes(status)) failure("审核状态无效");
      const rows = db.prepare(`
        SELECT c.*, t.title, t.category, t.due_time, t.family_id,
               m.name AS member_name, m.avatar AS member_avatar,
               m.avatar_path AS member_avatar_path, m.color AS member_color
        FROM completions c
        JOIN tasks t ON t.id = c.task_id
        JOIN members m ON m.id = c.member_id
        WHERE t.family_id = ? AND c.status = ?
        ORDER BY c.completed_at DESC LIMIT 100
      `).all(family.id, status);
      return sendJson(res, 200, {
        completions: rows.map((row) => ({
          id: Number(row.id),
          taskId: Number(row.task_id),
          memberId: Number(row.member_id),
          memberName: row.member_name,
          memberAvatar: row.member_avatar,
          memberAvatarUrl: row.member_avatar_path
            ? `/api/members/${row.member_id}/avatar?v=${encodeURIComponent(path.basename(row.member_avatar_path))}`
            : null,
          memberColor: row.member_color,
          title: row.title,
          category: row.category,
          dueTime: row.due_time,
          date: row.occurrence_date,
          status: row.status,
          points: Number(row.points),
          completedAt: row.completed_at,
          reviewNote: row.review_note,
          evidenceNote: row.evidence_note,
          hasEvidence: Boolean(row.evidence_path),
          evidenceUrl: row.evidence_path
            ? `/api/completions/${row.id}/evidence`
            : null,
        })),
      });
    }

    if (method === "POST" && pathname === "/api/occurrences/complete") {
      const body = await readJson(req);
      const taskId = Number(body.taskId);
      const date = String(body.date || "");
      if (!isValidDate(date)) failure("完成日期无效");
      const task = db.prepare(`
        SELECT * FROM tasks WHERE id = ? AND family_id = ? AND archived = 0
      `).get(taskId, family.id);
      if (!task) failure("日程不存在", 404);
      if (task.workflow_status !== "active") failure("任务尚未生效，暂时不能上报", 409);
      if (!occursOn(task, date)) failure("该日期没有这项日程");
      if (user.role === "child" && task.member_id !== user.id) failure("不能操作其他成员的日程", 403);
      if (date > today) failure("不能提前完成未来的日程");
      const assigned = memberInFamily(db, task.member_id, family.id);
      const existing = db.prepare(`
        SELECT * FROM completions
        WHERE task_id = ? AND member_id = ? AND occurrence_date = ?
      `).get(task.id, task.member_id, date);
      if (existing && existing.status !== "rejected") {
        failure(existing.status === "approved" ? "这项日程已经完成" : "这项日程正在等待家长审核", 409);
      }
      const evidenceNote = cleanText(body.evidenceNote, "完成成果", { max: 1000 });
      if (task.evidence_required && !evidenceNote && !body.evidenceImage) {
        failure("请填写完成成果，或上传一张成果照片");
      }
      const newEvidencePath = saveEvidenceImage(body.evidenceImage);
      const status =
        user.role === "parent" || !task.require_approval ? "approved" : "pending";
      let completionId;
      try {
        completionId = withTransaction(db, () => {
          let id;
          if (existing) {
            db.prepare(`
              UPDATE completions SET
                status = ?, completed_at = ?, reviewed_by = ?, reviewed_at = ?,
                review_note = '', evidence_note = ?, evidence_path = ?
              WHERE id = ?
            `).run(
              status,
              nowIso(),
              status === "approved" ? user.id : null,
              status === "approved" ? nowIso() : null,
              evidenceNote,
              newEvidencePath,
              existing.id
            );
            id = Number(existing.id);
          } else {
            id = Number(db.prepare(`
              INSERT INTO completions
                (task_id, member_id, occurrence_date, status, points, completed_at,
                 reviewed_by, reviewed_at, evidence_note, evidence_path)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              task.id,
              task.member_id,
              date,
              status,
              task.points,
              nowIso(),
              status === "approved" ? user.id : null,
              status === "approved" ? nowIso() : null,
              evidenceNote,
              newEvidencePath
            ).lastInsertRowid);
          }
          if (status === "approved") {
            addPointTransaction(db, assigned, Number(task.points), {
              reason: `完成：${task.title}`,
              type: "task",
              referenceType: "completion",
              referenceId: id,
              createdBy: user.id,
            });
          }
          return id;
        });
      } catch (error) {
        removeEvidenceImage(newEvidencePath);
        throw error;
      }
      if (existing?.evidence_path && existing.evidence_path !== newEvidencePath) {
        removeEvidenceImage(existing.evidence_path);
      }
      return sendJson(res, 200, {
        completionId,
        status,
        points: status === "approved" ? Number(task.points) : 0,
      });
    }

    const reviewMatch = pathname.match(/^\/api\/completions\/(\d+)\/review$/);
    if (reviewMatch && method === "POST") {
      ensureParent(user);
      const body = await readJson(req);
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : null;
      if (!status) failure("审核结果无效");
      const completion = db.prepare(`
        SELECT c.*, t.title, t.family_id, t.member_id AS assigned_member_id
        FROM completions c JOIN tasks t ON t.id = c.task_id
        WHERE c.id = ? AND t.family_id = ?
      `).get(Number(reviewMatch[1]), family.id);
      if (!completion) failure("完成记录不存在", 404);
      if (completion.status !== "pending") failure("这条记录已经审核过了");
      const assigned = memberInFamily(db, completion.member_id, family.id);
      withTransaction(db, () => {
        db.prepare(`
          UPDATE completions SET
            status = ?, reviewed_by = ?, reviewed_at = ?, review_note = ?
          WHERE id = ?
        `).run(
          status,
          user.id,
          nowIso(),
          cleanText(body.note, "审核备注", { max: 200 }),
          completion.id
        );
        if (status === "approved") {
          addPointTransaction(db, assigned, Number(completion.points), {
            reason: `审核通过：${completion.title}`,
            type: "task",
            referenceType: "completion",
            referenceId: completion.id,
            createdBy: user.id,
          });
        }
      });
      return sendJson(res, 200, { ok: true, status });
    }

    if (method === "GET" && pathname === "/api/rewards") {
      const rewards = db.prepare(`
        SELECT * FROM rewards WHERE family_id = ? AND (active = 1 OR ? = 'parent')
        ORDER BY active DESC, cost, id
      `).all(family.id, user.role);
      const redemptions = db.prepare(`
        SELECT r.*, w.title, w.icon, m.name AS member_name,
               m.avatar AS member_avatar, m.avatar_path AS member_avatar_path
        FROM redemptions r
        JOIN rewards w ON w.id = r.reward_id
        JOIN members m ON m.id = r.member_id
        WHERE w.family_id = ? ${user.role === "child" ? "AND r.member_id = ?" : ""}
        ORDER BY r.id DESC LIMIT 50
      `).all(family.id, ...(user.role === "child" ? [user.id] : []));
      return sendJson(res, 200, {
        rewards: rewards.map((reward) => ({
          id: Number(reward.id),
          title: reward.title,
          description: reward.description,
          icon: reward.icon,
          cost: Number(reward.cost),
          stock: Number(reward.stock),
          active: Boolean(reward.active),
        })),
        redemptions: redemptions.map((item) => ({
          id: Number(item.id),
          rewardId: Number(item.reward_id),
          memberId: Number(item.member_id),
          memberName: item.member_name,
          memberAvatar: item.member_avatar,
          memberAvatarUrl: item.member_avatar_path
            ? `/api/members/${item.member_id}/avatar?v=${encodeURIComponent(path.basename(item.member_avatar_path))}`
            : null,
          title: item.title,
          icon: item.icon,
          cost: Number(item.cost),
          status: item.status,
          requestedAt: item.requested_at,
          note: item.note,
        })),
      });
    }

    if (method === "POST" && pathname === "/api/rewards") {
      ensureParent(user);
      const body = await readJson(req);
      const title = cleanText(body.title, "奖励名称", { required: true, max: 60 });
      const description = cleanText(body.description, "奖励说明", { max: 200 });
      const icon = cleanText(body.icon || "🎁", "奖励图标", { max: 8 });
      const cost = parseInteger(body.cost, "所需积分", 1, 100000);
      const stock = parseInteger(body.stock ?? 99, "库存", 0, 9999);
      const id = Number(db.prepare(`
        INSERT INTO rewards
          (family_id, title, description, icon, cost, stock, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(family.id, title, description, icon, cost, stock, nowIso()).lastInsertRowid);
      return sendJson(res, 201, {
        reward: { id, title, description, icon, cost, stock, active: true },
      });
    }

    const rewardMatch = pathname.match(/^\/api\/rewards\/(\d+)$/);
    if (rewardMatch && method === "PUT") {
      ensureParent(user);
      const rewardId = Number(rewardMatch[1]);
      const current = db.prepare("SELECT * FROM rewards WHERE id = ? AND family_id = ?")
        .get(rewardId, family.id);
      if (!current) failure("奖励不存在", 404);
      const body = await readJson(req);
      const title = cleanText(body.title ?? current.title, "奖励名称", { required: true, max: 60 });
      const description = cleanText(body.description ?? current.description, "奖励说明", { max: 200 });
      const icon = cleanText(body.icon ?? current.icon, "奖励图标", { max: 8 });
      const cost = parseInteger(body.cost ?? current.cost, "所需积分", 1, 100000);
      const stock = parseInteger(body.stock ?? current.stock, "库存", 0, 9999);
      const active = body.active === undefined ? Number(current.active) : body.active ? 1 : 0;
      db.prepare(`
        UPDATE rewards SET title = ?, description = ?, icon = ?, cost = ?,
          stock = ?, active = ? WHERE id = ?
      `).run(title, description, icon, cost, stock, active, rewardId);
      return sendJson(res, 200, {
        reward: { id: rewardId, title, description, icon, cost, stock, active: Boolean(active) },
      });
    }

    if (rewardMatch && method === "DELETE") {
      ensureParent(user);
      db.prepare("UPDATE rewards SET active = 0 WHERE id = ? AND family_id = ?")
        .run(Number(rewardMatch[1]), family.id);
      return sendJson(res, 200, { ok: true });
    }

    const redeemMatch = pathname.match(/^\/api\/rewards\/(\d+)\/redeem$/);
    if (redeemMatch && method === "POST") {
      const reward = db.prepare("SELECT * FROM rewards WHERE id = ? AND family_id = ?")
        .get(Number(redeemMatch[1]), family.id);
      if (!reward || !reward.active) failure("奖励已下架", 404);
      if (reward.stock < 1) failure("这项奖励暂时没有库存");
      const body = await readJson(req);
      const memberId = user.role === "parent" && body.memberId ? Number(body.memberId) : user.id;
      const member = memberInFamily(db, memberId, family.id);
      if (!member.active) failure("该成员已停用");
      const status = member.role === "parent" ? "approved" : "pending";
      const redemptionId = withTransaction(db, () => {
        const freshReward = db.prepare("SELECT * FROM rewards WHERE id = ?").get(reward.id);
        if (freshReward.stock < 1) failure("这项奖励暂时没有库存");
        if (member.points < freshReward.cost) failure("积分还不够，再完成几个日程吧");
        db.prepare("UPDATE rewards SET stock = stock - 1 WHERE id = ?").run(reward.id);
        const id = Number(db.prepare(`
          INSERT INTO redemptions
            (reward_id, member_id, cost, status, requested_at, reviewed_by, reviewed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          reward.id,
          member.id,
          reward.cost,
          status,
          nowIso(),
          status === "approved" ? user.id : null,
          status === "approved" ? nowIso() : null
        ).lastInsertRowid);
        addPointTransaction(db, member, -Number(reward.cost), {
          reason: `兑换：${reward.title}`,
          type: "reward",
          referenceType: "redemption",
          referenceId: id,
          createdBy: user.id,
        });
        return id;
      });
      return sendJson(res, 200, { redemptionId, status, points: Number(member.points) - Number(reward.cost) });
    }

    if (method === "GET" && pathname === "/api/redemptions") {
      const status = url.searchParams.get("status");
      const rows = db.prepare(`
        SELECT r.*, w.title, w.icon, m.name AS member_name,
               m.avatar AS member_avatar, m.avatar_path AS member_avatar_path
        FROM redemptions r
        JOIN rewards w ON w.id = r.reward_id
        JOIN members m ON m.id = r.member_id
        WHERE w.family_id = ? ${status ? "AND r.status = ?" : ""}
          ${user.role === "child" ? "AND r.member_id = ?" : ""}
        ORDER BY r.id DESC LIMIT 100
      `).all(
        family.id,
        ...(status ? [status] : []),
        ...(user.role === "child" ? [user.id] : [])
      );
      return sendJson(res, 200, { redemptions: rows });
    }

    const redemptionReviewMatch = pathname.match(/^\/api\/redemptions\/(\d+)\/review$/);
    if (redemptionReviewMatch && method === "POST") {
      ensureParent(user);
      const body = await readJson(req);
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : null;
      if (!status) failure("审核结果无效");
      const redemption = db.prepare(`
        SELECT r.*, w.title, w.family_id, w.id AS reward_id
        FROM redemptions r JOIN rewards w ON w.id = r.reward_id
        WHERE r.id = ? AND w.family_id = ?
      `).get(Number(redemptionReviewMatch[1]), family.id);
      if (!redemption) failure("兑换记录不存在", 404);
      if (redemption.status !== "pending") failure("这条兑换记录已经处理过了");
      const member = memberInFamily(db, redemption.member_id, family.id);
      withTransaction(db, () => {
        db.prepare(`
          UPDATE redemptions SET status = ?, reviewed_by = ?, reviewed_at = ?, note = ?
          WHERE id = ?
        `).run(
          status,
          user.id,
          nowIso(),
          cleanText(body.note, "审核备注", { max: 200 }),
          redemption.id
        );
        if (status === "rejected") {
          db.prepare("UPDATE rewards SET stock = stock + 1 WHERE id = ?").run(redemption.reward_id);
          addPointTransaction(db, member, Number(redemption.cost), {
            reason: `兑换退回：${redemption.title}`,
            type: "reward_refund",
            referenceType: "redemption",
            referenceId: redemption.id,
            createdBy: user.id,
          });
        }
      });
      return sendJson(res, 200, { ok: true, status });
    }

    const redemptionCancelMatch = pathname.match(/^\/api\/redemptions\/(\d+)\/cancel$/);
    if (redemptionCancelMatch && method === "POST") {
      const redemption = db.prepare(`
        SELECT r.*, w.title, w.id AS reward_row_id
        FROM redemptions r JOIN rewards w ON w.id = r.reward_id
        WHERE r.id = ? AND w.family_id = ?
      `).get(Number(redemptionCancelMatch[1]), family.id);
      if (!redemption) failure("兑换记录不存在", 404);
      if (user.role === "child" && redemption.member_id !== user.id) failure("无权操作", 403);
      if (redemption.status !== "pending") failure("只有待审核的兑换可以取消");
      const member = memberInFamily(db, redemption.member_id, family.id);
      withTransaction(db, () => {
        db.prepare("UPDATE redemptions SET status = 'cancelled' WHERE id = ?").run(redemption.id);
        db.prepare("UPDATE rewards SET stock = stock + 1 WHERE id = ?").run(redemption.reward_row_id);
        addPointTransaction(db, member, Number(redemption.cost), {
          reason: `取消兑换：${redemption.title}`,
          type: "reward_refund",
          referenceType: "redemption",
          referenceId: redemption.id,
          createdBy: user.id,
        });
      });
      return sendJson(res, 200, { ok: true });
    }

    if (method === "GET" && pathname === "/api/reports") {
      const days = Math.min(30, Math.max(7, Number(url.searchParams.get("days")) || 7));
      const targetId = url.searchParams.get("memberId");
      const target = targetId ? memberInFamily(db, Number(targetId), family.id) : null;
      const start = addDays(today, -(days - 1));
      const rows = occurrenceRows(db, family.id, start, today, target?.id || null);
      const members = db.prepare(`
        SELECT * FROM members WHERE family_id = ? AND active = 1
        ORDER BY role = 'child', id
      `).all(family.id);
      const daily = [];
      for (let index = 0; index < days; index += 1) {
        const date = addDays(start, index);
        const dateRows = rows.filter((row) => row.date === date);
        const approved = dateRows.filter((row) => row.status === "approved");
        daily.push({
          date,
          total: dateRows.length,
          approved: approved.length,
          pending: dateRows.filter((row) => row.status === "pending").length,
          points: approved.reduce((sum, row) => sum + row.points, 0),
        });
      }
      const memberStats = members.map((member) => {
        const memberRows = rows.filter((row) => row.memberId === member.id);
        const approved = memberRows.filter((row) => row.status === "approved");
        return {
          ...publicMember(member),
          total: memberRows.length,
          approved: approved.length,
          points: approved.reduce((sum, row) => sum + row.points, 0),
          percent: memberRows.length ? Math.round((approved.length / memberRows.length) * 100) : 0,
        };
      });
      return sendJson(res, 200, { days, start, end: today, daily, members: memberStats });
    }

    failure("接口不存在", 404);
  }

  function checkOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return;
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== req.headers.host) failure("请求来源不正确", 403);
    } catch {
      failure("请求来源不正确", 403);
    }
  }

  function serveStatic(req, res, url) {
    if (req.method !== "GET" && req.method !== "HEAD") failure("请求方式不支持", 405);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      failure("路径无效");
    }
    if (pathname === "/") pathname = "/index.html";
    const filePath = path.resolve(publicDir, `.${pathname}`);
    const relative = path.relative(publicDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) failure("文件不存在", 404);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failure("文件不存在", 404);
    const ext = path.extname(filePath).toLowerCase();
    const isShell = path.basename(filePath) === "index.html" || path.basename(filePath) === "sw.js";
    const revalidate = isShell || [".js", ".css", ".webmanifest"].includes(ext);
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": revalidate ? "no-cache" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; connect-src 'self'; font-src 'self'; " +
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    };
    const stat = fs.statSync(filePath);
    headers["Content-Length"] = stat.size;
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      if (url.pathname.startsWith("/api/")) {
        if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
          failure("请求方式不支持", 405);
        }
        if (req.method !== "GET") checkOrigin(req);
        await routeApi(req, res, url);
      } else {
        serveStatic(req, res, url);
      }
    } catch (error) {
      if (!res.headersSent) sendError(res, error);
      else res.destroy();
    }
  });

  function close() {
    return new Promise((resolve, reject) => {
      server.close((error) => {
        try {
          db.close();
        } catch {
          // The database may already be closed by a failed startup.
        }
        if (error) reject(error);
        else resolve();
      });
    });
  }

  return { server, db, close };
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";
  const app = createApplication();
  app.server.listen(port, host, () => {
    console.log(`家庭节奏已启动：http://localhost:${port}`);
    if (host === "0.0.0.0") {
      for (const addresses of Object.values(os.networkInterfaces())) {
        for (const address of addresses || []) {
          if (address.family === "IPv4" && !address.internal) {
            console.log(`局域网访问：http://${address.address}:${port}`);
          }
        }
      }
    }
  });
  const shutdown = () => app.close().finally(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = { createApplication };
