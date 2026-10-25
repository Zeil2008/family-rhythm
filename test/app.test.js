"use strict";

const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createApplication } = require("../server");

let app;
let baseUrl;
let parentCookie;
let childCookie;
let childId;
let taskId;
let customTaskId;

function today() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  return { response, payload };
}

function sessionCookie(response) {
  return response.headers.get("set-cookie").split(";")[0];
}

before(async () => {
  app = createApplication({ dbPath: ":memory:" });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${app.server.address().port}`;
});

after(async () => {
  await app.close();
});

test("new installation requires setup", async () => {
  const { response, payload } = await request("/api/auth");
  assert.equal(response.status, 200);
  assert.equal(payload.setupRequired, true);
});

test("creates a family and starts an authenticated parent session", async () => {
  const { response, payload } = await request("/api/setup", {
    method: "POST",
    body: {
      familyName: "测试家庭",
      parentName: "妈妈",
      pin: "1234",
      childName: "小满",
      childPin: "5678",
      demoData: false,
    },
  });
  assert.equal(response.status, 201);
  assert.deepEqual(payload, { ok: true });
  parentCookie = sessionCookie(response);
  assert.match(parentCookie, /^session=/);

  const auth = await request("/api/auth", { cookie: parentCookie });
  assert.equal(auth.payload.user.role, "parent");
  assert.equal(auth.payload.members.length, 2);
  childId = auth.payload.members.find((member) => member.role === "child").id;
});

test("parent creates an agreed task that starts pending child acceptance", async () => {
  const created = await request("/api/tasks", {
    method: "POST",
    cookie: parentCookie,
    body: {
      title: "整理书桌",
      memberId: childId,
      category: "习惯",
      points: 5,
      dueTime: "19:30",
      startDate: today(),
      endDate: null,
      recurrence: "daily",
      weekdays: [],
      requireApproval: true,
      notes: "书本放回原处",
    },
  });
  assert.equal(created.response.status, 201);
  taskId = created.payload.task.id;
  assert.equal(created.payload.task.taskType, "agreed");
  assert.equal(created.payload.task.workflowStatus, "pending_acceptance");

  const beforeAcceptance = await request(
    `/api/occurrences?start=${today()}&end=${today()}`,
    { cookie: parentCookie }
  );
  assert.equal(beforeAcceptance.response.status, 200);
  assert.equal(
    beforeAcceptance.payload.occurrences.some((item) => item.taskId === taskId),
    false
  );

  const login = await request("/api/login", {
    method: "POST",
    body: { memberId: childId, pin: "5678" },
  });
  assert.equal(login.response.status, 200);
  childCookie = sessionCookie(login.response);
  assert.equal(login.payload.user.role, "child");
});

test("child accepts an agreed task but cannot edit its agreed definition", async () => {
  const dashboard = await request("/api/dashboard", { cookie: childCookie });
  const inbox = dashboard.payload.taskInbox.find((item) => item.id === taskId);
  assert.ok(inbox);
  assert.equal(inbox.workflowStatus, "pending_acceptance");

  const edit = await request(`/api/tasks/${taskId}`, {
    method: "PUT",
    cookie: childCookie,
    body: { title: "孩子不能改的约定", points: 99 },
  });
  assert.equal(edit.response.status, 403);

  const accepted = await request(`/api/tasks/${taskId}/accept`, {
    method: "POST",
    cookie: childCookie,
  });
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.payload.task.workflowStatus, "active");
});

test("each user can upload their own photo avatar without member-management permission", async () => {
  const avatarImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const changed = await request("/api/me/profile", {
    method: "PATCH",
    cookie: childCookie,
    body: { avatarImage },
  });
  assert.equal(changed.response.status, 200);
  assert.match(changed.payload.member.avatarUrl, /^\/api\/members\/\d+\/avatar\?v=/);
  assert.equal(changed.payload.member.role, "child");

  const image = await fetch(`${baseUrl}${changed.payload.member.avatarUrl}`, {
    headers: { Cookie: parentCookie },
  });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");

  const parentChanged = await request("/api/me/profile", {
    method: "PATCH",
    cookie: parentCookie,
    body: { avatarImage },
  });
  assert.equal(parentChanged.response.status, 200);
  assert.match(parentChanged.payload.member.avatarUrl, /^\/api\/members\/\d+\/avatar\?v=/);

  const removed = await request("/api/me/avatar", {
    method: "DELETE",
    cookie: childCookie,
  });
  assert.equal(removed.response.status, 200);
  assert.equal(removed.payload.member.avatarUrl, null);
});

test("child reports results with evidence and gets points after parent acceptance", async () => {
  const occurrences = await request(
    `/api/occurrences?start=${today()}&end=${today()}`,
    { cookie: childCookie }
  );
  const occurrence = occurrences.payload.occurrences.find(
    (item) => item.taskId === taskId && item.memberId === childId
  );
  assert.ok(occurrence);

  const withoutEvidence = await request("/api/occurrences/complete", {
    method: "POST",
    cookie: childCookie,
    body: { taskId, date: today() },
  });
  assert.equal(withoutEvidence.response.status, 400);
  assert.match(withoutEvidence.payload.error, /成果/);

  const completed = await request("/api/occurrences/complete", {
    method: "POST",
    cookie: childCookie,
    body: {
      taskId,
      date: today(),
      evidenceNote: "书本归位，桌面已经收拾干净",
      evidenceImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    },
  });
  assert.equal(completed.response.status, 200);
  assert.equal(completed.payload.status, "pending");

  const beforeApproval = await request("/api/dashboard", { cookie: parentCookie });
  assert.equal(
    beforeApproval.payload.members.find((member) => member.id === childId).points,
    0
  );

  const pending = await request("/api/completions?status=pending", {
    cookie: parentCookie,
  });
  const completion = pending.payload.completions.find((item) => item.taskId === taskId);
  assert.ok(completion);
  assert.equal(completion.evidenceNote, "书本归位，桌面已经收拾干净");
  assert.equal(completion.hasEvidence, true);

  const evidence = await fetch(`${baseUrl}${completion.evidenceUrl}`, {
    headers: { Cookie: parentCookie },
  });
  assert.equal(evidence.status, 200);
  assert.equal(evidence.headers.get("content-type"), "image/png");

  const reviewed = await request(`/api/completions/${completion.id}/review`, {
    method: "POST",
    cookie: parentCookie,
    body: { status: "approved", note: "整理得很认真" },
  });
  assert.equal(reviewed.response.status, 200);

  const afterApproval = await request("/api/dashboard", { cookie: parentCookie });
  assert.equal(
    afterApproval.payload.members.find((member) => member.id === childId).points,
    5
  );
});

test("editing an accepted agreement requires the child to accept it again", async () => {
  const edited = await request(`/api/tasks/${taskId}`, {
    method: "PUT",
    cookie: parentCookie,
    body: { title: "整理书桌和文件袋" },
  });
  assert.equal(edited.response.status, 200);
  assert.equal(edited.payload.task.workflowStatus, "pending_acceptance");

  const again = await request(`/api/tasks/${taskId}/accept`, {
    method: "POST",
    cookie: childCookie,
  });
  assert.equal(again.response.status, 200);
  assert.equal(again.payload.task.workflowStatus, "active");
});

test("child-created tasks wait for parent approval before they appear", async () => {
  const created = await request("/api/tasks", {
    method: "POST",
    cookie: childCookie,
    body: {
      title: "每天跳绳 100 下",
      memberId: childId,
      category: "运动",
      points: 3,
      startDate: today(),
      recurrence: "daily",
      notes: "我想练耐力",
    },
  });
  assert.equal(created.response.status, 201);
  customTaskId = created.payload.task.id;
  assert.equal(created.payload.task.taskType, "custom");
  assert.equal(created.payload.task.workflowStatus, "pending_approval");

  const occurrences = await request(
    `/api/occurrences?start=${today()}&end=${today()}`,
    { cookie: childCookie }
  );
  assert.equal(
    occurrences.payload.occurrences.some((item) => item.taskId === customTaskId),
    false
  );

  const parentEdit = await request(`/api/tasks/${customTaskId}`, {
    method: "PUT",
    cookie: parentCookie,
    body: { title: "家长不能改孩子自建任务" },
  });
  assert.equal(parentEdit.response.status, 403);

  const reviewed = await request(`/api/tasks/${customTaskId}/review`, {
    method: "POST",
    cookie: parentCookie,
    body: { status: "approved", note: "目标合适，从今天开始" },
  });
  assert.equal(reviewed.response.status, 200);
  assert.equal(reviewed.payload.task.workflowStatus, "active");

  const childEdit = await request(`/api/tasks/${customTaskId}`, {
    method: "PUT",
    cookie: childCookie,
    body: { title: "每天跳绳 120 下" },
  });
  assert.equal(childEdit.response.status, 200);
  assert.equal(childEdit.payload.task.workflowStatus, "pending_approval");

  const reapproved = await request(`/api/tasks/${customTaskId}/review`, {
    method: "POST",
    cookie: parentCookie,
    body: { status: "approved" },
  });
  assert.equal(reapproved.response.status, 200);
  assert.equal(reapproved.payload.task.workflowStatus, "active");
});

test("child cannot use parent-only management endpoints", async () => {
  const created = await request("/api/members", {
    method: "POST",
    cookie: childCookie,
    body: {
      name: "不应创建",
      role: "parent",
      pin: "9999",
    },
  });
  assert.equal(created.response.status, 403);
  assert.match(created.payload.error, /家长/);
});

test("reward redemption reserves points and parent approval finalizes it", async () => {
  const created = await request("/api/rewards", {
    method: "POST",
    cookie: parentCookie,
    body: {
      title: "选一部电影",
      description: "周末一起看",
      icon: "🎬",
      cost: 3,
      stock: 2,
    },
  });
  assert.equal(created.response.status, 201);
  const rewardId = created.payload.reward.id;

  const redeemed = await request(`/api/rewards/${rewardId}/redeem`, {
    method: "POST",
    cookie: childCookie,
  });
  assert.equal(redeemed.response.status, 200);
  assert.equal(redeemed.payload.status, "pending");
  assert.equal(redeemed.payload.points, 2);

  const pending = await request("/api/redemptions?status=pending", {
    cookie: parentCookie,
  });
  const redemption = pending.payload.redemptions.find((item) => item.reward_id === rewardId);
  assert.ok(redemption);

  const reviewed = await request(`/api/redemptions/${redemption.id}/review`, {
    method: "POST",
    cookie: parentCookie,
    body: { status: "approved" },
  });
  assert.equal(reviewed.response.status, 200);

  const family = await request("/api/family", { cookie: childCookie });
  assert.equal(family.payload.members.find((member) => member.id === childId).points, 2);
});

test("deduction rules require child acceptance and deduct only after all warnings", async () => {
  const created = await request("/api/deduction-rules", {
    method: "POST",
    cookie: parentCookie,
    body: {
      memberId: childId,
      title: "未经同意拿家人的物品",
      description: "先提醒，警告用完后按约定扣分",
      points: 1,
      warningLimit: 3,
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.payload.rule.status, "pending_acceptance");
  assert.equal(created.payload.rule.warningLimit, 3);

  const childEdit = await request(`/api/deduction-rules/${created.payload.rule.id}`, {
    method: "PATCH",
    cookie: childCookie,
    body: { points: 99 },
  });
  assert.equal(childEdit.response.status, 403);

  const beforeAcceptance = await request(
    `/api/deduction-rules/${created.payload.rule.id}/record`,
    { method: "POST", cookie: parentCookie, body: { note: "提前记录" } }
  );
  assert.equal(beforeAcceptance.response.status, 409);

  const dashboard = await request("/api/dashboard", { cookie: childCookie });
  assert.ok(
    dashboard.payload.deductionInbox.some(
      (rule) => rule.id === created.payload.rule.id
    )
  );

  const accepted = await request(
    `/api/deduction-rules/${created.payload.rule.id}/accept`,
    { method: "POST", cookie: childCookie }
  );
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.payload.rule.status, "active");

  for (let index = 1; index <= 3; index += 1) {
    const warning = await request(
      `/api/deduction-rules/${created.payload.rule.id}/record`,
      { method: "POST", cookie: parentCookie, body: { note: `第 ${index} 次` } }
    );
    assert.equal(warning.response.status, 200);
    assert.equal(warning.payload.result, "warning");
    assert.equal(warning.payload.warningAfter, index);
    assert.equal(warning.payload.deducted, 0);
  }

  const beforeDeduction = await request("/api/family", { cookie: childCookie });
  assert.equal(
    beforeDeduction.payload.members.find((member) => member.id === childId).points,
    2
  );

  const deduction = await request(
    `/api/deduction-rules/${created.payload.rule.id}/record`,
    { method: "POST", cookie: parentCookie, body: { note: "第四次行为" } }
  );
  assert.equal(deduction.response.status, 200);
  assert.equal(deduction.payload.result, "deduction");
  assert.equal(deduction.payload.deducted, 1);
  assert.equal(deduction.payload.balanceAfter, 1);
  assert.equal(deduction.payload.rule.events.length, 4);

  const reset = await request(
    `/api/deduction-rules/${created.payload.rule.id}/reset`,
    { method: "POST", cookie: parentCookie, body: { note: "开启新一轮" } }
  );
  assert.equal(reset.response.status, 200);
  assert.equal(reset.payload.result, "reset");
  assert.equal(reset.payload.rule.warningsUsed, 0);
  assert.equal(reset.payload.rule.events[0].type, "reset");
});

test("public app shell is served", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /家庭节奏/);
  assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
});
