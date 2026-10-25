"use strict";

const ICONS = {
  today:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></svg>',
  schedule:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M7 14h4M7 17h8"/></svg>',
  gift:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M7.5 8C5.6 8 4.5 6.8 4.5 5.4S5.6 3 7.5 3c2.8 0 4.5 5 4.5 5s-1.7-5-4.5-5zM16.5 8c1.9 0 3-1.2 3-2.6S18.4 3 16.5 3C13.7 3 12 8 12 8s1.7-5 4.5-5z"/></svg>',
  family:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-2A5.5 5.5 0 0 1 9 12.5a5.5 5.5 0 0 1 5.5 5.5v2M14.5 14.2a4 4 0 0 1 6 3.8v2"/></svg>',
  manage:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  star:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9z"/></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  chevronLeft:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  logout:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/></svg>',
  edit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 16-.8 4.8L8 20l11-11-4-4zM13.5 6.5l4 4"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  bell:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-2A5.5 5.5 0 0 1 9 12.5a5.5 5.5 0 0 1 5.5 5.5v2M14.5 14.2a4 4 0 0 1 6 3.8v2"/></svg>',
  key:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2M14 9l2 2"/></svg>',
};

const CATEGORY_ICONS = {
  习惯: "🌱",
  学习: "📚",
  家务: "🧹",
  运动: "🏃",
  亲情: "💛",
  阅读: "📖",
  艺术: "🎨",
  其他: "✨",
};

const NAV_ITEMS = [
  { id: "today", label: "今天", icon: "today" },
  { id: "schedule", label: "日程", icon: "schedule" },
  { id: "rewards", label: "奖励", icon: "gift" },
  { id: "family", label: "家庭", icon: "family" },
  { id: "manage", label: "管理", icon: "manage", parentOnly: true },
];

const VIEW_TITLES = {
  today: ["今天", "把今天过成一小步的胜利"],
  schedule: ["家庭日程", "一周节奏，提前看见每一天"],
  rewards: ["心愿奖励", "每一分努力，都值得被看见"],
  family: ["我们的家", "一起长大，也一起为彼此鼓掌"],
  manage: ["家庭管理", "日程、成员和积分规则都在这里"],
};

const state = {
  auth: null,
  user: null,
  today: localDateString(),
  view: "today",
  reviewCount: 0,
  loginMemberId: null,
  weekStart: null,
  scheduleDate: null,
  scheduleRows: [],
  familyData: null,
  manageTasks: [],
  deductionRules: [],
  rewards: [],
  dashboard: null,
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  return new Date(`${value}T12:00:00`);
}

function addDays(value, amount) {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function startOfWeek(value) {
  const date = parseDate(value);
  const day = date.getDay();
  return addDays(value, -(day === 0 ? 6 : day - 1));
}

function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (options.short) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatWeekRange(start) {
  const end = addDays(start, 6);
  const first = parseDate(start);
  const last = parseDate(end);
  if (first.getMonth() === last.getMonth()) {
    return `${first.getFullYear()}年${first.getMonth() + 1}月 ${first.getDate()}–${last.getDate()}日`;
  }
  return `${first.getMonth() + 1}月${first.getDate()}日 – ${last.getMonth() + 1}月${last.getDate()}日`;
}

function formatTimeAgo(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function isOverdueOccurrence(task) {
  if (task.status !== "todo" || task.date > state.today) return false;
  if (task.date < state.today) return true;
  if (!task.dueTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current > task.dueTime;
}

function roleLabel(role) {
  return role === "parent" ? "家长" : "孩子";
}

function statusLabel(status) {
  return {
    pending: "待家长审核",
    approved: "已通过",
    rejected: "未通过",
    cancelled: "已取消",
  }[status] || status;
}

function categoryEmoji(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.其他;
}

function avatar(member, extraClass = "") {
  const color = /^#[0-9a-fA-F]{6}$/.test(member?.color || "") ? member.color : "#E36F52";
  const initial = Array.from(String(member?.name || "家"))[0].toUpperCase();
  const content = member?.avatarUrl
    ? `<img src="${escapeHtml(member.avatarUrl)}" alt="${escapeHtml(member.name || "成员")}的头像">`
    : `<span class="avatar-initial">${escapeHtml(initial)}</span>`;
  return `<span class="avatar ${extraClass} ${member?.avatarUrl ? "has-photo" : ""}" style="background:color-mix(in srgb, ${color} 18%, #fff9ec)">${content}</span>`;
}

function miniAvatar(member, extraClass = "") {
  const color = /^#[0-9a-fA-F]{6}$/.test(member?.color || "") ? member.color : "#E36F52";
  const initial = Array.from(String(member?.name || "家"))[0].toUpperCase();
  const content = member?.avatarUrl
    ? `<img src="${escapeHtml(member.avatarUrl)}" alt="">`
    : escapeHtml(initial);
  return `<span class="mini-avatar ${extraClass} ${member?.avatarUrl ? "has-photo" : ""}" style="background:color-mix(in srgb, ${color} 18%, #fff9ec)">${content}</span>`;
}

async function api(path, options = {}) {
  const config = {
    credentials: "same-origin",
    ...options,
    headers: { ...(options.headers || {}) },
  };
  if (config.body && typeof config.body !== "string") {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(path, config);
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: "服务器返回了无法识别的内容" };
  }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/api/auth") && !path.endsWith("/login")) {
      state.user = null;
      state.auth = null;
    }
    const error = new Error(data.error || `请求失败（${response.status}）`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function toast(message, kind = "success") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  root.innerHTML = `<div class="toast ${kind === "error" ? "error" : ""}">${escapeHtml(message)}</div>`;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    root.innerHTML = "";
  }, 2800);
}

function loadingPage(message = "正在整理今天的日程…") {
  return `<div class="loading-panel"><div class="spinner"></div><span>${escapeHtml(message)}</span></div>`;
}

function authStory() {
  return `
    <section class="auth-story">
      <div class="story-brand">
        <span class="brand-mark"><span class="brand-sun"></span><span class="brand-hill"></span></span>
        家庭节奏
      </div>
      <div class="story-copy">
        <div class="eyebrow">Family Rhythm</div>
        <h1>把好习惯，<br>变成全家的日常。</h1>
        <p>每天的日程被看见，每一次完成有回应。用清楚、温和的积分奖励，陪孩子慢慢把自律变成自己的力量。</p>
      </div>
      <div class="story-points">
        <span><i></i>家庭独立数据</span>
        <span><i></i>手机与 iPad 可用</span>
        <span><i></i>家长审核把关</span>
      </div>
    </section>
  `;
}

function renderSetupPage() {
  document.getElementById("app").innerHTML = `
    <div class="auth-page">
      ${authStory()}
      <main class="auth-panel">
        <div class="auth-card">
          <div class="eyebrow">第一次见面</div>
          <h2>创建你们的家庭</h2>
          <p>先设置一位家长管理员。所有数据只保存在你的家庭服务器里，之后可以继续添加家人。</p>
          <form class="form-stack" data-form="setup">
            <div class="field">
              <label for="family-name">家庭名称</label>
              <input class="input" id="family-name" name="familyName" maxlength="40" placeholder="比如：小树一家" required autofocus>
            </div>
            <div class="form-grid">
              <div class="field">
                <label for="parent-name">你的称呼</label>
                <input class="input" id="parent-name" name="parentName" maxlength="20" placeholder="比如：爸爸" required>
              </div>
              <div class="field">
                <label for="parent-pin">登录密码</label>
                <input class="input pin-input" id="parent-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" placeholder="4–8 位数字" required>
              </div>
            </div>
            <div class="form-grid">
              <div class="field">
                <label for="child-name">孩子的称呼 <span class="field-hint">（可稍后添加）</span></label>
                <input class="input" id="child-name" name="childName" maxlength="20" placeholder="比如：小宇">
              </div>
              <div class="field">
                <label for="child-pin">孩子的登录密码</label>
                <input class="input pin-input" id="child-pin" name="childPin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" placeholder="4–8 位数字">
              </div>
            </div>
            <label class="checkbox-row">
              <input type="checkbox" name="demoData" checked>
              <span>
                <strong>放入一组示例日程与奖励</strong>
                <small>方便马上体验，之后可以随时编辑或删除。</small>
              </span>
            </label>
            <p class="form-error" data-form-error></p>
            <div class="form-actions">
              <button class="btn btn-primary btn-lg btn-block" type="submit">开始我们的家庭节奏 ${ICONS.arrowRight}</button>
            </div>
          </form>
          <div class="auth-note">${ICONS.info}<span>密码只用于家庭成员登录。忘记家长密码时，可以在服务器上使用恢复命令，具体见项目说明。</span></div>
        </div>
      </main>
    </div>
  `;
}

function renderLoginPage(auth) {
  const selected =
    auth.members.find((member) => member.id === state.loginMemberId) || auth.members[0];
  state.loginMemberId = selected?.id || null;
  document.getElementById("app").innerHTML = `
    <div class="auth-page">
      ${authStory()}
      <main class="auth-panel">
        <div class="auth-card">
          <div class="eyebrow">${escapeHtml(auth.family?.name || "家庭节奏")}</div>
          <h2>今天也要一起加油</h2>
          <p>选择自己的成员卡片，然后输入家庭登录密码。</p>
          <div class="member-picker">
            ${auth.members.map((member) => `
              <button class="member-choice ${member.id === state.loginMemberId ? "selected" : ""}" type="button" data-action="select-login-member" data-member-id="${member.id}">
                <span class="selected-dot">${ICONS.check}</span>
                ${avatar(member)}
                <strong>${escapeHtml(member.name)}</strong>
                <small>${roleLabel(member.role)}</small>
              </button>
            `).join("")}
          </div>
          <form class="form-stack" data-form="login">
            <div class="field">
              <label for="login-pin">输入 ${escapeHtml(selected?.name || "成员")} 的密码</label>
              <input class="input pin-input" id="login-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" placeholder="••••" required autofocus>
            </div>
            <p class="form-error" data-form-error></p>
            <button class="btn btn-primary btn-lg btn-block" type="submit">进入家庭节奏 ${ICONS.arrowRight}</button>
          </form>
          <div class="auth-note">${ICONS.info}<span>家庭成员的密码由家长在“家庭管理”中创建或重置。若连续输错 8 次，系统会暂时锁定 10 分钟。</span></div>
        </div>
      </main>
    </div>
  `;
}

function navHtml(mobile = false) {
  const items = NAV_ITEMS.filter((item) => !item.parentOnly || state.user.role === "parent");
  return items.map((item) => {
    const active = item.id === state.view;
    const supportsBadge =
      (item.id === "manage" && state.user.role === "parent") ||
      (item.id === "today" && state.user.role === "child");
    const badge = supportsBadge
      ? `<span class="nav-badge ${state.reviewCount > 0 ? "" : "hidden"}">${state.reviewCount > 99 ? "99+" : state.reviewCount}</span>`
      : "";
    if (mobile) {
      return `
        <button class="bottom-nav-item ${active ? "active" : ""}" data-action="navigate" data-view="${item.id}">
          ${ICONS[item.icon]}<span>${item.label}</span>${badge}
        </button>
      `;
    }
    return `
      <button class="nav-item ${active ? "active" : ""}" data-action="navigate" data-view="${item.id}">
        ${ICONS[item.icon]}<span>${item.label}</span>${badge}
      </button>
    `;
  }).join("");
}

function renderShell() {
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-mark"><span class="brand-sun"></span><span class="brand-hill"></span></span>
          <div><strong>家庭节奏</strong><small>FAMILY RHYTHM</small></div>
        </div>
        <nav class="nav-list" aria-label="主导航">${navHtml()}</nav>
        <div class="sidebar-spacer"></div>
        <div class="sidebar-tip">
          <strong>看见进步，比只盯结果更重要</strong>
          任务完成后给一句具体肯定，积分会更有意义。
        </div>
        <div class="sidebar-user">
          ${avatar(state.user)}
          <div class="sidebar-user-copy">
            <strong>${escapeHtml(state.user.name)}</strong>
            <small>${roleLabel(state.user.role)} · 家庭成员</small>
          </div>
          <button class="icon-btn" data-action="logout" title="退出登录" aria-label="退出登录">${ICONS.logout}</button>
        </div>
      </aside>
      <main class="main-content">
        <header class="topbar">
          <div class="mobile-brand">
            <span class="brand-mark"><span class="brand-sun"></span><span class="brand-hill"></span></span>
          </div>
          <div class="page-heading">
            <div>
              <h1 id="page-title">今天</h1>
              <p id="page-subtitle">把今天过成一小步的胜利</p>
            </div>
          </div>
          <div class="topbar-actions">
            <span class="points-pill" title="我的当前积分">${ICONS.star}<span class="points-value">${state.user.points}</span> 分</span>
            <div id="header-actions"></div>
          </div>
        </header>
        <div class="page" id="page-content">${loadingPage()}</div>
      </main>
      <nav class="bottom-nav ${state.user.role === "parent" ? "has-manage" : ""}" aria-label="移动端导航">
        ${navHtml(true)}
      </nav>
    </div>
  `;
  updateChrome();
}

function updateChrome() {
  const titleNode = document.getElementById("page-title");
  const subtitleNode = document.getElementById("page-subtitle");
  if (titleNode) titleNode.textContent = VIEW_TITLES[state.view]?.[0] || "家庭节奏";
  if (subtitleNode) subtitleNode.textContent = VIEW_TITLES[state.view]?.[1] || "";
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
  document.querySelectorAll(".points-value").forEach((node) => {
    node.textContent = state.user?.points ?? 0;
  });
  document.querySelectorAll(".nav-badge").forEach((node) => {
    node.textContent = state.reviewCount > 99 ? "99+" : String(state.reviewCount || 0);
    node.classList.toggle("hidden", !state.reviewCount);
  });
  const headerActions = document.getElementById("header-actions");
  if (headerActions) {
    const canCreate =
      (state.user?.role === "parent" && ["today", "schedule", "manage"].includes(state.view)) ||
      (state.user?.role === "child" && ["today", "schedule"].includes(state.view));
    const label = state.user?.role === "parent" ? "新建约定" : "自建任务";
    headerActions.innerHTML = canCreate
      ? `<button class="btn btn-primary ${state.user?.role === "child" ? "child-create-action" : ""}" data-action="new-task">${ICONS.plus}<span>${label}</span></button>`
      : "";
  }
}

async function boot() {
  try {
    const auth = await api("/api/auth");
    state.auth = auth;
    if (auth.setupRequired) {
      renderSetupPage();
      return;
    }
    state.today = localDateString();
    if (!auth.user) {
      state.user = null;
      renderLoginPage(auth);
      return;
    }
    state.user = auth.user;
    if (state.view === "manage" && state.user.role !== "parent") state.view = "today";
    renderShell();
    await navigate(state.view, false);
  } catch (error) {
    document.getElementById("app").innerHTML = `
      <div class="boot-screen">
        <div class="empty-emoji">☁️</div>
        <strong>暂时连接不上家庭服务器</strong>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-primary" data-action="reload">重新连接</button>
      </div>
    `;
  }
}

async function navigate(view, refresh = true) {
  if (view === "manage" && state.user.role !== "parent") view = "today";
  state.view = view;
  updateChrome();
  const content = document.getElementById("page-content");
  if (!content) return;
  content.innerHTML = loadingPage();
  try {
    if (view === "today") await renderToday(content);
    else if (view === "schedule") await renderSchedule(content);
    else if (view === "rewards") await renderRewards(content);
    else if (view === "family") await renderFamily(content);
    else if (view === "manage") await renderManage(content);
  } catch (error) {
    if (error.status === 401) return boot();
    content.innerHTML = `
      <div class="card section-card empty-state">
        <div class="empty-emoji">🌧️</div>
        <strong>这一页暂时没有加载出来</strong>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-secondary" data-action="refresh">再试一次</button>
      </div>
    `;
  }
  updateChrome();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function taskItem(task, allowComplete = true, showOwner = true) {
  const overdue = isOverdueOccurrence(task);
  const statusClass =
    task.status === "approved"
      ? "completed"
      : task.status === "pending"
        ? "pending"
        : overdue
          ? "overdue"
          : "";
  let action = "";
  if (task.status === "approved") {
    action = `<span class="status-check" title="已完成">${ICONS.check}</span>`;
  } else if (task.status === "pending") {
    action = `<span class="status-waiting">${ICONS.clock}待审核</span>`;
  } else if (task.date > state.today) {
    action = `<span class="status-tag pending">待开始</span>`;
  } else if (allowComplete) {
    action = `
      <button class="btn btn-sm ${task.status === "rejected" ? "btn-danger-soft" : "btn-soft"} task-action" data-action="complete-task" data-task-id="${task.taskId}" data-date="${escapeHtml(task.date)}">
        ${task.status === "rejected" ? "再试一次" : "完成了"}
      </button>
    `;
  } else {
    action = `<span class="status-tag ${overdue ? "rejected" : "pending"}">${overdue ? "待完成" : "计划中"}</span>`;
  }
  const owner =
    showOwner && task.memberName
      ? `<span class="task-owner">${miniAvatar({
          avatarUrl: task.memberAvatarUrl,
          name: task.memberName,
          color: task.memberColor,
        })}${escapeHtml(task.memberName)}</span>`
      : "";
  return `
    <div class="task-item ${statusClass}">
      <span class="task-icon">${categoryEmoji(task.category)}</span>
      <div class="task-main">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-detail">
          ${owner}
          <span>${ICONS.clock}${escapeHtml(task.dueTime || "时间灵活")}</span>
          <span>${escapeHtml(task.category)}</span>
          <span class="task-kind ${task.taskType === "custom" ? "custom" : ""}">${task.taskType === "custom" ? "自建" : "约定"}</span>
          <span class="task-points">+${task.points} 分</span>
          ${task.status === "rejected" ? '<span style="color:var(--danger)">请重新完成</span>' : ""}
        </div>
        ${task.status === "rejected" && task.reviewNote ? `<p class="review-feedback">家长意见：${escapeHtml(task.reviewNote)}</p>` : ""}
      </div>
      ${action}
    </div>
  `;
}

function memberProgressRow(member) {
  return `
    <div class="member-row">
      ${avatar(member)}
      <div class="member-row-main">
        <div class="member-row-top">
          <strong>${escapeHtml(member.name)}</strong>
          <span>${member.approved}/${member.total} 完成 · ${member.points} 分</span>
        </div>
        <div class="progress-line" style="--bar-color:${escapeHtml(member.color || "#47766F")}">
          <span style="--value:${member.percent || 0}%"></span>
        </div>
      </div>
    </div>
  `;
}

function taskInboxSection(tasks) {
  if (!tasks.length) return "";
  return `
    <section class="card section-card inbox-card">
      <div class="section-head">
        <div><h2>待你确认的任务</h2><p>约定任务接受后生效；自建任务需由家长审核</p></div>
        <span class="status-tag pending">${tasks.length} 项</span>
      </div>
      <div class="inbox-list">
        ${tasks.map((task) => {
          const myAssignment = task.members?.find(
            (member) => member.id === state.user.id
          );
          const isAgreement =
            task.taskType === "agreed" &&
            myAssignment?.acceptanceStatus === "pending_acceptance";
          const isReview = task.workflowStatus === "pending_approval";
          const isRejected = task.workflowStatus === "rejected";
          return `
            <article class="inbox-item ${isRejected ? "rejected" : ""}">
              <span class="task-icon">${categoryEmoji(task.category)}</span>
              <div class="inbox-main">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-detail">
                  <span>${isAgreement ? "家长约定" : "我的自建任务"}</span>
                  <span>${escapeHtml(recurrenceLabel(task))}</span>
                  <span>${escapeHtml(task.dueTime || "时间灵活")}</span>
                  <span class="task-points">+${task.points} 分</span>
                </div>
                ${task.notes ? `<p class="inbox-note">${escapeHtml(task.notes)}</p>` : ""}
                ${isRejected && task.reviewNote ? `<p class="review-feedback">家长意见：${escapeHtml(task.reviewNote)}</p>` : ""}
              </div>
              <div class="inbox-action">
                ${
                  isAgreement
                    ? `<span class="status-tag pending">等待接受</span><button class="btn btn-sm btn-primary" data-action="accept-task" data-task-id="${task.id}">接受约定</button>`
                    : isReview
                      ? `<span class="status-tag pending">等待家长审核</span><button class="btn btn-sm btn-secondary" data-action="edit-task" data-task-id="${task.id}">修改提案</button>`
                      : `<span class="status-tag rejected">家长未通过</span><button class="btn btn-sm btn-primary" data-action="edit-task" data-task-id="${task.id}">修改并重交</button>`
                }
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function deductionRulesSection(pendingRules, activeRules) {
  if (!pendingRules.length && !activeRules.length) return "";
  return `
    <section class="card section-card deduction-card">
      <div class="section-head">
        <div><h2>行为扣分约定</h2><p>先警告、后扣分；所有记录都会保留</p></div>
        ${pendingRules.length ? `<span class="status-tag pending">${pendingRules.length} 项待接受</span>` : ""}
      </div>
      ${
        pendingRules.length
          ? `<div class="inbox-list">
              ${pendingRules.map((rule) => `
                <article class="inbox-item">
                  <span class="task-icon deduction-icon">⚠️</span>
                  <div class="inbox-main">
                    <div class="task-title">${escapeHtml(rule.title)}</div>
                    <div class="task-detail">
                      <span>${rule.warningLimit} 次警告</span>
                      <span class="deduction-points">警告用完后每次 -${rule.points} 分</span>
                    </div>
                    ${rule.description ? `<p class="inbox-note">${escapeHtml(rule.description)}</p>` : ""}
                  </div>
                  <div class="inbox-action">
                    <span class="status-tag pending">等待接受</span>
                    <button class="btn btn-sm btn-primary" data-action="accept-deduction" data-rule-id="${rule.id}">接受扣分约定</button>
                  </div>
                </article>
              `).join("")}
            </div>`
          : ""
      }
      ${
        activeRules.length
          ? `<div class="active-deductions ${pendingRules.length ? "with-separator" : ""}">
              ${activeRules.map((rule) => {
                const used = Math.min(rule.warningsUsed, rule.warningLimit);
                const dots = Math.max(0, Math.min(8, rule.warningLimit));
                const latest = rule.events?.[0];
                return `
                  <article class="deduction-rule-row">
                    <div class="deduction-rule-main">
                      <div class="deduction-rule-title"><strong>${escapeHtml(rule.title)}</strong><span>每次 -${rule.points} 分</span></div>
                      <div class="warning-track">
                        ${Array.from({ length: dots }, (_, index) => `<i class="${index < used ? "used" : ""}"></i>`).join("")}
                        <small>已用 ${used}/${rule.warningLimit} 次警告</small>
                      </div>
                      ${latest ? `<p class="deduction-latest">${latest.type === "deduction" ? `最近扣分 ${Math.abs(latest.pointsDelta)} 分` : latest.type === "reset" ? "家长已开启新一轮警告" : `最近记录第 ${latest.warningAfter} 次警告`}${latest.note ? ` · ${escapeHtml(latest.note)}` : ""}</p>` : ""}
                    </div>
                    <span class="status-tag ${used >= rule.warningLimit ? "rejected" : "pending"}">${used >= rule.warningLimit ? "警告已用完" : `余 ${rule.warningLimit - used} 次`}</span>
                  </article>
                `;
              }).join("")}
            </div>`
          : ""
      }
    </section>
  `;
}

async function renderToday(content) {
  const dashboard = await api(`/api/dashboard?date=${state.today}`);
  state.dashboard = dashboard;
  state.today = dashboard.today;
  state.user = dashboard.user;
  state.reviewCount = dashboard.reviewCount;
  const displayTasks =
    dashboard.user.role === "parent" ? dashboard.familyTasks : dashboard.tasks;
  const approved = displayTasks.filter((task) => task.status === "approved").length;
  const progress = displayTasks.length ? Math.round((approved / displayTasks.length) * 100) : 0;
  const mine = dashboard.members.find((member) => member.id === dashboard.user.id) || {
    streak: 0,
    total: displayTasks.length,
    approved,
  };
  const pendingCode = dashboard.user.role === "parent" ? dashboard.reviewCount : 0;
  const taskInbox = dashboard.taskInbox || [];
  const deductionInbox = dashboard.deductionInbox || [];
  const deductionRules = dashboard.deductionRules || [];
  const pendingAgreements = dashboard.pendingAgreements || 0;
  if (dashboard.user.role === "child") {
    state.reviewCount = taskInbox.length + deductionInbox.length;
  }
  const allowComplete = dashboard.user.role !== "parent";
  const taskHeading =
    dashboard.user.role === "parent" ? "全家今天" : "我的今日日程";

  content.innerHTML = `
    <div class="dashboard-grid">
      <div style="display:grid;gap:20px;min-width:0">
        <section class="card hero-card">
          <div class="hero-content">
            <div class="hero-kicker">${formatDate(state.today)}</div>
            <h2>${greeting()}，${escapeHtml(dashboard.user.name)}。</h2>
            <p>${
              dashboard.user.role === "parent"
                ? displayTasks.length
                  ? `全家的节奏正在推进。今天还有 ${displayTasks.filter((task) => task.status !== "approved").length} 个日程没完成，记得多给具体鼓励。`
                  : pendingAgreements
                    ? `已经有 ${pendingAgreements} 份约定，等孩子接受后就会按频次进入日程。`
                    : "今天还没有安排日程，可以从一件轻松的小事开始。"
                : displayTasks.length
                  ? `今天有 ${displayTasks.length} 件小事，完成 ${approved} 件。一次做好一件，就已经很棒。`
                  : "今天暂时没有安排。享受一段留白时光吧。"
            }</p>
            <div class="hero-meta">
              <span class="hero-chip">${ICONS.star}${dashboard.user.points} 积分</span>
              <span class="hero-chip">${ICONS.check}${dashboard.user.role === "parent" ? "今日完成率 " + progress + "%" : mine.streak + " 天连续达标"}</span>
              ${pendingAgreements ? `<span class="hero-chip">🤝${pendingAgreements} 人次待接受</span>` : ""}
              ${dashboard.pendingDeductionAgreements ? `<span class="hero-chip">⚠️${dashboard.pendingDeductionAgreements} 项扣分约定待接受</span>` : ""}
            </div>
          </div>
          <div class="progress-orb" style="--progress:${progress}">
            <div class="progress-copy"><strong>${progress}%</strong><small>今日进度</small></div>
          </div>
        </section>

        ${taskInboxSection(taskInbox)}
        ${deductionRulesSection(deductionInbox, deductionRules)}

        <section class="card section-card">
          <div class="section-head">
            <div>
              <h2>${taskHeading}</h2>
              <p>${displayTasks.length ? `${approved} 项完成，${displayTasks.length - approved} 项待继续` : "给今天一点轻盈的留白"}</p>
            </div>
            ${
              dashboard.user.role === "parent"
                ? `<button class="text-link" data-action="navigate" data-view="schedule">查看一周 ${ICONS.arrowRight}</button>`
                : `<button class="text-link" data-action="new-task">${ICONS.plus}自建任务</button>`
            }
          </div>
          <div class="task-list">
            ${
              displayTasks.length
                ? displayTasks.map((task) => taskItem(task, allowComplete, dashboard.user.role === "parent")).join("")
                : `
                  <div class="empty-state">
                    <div class="empty-emoji">🌿</div>
                    <strong>今天还没有日程</strong>
                    <p>${dashboard.user.role === "parent" ? pendingAgreements ? "已有约定等待孩子确认，接受后会出现在这里。" : "为孩子安排一个清晰、可完成的小目标吧。" : "去日历看看本周计划，或者好好休息一下。"}</p>
                    <button class="btn btn-primary btn-sm" data-action="new-task">${ICONS.plus}${dashboard.user.role === "parent" ? "发起家庭约定" : "创建我的自建任务"}</button>
                  </div>
                `
            }
          </div>
        </section>
      </div>

      <aside class="right-rail">
        <section class="card section-card">
          <div class="section-head">
            <div><h3>家里的今天</h3><p>每个人都在自己的节奏里前进</p></div>
            ${dashboard.user.role === "parent" ? `<button class="text-link" data-action="navigate" data-view="manage">管理</button>` : ""}
          </div>
          <div class="member-stack">
            ${dashboard.members.map(memberProgressRow).join("")}
          </div>
        </section>

        ${
          dashboard.user.role === "parent"
            ? `
              <section class="card section-card">
                <div class="section-head">
                  <div><h3>等我确认</h3><p>认真回应每一次完成</p></div>
                  ${pendingCode ? `<span class="status-tag pending">${pendingCode} 项</span>` : ""}
                </div>
                ${
                  pendingCode
                    ? `<p style="font-size:12px;color:var(--ink-soft);line-height:1.7;margin-bottom:14px">${dashboard.pendingCompletions} 个完成成果、${dashboard.pendingTaskReviews || 0} 个自建任务、${dashboard.pendingRedemptions} 个奖励兑换等待处理。</p><button class="btn btn-dark btn-block" data-action="navigate" data-view="manage">去审核 ${ICONS.arrowRight}</button>`
                    : `<div class="empty-state" style="padding:8px 4px 12px"><div class="empty-emoji" style="width:48px;height:48px;font-size:23px">☀️</div><p style="margin:0">暂时没有待审核事项。</p></div>`
                }
              </section>
            `
            : `
              <section class="card section-card">
                <div class="section-head"><div><h3>我的积分罐</h3><p>努力正在一点点积累</p></div></div>
                <div class="stat-band">
                  <div><strong>${dashboard.user.points}</strong><span>当前积分</span></div>
                  <div><strong>${mine.streak || 0}</strong><span>连续达标</span></div>
                  <div><strong>${approved}</strong><span>今日完成</span></div>
                </div>
                <div style="margin-top:14px"><button class="btn btn-soft btn-block" data-action="navigate" data-view="rewards">看看奖励 ${ICONS.arrowRight}</button></div>
              </section>
            `
        }

        <section class="card section-card">
          <div class="section-head"><div><h3>最近积分</h3><p>每一分都有来由</p></div></div>
          ${
            dashboard.recentPoints.length
              ? `<div class="ledger-list">${dashboard.recentPoints.slice(0, 5).map((item) => `
                  <div class="ledger-row">
                    <div><strong>${escapeHtml(item.reason)}</strong><small>${formatTimeAgo(item.created_at)}</small></div>
                    <span class="ledger-value ${item.delta > 0 ? "positive" : "negative"}">${item.delta > 0 ? "+" : ""}${item.delta}</span>
                  </div>
                `).join("")}</div>`
              : `<p style="font-size:11px;color:var(--ink-soft);line-height:1.7;margin:0">完成第一个日程后，这里会记录积分变化。</p>`
          }
        </section>
      </aside>
    </div>
  `;
}

async function renderSchedule(content) {
  state.weekStart = state.weekStart || startOfWeek(state.today);
  const end = addDays(state.weekStart, 6);
  const data = await api(`/api/occurrences?start=${state.weekStart}&end=${end}`);
  state.scheduleRows = data.occurrences;
  if (!state.scheduleDate || state.scheduleDate < state.weekStart || state.scheduleDate > end) {
    state.scheduleDate =
      state.today >= state.weekStart && state.today <= end ? state.today : state.weekStart;
  }
  const days = Array.from({ length: 7 }, (_, index) => addDays(state.weekStart, index));
  const dayRows = state.scheduleRows.filter((row) => row.date === state.scheduleDate);
  const grouped = new Map();
  for (const row of dayRows) {
    if (!grouped.has(row.memberId)) grouped.set(row.memberId, []);
    grouped.get(row.memberId).push(row);
  }
  const orderedMemberIds = [...grouped.keys()].sort((a, b) => {
    if (a === state.user.id) return -1;
    if (b === state.user.id) return 1;
    return a - b;
  });
  const completed = dayRows.filter((row) => row.status === "approved").length;
  content.innerHTML = `
    <section class="card section-card">
      <div class="week-controls">
        <div>
          <div class="eyebrow">一周节奏</div>
          <h2>${formatWeekRange(state.weekStart)}</h2>
        </div>
        <div class="week-nav">
          <button class="btn btn-secondary btn-icon" data-action="change-week" data-offset="-7" aria-label="上一周">${ICONS.chevronLeft}</button>
          <button class="btn btn-secondary btn-sm" data-action="current-week">回到本周</button>
          <button class="btn btn-secondary btn-icon" data-action="change-week" data-offset="7" aria-label="下一周"><span style="transform:rotate(180deg)">${ICONS.chevronLeft}</span></button>
        </div>
      </div>
      <div class="week-tabs">
        ${days.map((date) => {
          const rows = state.scheduleRows.filter((row) => row.date === date);
          const dots = Math.min(3, rows.length);
          const weekdayText = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][parseDate(date).getDay()];
          return `
            <button class="day-tab ${date === state.scheduleDate ? "selected" : ""} ${date === state.today ? "today" : ""}" data-action="select-schedule-date" data-date="${date}">
              <small>${weekdayText}</small>
              <strong>${parseDate(date).getDate()}</strong>
              <span class="day-dot-row">${Array.from({ length: dots }, () => '<i class="day-dot"></i>').join("")}</span>
            </button>
          `;
        }).join("")}
      </div>
      <div class="schedule-day-head">
        <div>
          <h2>${formatDate(state.scheduleDate)}</h2>
          <p>${dayRows.length ? `${completed}/${dayRows.length} 项完成` : "这一天还没有安排"}</p>
        </div>
        <button class="btn btn-secondary btn-sm" data-action="new-task">${ICONS.plus}${state.user.role === "parent" ? "添加约定" : "自建任务"}</button>
      </div>
      ${
        dayRows.length
          ? orderedMemberIds.map((memberId) => {
              const rows = grouped.get(memberId);
              const member = rows[0];
              return `
                <div class="group-label">
                  ${miniAvatar({
                    avatarUrl: member.memberAvatarUrl,
                    name: member.memberName,
                    color: member.memberColor,
                  })}
                  ${escapeHtml(member.memberName)}的日程
                </div>
                <div class="task-list">
                  ${rows.map((row) => taskItem(row, row.memberId === state.user.id, false)).join("")}
                </div>
              `;
            }).join("")
          : `<div class="empty-state"><div class="empty-emoji">🗓️</div><strong>留白也是一种安排</strong><p>选择其他日期看看，或者为这一天加入一个轻松的日程。</p><button class="btn btn-primary btn-sm" data-action="new-task">${state.user.role === "parent" ? "新建约定" : "提交自建任务"}</button></div>`
      }
    </section>
  `;
}

async function renderRewards(content) {
  const [data, familyData] = await Promise.all([api("/api/rewards"), api("/api/family")]);
  state.rewards = data.rewards;
  state.familyData = familyData;
  state.user = familyData.user;
  const activeRewards = data.rewards.filter((reward) => reward.active);
  const pendingRedemptions = data.redemptions.filter((item) => item.status === "pending");
  content.innerHTML = `
    <div style="display:grid;gap:20px">
      <div class="two-column">
        <section class="card wallet-card">
          <div class="eyebrow">我的积分罐</div>
          <div class="wallet-balance"><strong>${state.user.points}</strong><span>积分可用</span></div>
          <p class="wallet-note">${
            state.user.role === "parent"
              ? "积分来自真实完成的日程，也来自每一次具体的鼓励。"
              : pendingRedemptions.length
                ? `有 ${pendingRedemptions.length} 个心愿正在等待家长确认。`
                : "选一个真正期待的心愿，让努力有一个可爱的方向。"
          }</p>
        </section>
        <section class="suggestion-card">
          <h3>让奖励保持温度</h3>
          <p>优先选择“一起做点什么”的体验型奖励，少把积分变成单纯交易。孩子没完成时，先一起找困难，不急着扣分；连续稳定的小进步，比偶尔的大奖励更能养成习惯。</p>
        </section>
      </div>

      <section class="card section-card">
        <div class="section-head">
          <div><h2>心愿商店</h2><p>积分足够时就可以兑换，孩子兑换后由家长确认</p></div>
          ${state.user.role === "parent" ? `<button class="btn btn-secondary btn-sm" data-action="new-reward">${ICONS.plus}新奖励</button>` : ""}
        </div>
        ${
          state.rewards.length
            ? `<div class="rewards-grid">
                ${state.rewards.map((reward) => {
                  const enough = state.user.points >= reward.cost;
                  const noStock = reward.stock <= 0;
                  return `
                    <article class="reward-card ${reward.active ? "" : "inactive"}">
                      ${state.user.role === "parent" ? `<button class="icon-btn reward-edit" data-action="edit-reward" data-reward-id="${reward.id}" aria-label="编辑奖励">${ICONS.edit}</button>` : ""}
                      <div class="reward-icon">${escapeHtml(reward.icon)}</div>
                      <h3>${escapeHtml(reward.title)}</h3>
                      <p>${escapeHtml(reward.description || "一份值得期待的小奖励")}</p>
                      <div class="reward-footer">
                        <span class="reward-cost">${ICONS.star}${reward.cost} 分 <small style="font-weight:400;color:var(--ink-soft)">· 余 ${reward.stock}</small></span>
                        <button class="btn btn-sm ${reward.active && !noStock && enough ? "btn-primary" : "btn-secondary"}" data-action="redeem-reward" data-reward-id="${reward.id}" ${!reward.active || noStock || !enough ? "disabled" : ""}>
                          ${!reward.active ? "已下架" : noStock ? "暂无库存" : enough ? "立即兑换" : `还差 ${reward.cost - state.user.points}`}
                        </button>
                      </div>
                    </article>
                  `;
                }).join("")}
              </div>`
            : `<div class="empty-state"><div class="empty-emoji">🎁</div><strong>还没有心愿奖励</strong><p>家长可以加入一个全家都期待的小奖励。</p>${state.user.role === "parent" ? `<button class="btn btn-primary btn-sm" data-action="new-reward">添加奖励</button>` : ""}</div>`
        }
      </section>

      <section class="card section-card">
        <div class="section-head"><div><h2>兑换记录</h2><p>每一个兑现的小心愿</p></div></div>
        ${
          data.redemptions.length
            ? `<div class="redemption-list">${data.redemptions.map((item) => `
                <div class="redemption-row">
                  <span class="redemption-icon">${escapeHtml(item.icon)}</span>
                  <div class="redemption-main">
                    <strong>${escapeHtml(item.memberName)} · ${escapeHtml(item.title)}</strong>
                    <small>${item.cost} 分 · ${formatTimeAgo(item.requestedAt)}</small>
                  </div>
                  <span class="status-tag ${item.status}">${statusLabel(item.status)}</span>
                  ${item.status === "pending" ? `<button class="btn btn-sm btn-secondary" data-action="cancel-redemption" data-redemption-id="${item.id}">取消</button>` : ""}
                </div>
              `).join("")}</div>`
            : `<div class="empty-state" style="padding:15px"><p style="margin:0">还没有兑换记录，继续积累积分吧。</p></div>`
        }
      </section>
    </div>
  `;
}

function weeklyChart(daily) {
  const max = Math.max(1, ...daily.map((day) => day.total));
  return `
    <div class="bar-chart">
      ${daily.map((day) => {
        const height = day.total ? Math.max(5, Math.round((day.approved / max) * 76)) : 3;
        return `
          <div class="bar-column" title="${escapeHtml(day.date)}：完成 ${day.approved}/${day.total}">
            <div class="bar-track"><span class="bar-fill" style="height:${height}px;background:${day.total && day.approved === day.total ? "#47766F" : "#E3A857"}"></span></div>
            <small>${parseDate(day.date).getMonth() + 1}/${parseDate(day.date).getDate()}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function renderFamily(content) {
  const [familyData, reports, dashboard] = await Promise.all([
    api("/api/family"),
    api("/api/reports?days=7"),
    api("/api/dashboard"),
  ]);
  state.familyData = familyData;
  state.user = familyData.user;
  state.dashboard = dashboard;
  const activeMembers = familyData.members.filter((member) => member.active);
  const totalPoints = activeMembers.reduce((sum, member) => sum + member.points, 0);
  content.innerHTML = `
    <div style="display:grid;gap:20px">
      <section class="card family-banner">
        <div class="eyebrow" style="color:#f2d48b">OUR FAMILY</div>
        <h2>${escapeHtml(familyData.family.name)}</h2>
        <p>${activeMembers.length} 位家人共同生活、共同成长。这里不需要完美的每一天，只需要愿意再往前一点。</p>
        <div class="family-avatars">${activeMembers.map((member) => avatar(member)).join("")}</div>
      </section>

      <div class="dashboard-grid">
        <div style="display:grid;gap:20px;min-width:0">
          <section class="card section-card">
            <div class="section-head">
              <div><h2>这一周，我们一起完成</h2><p>${reports.start} 至 ${reports.end}</p></div>
              <span class="status-tag approved">${dashboard.reviewCount ? `${dashboard.reviewCount} 项待审核` : "暂无待审核"}</span>
            </div>
            ${weeklyChart(reports.daily)}
          </section>

          <section class="card section-card">
            <div class="section-head">
              <div><h2>家庭成长榜</h2><p>不是比谁更强，而是看见各自的进步</p></div>
              ${state.user.role === "parent" ? `<button class="text-link" data-action="new-member">${ICONS.plus}添加成员</button>` : ""}
            </div>
            <div class="members-grid">
              ${activeMembers.map((member) => {
                const stats = reports.members.find((item) => item.id === member.id) || {
                  approved: 0,
                  total: 0,
                  percent: 0,
                  points: 0,
                };
                return `
                  <article class="member-card">
                    <div class="member-card-head">
                      ${avatar(member)}
                      <div class="member-card-head-main">
                        <strong>${escapeHtml(member.name)}</strong>
                        <small>${roleLabel(member.role)}</small>
                      </div>
                      <span class="member-card-points">${member.points} 分</span>
                      ${state.user.role === "parent" ? `<button class="icon-btn" data-action="edit-member" data-member-id="${member.id}" aria-label="编辑成员">${ICONS.edit}</button>` : ""}
                    </div>
                    <div class="progress-line" style="--bar-color:${escapeHtml(member.color)}"><span style="--value:${stats.percent}%"></span></div>
                    <div class="member-card-stats"><span>本周完成 ${stats.approved}/${stats.total}</span><span>${stats.percent}%</span></div>
                  </article>
                `;
              }).join("")}
            </div>
          </section>
        </div>

        <aside class="right-rail">
          <section class="card section-card">
            <div class="section-head"><div><h3>家的积分总量</h3><p>一家人共同积累</p></div></div>
            <div class="stat-band">
              <div><strong>${totalPoints}</strong><span>家庭积分</span></div>
              <div><strong>${activeMembers.length}</strong><span>家庭成员</span></div>
              <div><strong>${reports.members.reduce((sum, member) => sum + member.approved, 0)}</strong><span>本周完成</span></div>
            </div>
          </section>

          <section class="card section-card">
            <div class="section-head"><div><h3>我的积分记录</h3><p>最近的变化</p></div></div>
            ${
              dashboard.recentPoints.length
                ? `<div class="ledger-list">${dashboard.recentPoints.slice(0, 6).map((item) => `
                    <div class="ledger-row">
                      <div><strong>${escapeHtml(item.reason)}</strong><small>${formatTimeAgo(item.created_at)}</small></div>
                      <span class="ledger-value ${item.delta > 0 ? "positive" : "negative"}">${item.delta > 0 ? "+" : ""}${item.delta}</span>
                    </div>
                  `).join("")}</div>`
                : `<p style="font-size:11px;color:var(--ink-soft)">还没有积分记录。</p>`
            }
          </section>

          <section class="card section-card">
            <div class="section-head"><div><h3>我的账户</h3><p>${escapeHtml(state.user.name)} · ${roleLabel(state.user.role)}</p></div></div>
            <div style="display:grid;gap:8px">
              <button class="btn btn-secondary btn-block" data-action="change-avatar">${avatar(state.user)}修改我的头像</button>
              <button class="btn btn-secondary btn-block" data-action="change-pin">${ICONS.key}修改登录密码</button>
              <button class="btn btn-danger-soft btn-block" data-action="logout">${ICONS.logout}退出当前账号</button>
            </div>
          </section>

          <section class="suggestion-card">
            <h3>一点小建议</h3>
            <p>每周固定 10 分钟开个家庭小会：一起看看本周完成了什么，哪些安排太难，下周想调整哪一件。让孩子参与制定规则，会比单向督促更容易坚持。</p>
          </section>
        </aside>
      </div>

      ${
        state.user.role === "parent"
          ? `
            <section class="card section-card">
              <div class="section-head"><div><h2>家庭设置</h2><p>设置会应用到所有家庭成员</p></div></div>
              <div class="settings-list">
                <div class="settings-row">
                  <div><strong>家庭名称</strong><small>显示在登录页和家庭首页</small></div>
                  <form class="inline-form" data-form="family-name">
                    <input class="input" name="name" value="${escapeHtml(familyData.family.name)}" maxlength="40" required>
                    <button class="btn btn-secondary btn-sm" type="submit">保存</button>
                  </form>
                </div>
                <div class="settings-row">
                  <div><strong>家庭成员</strong><small>管理称呼、头像与登录密码</small></div>
                  <button class="btn btn-secondary btn-sm" data-action="new-member">添加成员</button>
                </div>
                <div class="settings-row">
                  <div><strong>积分调整</strong><small>可用于家庭特别奖励或规则修正</small></div>
                  <button class="btn btn-secondary btn-sm" data-action="adjust-points">调整积分</button>
                </div>
              </div>
            </section>
          `
          : ""
      }
    </div>
  `;
}

function completionRow(item) {
  return `
    <div class="approval-row">
      ${miniAvatar({
        avatarUrl: item.memberAvatarUrl,
        name: item.memberName,
        color: item.memberColor,
      })}
      <div class="approval-info">
        <strong>${escapeHtml(item.memberName)} · ${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.date)} ${escapeHtml(item.dueTime || "")} · +${item.points} 分</small>
        ${item.evidenceNote ? `<p class="evidence-note">${escapeHtml(item.evidenceNote)}</p>` : ""}
        ${item.evidenceUrl ? `<a class="evidence-link" href="${escapeHtml(item.evidenceUrl)}" target="_blank" rel="noopener">查看成果照片</a>` : ""}
      </div>
      <div class="approval-actions">
        <button class="btn btn-sm btn-soft" data-action="review-completion" data-status="approved" data-completion-id="${item.id}">通过</button>
        <button class="btn btn-sm btn-secondary" data-action="review-completion" data-status="rejected" data-completion-id="${item.id}">退回</button>
      </div>
    </div>
  `;
}

function deductionManageList(rules) {
  if (!rules.length) {
    return `
      <div class="empty-state">
        <div class="empty-emoji">⚠️</div>
        <strong>还没有扣分约定</strong>
        <p>先通过警告帮助孩子认识边界，再约定需要承担的积分后果。</p>
        <button class="btn btn-primary btn-sm" data-action="new-deduction">新建扣分项</button>
      </div>
    `;
  }
  return `<div class="deduction-manage-list">
    ${rules.map((rule) => {
      const pending = rule.status === "pending_acceptance";
      const used = Math.min(rule.warningsUsed, rule.warningLimit);
      const dots = Math.max(0, Math.min(8, rule.warningLimit));
      const latest = rule.events?.[0];
      return `
        <article class="deduction-manage-row">
          ${miniAvatar({
            avatarUrl: rule.memberAvatarUrl,
            name: rule.memberName,
            color: rule.memberColor,
          })}
          <div class="deduction-manage-main">
            <div class="deduction-rule-title">
              <strong>${escapeHtml(rule.title)}</strong>
              <span class="status-tag ${pending ? "pending" : "approved"}">${pending ? "等待孩子接受" : "已生效"}</span>
            </div>
            <div class="task-detail">
              <span>${escapeHtml(rule.memberName)}</span>
              <span>${rule.warningLimit} 次警告</span>
              <span class="deduction-points">用完后每次 -${rule.points} 分</span>
            </div>
            ${
              pending
                ? `<p class="deduction-latest">孩子接受前不能记录或扣分</p>`
                : `<div class="warning-track">${Array.from({ length: dots }, (_, index) => `<i class="${index < used ? "used" : ""}"></i>`).join("")}<small>已用 ${used}/${rule.warningLimit} 次警告</small></div>`
            }
            ${latest ? `<p class="deduction-latest">${latest.type === "deduction" ? `上次扣除 ${Math.abs(latest.pointsDelta)} 分` : latest.type === "reset" ? "已开启新一轮警告" : `上次记录第 ${latest.warningAfter} 次警告`}${latest.note ? ` · ${escapeHtml(latest.note)}` : ""}</p>` : ""}
          </div>
          <div class="deduction-manage-actions">
            ${!pending ? `<button class="btn btn-sm ${used >= rule.warningLimit ? "btn-danger-soft" : "btn-soft"}" data-action="record-deduction" data-rule-id="${rule.id}">${used >= rule.warningLimit ? "执行扣分" : "记录一次"}</button>` : ""}
            <button class="icon-btn" data-action="edit-deduction" data-rule-id="${rule.id}" aria-label="编辑扣分项">${ICONS.edit}</button>
            ${!pending ? `<button class="icon-btn" data-action="reset-deduction" data-rule-id="${rule.id}" aria-label="重置警告">↻</button>` : ""}
            <button class="icon-btn" data-action="delete-deduction" data-rule-id="${rule.id}" aria-label="删除扣分项">${ICONS.trash}</button>
          </div>
        </article>
      `;
    }).join("")}
  </div>`;
}

async function renderManage(content) {
  if (state.user.role !== "parent") return navigate("today");
  const [tasksData, deductionData, completionsData, redemptionsData, familyData, reports] = await Promise.all([
    api("/api/tasks"),
    api("/api/deduction-rules"),
    api("/api/completions?status=pending"),
    api("/api/redemptions?status=pending"),
    api("/api/family"),
    api("/api/reports?days=7"),
  ]);
  state.manageTasks = tasksData.tasks;
  state.deductionRules = deductionData.rules;
  state.familyData = familyData;
  state.user = familyData.user;
  const pendingCompletions = completionsData.completions;
  const pendingRedemptions = redemptionsData.redemptions;
  const pendingTaskReviews = state.manageTasks.filter(
    (task) => task.taskType === "custom" && task.workflowStatus === "pending_approval"
  );
  state.reviewCount =
    pendingCompletions.length + pendingRedemptions.length + pendingTaskReviews.length;
  const activeMembers = familyData.members.filter((member) => member.active);
  const average =
    reports.members.length
      ? Math.round(
          reports.members.reduce((sum, member) => sum + member.percent, 0) / reports.members.length
        )
      : 0;
  const weekPoints = reports.members.reduce((sum, member) => sum + member.points, 0);
  content.innerHTML = `
    <div style="display:grid;gap:20px">
      <section class="manage-metrics">
        <div class="metric-card accent"><span>待处理事项</span><strong>${state.reviewCount}</strong></div>
        <div class="metric-card"><span>本周家庭完成率</span><strong>${average}%</strong></div>
        <div class="metric-card"><span>本周赚取积分</span><strong>${weekPoints}</strong></div>
        <div class="metric-card"><span>日程模版</span><strong>${state.manageTasks.length}</strong></div>
      </section>

      <section class="card section-card">
        <div class="section-head">
          <div><h2>审核与确认</h2><p>让孩子的努力得到及时回应</p></div>
          ${state.reviewCount ? `<span class="status-tag pending">${state.reviewCount} 项待处理</span>` : ""}
        </div>
        <div class="approval-block">
          <h3>自建任务提案 · ${pendingTaskReviews.length}</h3>
          ${
            pendingTaskReviews.length
              ? pendingTaskReviews.map((task) => `
                  <div class="approval-row">
                    ${miniAvatar({
                      avatarUrl: task.memberAvatarUrl,
                      name: task.memberName,
                      color: task.memberColor,
                    })}
                    <div class="approval-info">
                      <strong>${escapeHtml(task.memberName)} · ${escapeHtml(task.title)}</strong>
                      <small>${escapeHtml(recurrenceLabel(task))} · ${task.points} 分${task.notes ? ` · ${escapeHtml(task.notes)}` : ""}</small>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-soft" data-action="review-task" data-status="approved" data-task-id="${task.id}">通过生效</button>
                      <button class="btn btn-sm btn-secondary" data-action="review-task" data-status="rejected" data-task-id="${task.id}">退回修改</button>
                    </div>
                  </div>
                `).join("")
              : `<p style="font-size:11px;color:var(--ink-soft);margin:0">暂时没有孩子提交的自建任务。</p>`
          }
        </div>
        <div class="approval-block">
          <h3>任务完成 · ${pendingCompletions.length}</h3>
          ${
            pendingCompletions.length
              ? pendingCompletions.map(completionRow).join("")
              : `<p style="font-size:11px;color:var(--ink-soft);margin:0">暂时没有待审核的任务完成。</p>`
          }
        </div>
        <div class="approval-block">
          <h3>奖励兑换 · ${pendingRedemptions.length}</h3>
          ${
            pendingRedemptions.length
              ? pendingRedemptions.map((item) => `
                  <div class="approval-row">
                    <span class="redemption-icon">${escapeHtml(item.icon)}</span>
                    <div class="approval-info">
                      <strong>${escapeHtml(item.member_name)} · ${escapeHtml(item.title)}</strong>
                      <small>${item.cost} 分 · ${formatTimeAgo(item.requested_at)}</small>
                    </div>
                    <div class="approval-actions">
                      <button class="btn btn-sm btn-soft" data-action="review-redemption" data-status="approved" data-redemption-id="${item.id}">兑现</button>
                      <button class="btn btn-sm btn-secondary" data-action="review-redemption" data-status="rejected" data-redemption-id="${item.id}">退回</button>
                    </div>
                  </div>
                `).join("")
              : `<p style="font-size:11px;color:var(--ink-soft);margin:0">暂时没有待确认的奖励兑换。</p>`
          }
        </div>
      </section>

      <div class="dashboard-grid">
        <div style="display:grid;gap:20px;min-width:0">
          <section class="card section-card">
            <div class="section-head">
              <div><h2>日程模板</h2><p>日程会按重复规则出现在每个对应日期</p></div>
              <button class="btn btn-primary btn-sm" data-action="new-task">${ICONS.plus}新建约定</button>
            </div>
            ${
              state.manageTasks.length
                ? `<div class="table-list">${state.manageTasks.map((task) => {
                    const typeLabel = task.taskType === "custom" ? "自建" : "约定";
                    const pendingCount = (task.members || []).filter(
                      (member) => member.acceptanceStatus === "pending_acceptance"
                    ).length;
                    const workflowLabel = task.taskType === "agreed" && pendingCount
                      ? `${pendingCount} 人待接受`
                      : {
                      pending_acceptance: "等待孩子接受",
                      pending_approval: "等待家长审核",
                      active: "已生效",
                      rejected: "已退回",
                    }[task.workflowStatus] || task.workflowStatus;
                    return `
                    <div class="table-row">
                      <div class="table-title">
                        <span class="task-icon">${categoryEmoji(task.category)}</span>
                        <div class="table-title-text">
                          <strong>${escapeHtml(task.title)}</strong>
                          <small>${typeLabel} · ${workflowLabel} · +${task.points} 分</small>
                        </div>
                      </div>
                      <div class="table-cell task-assignees">${(task.members || []).map((member) => `
                        <span class="assignee-item">${miniAvatar(member)}<span>${escapeHtml(member.name)}</span></span>
                      `).join("")}</div>
                      <div class="table-cell"><small>${task.dueTime || "时间灵活"} · ${recurrenceLabel(task)}</small></div>
                      <div class="table-actions">
                        ${task.taskType === "agreed" ? `<button class="icon-btn" data-action="edit-task" data-task-id="${task.id}" aria-label="编辑约定">${ICONS.edit}</button>` : ""}
                        ${task.taskType === "custom" && task.workflowStatus === "pending_approval" ? `
                          <button class="btn btn-sm btn-soft" data-action="review-task" data-status="approved" data-task-id="${task.id}">通过</button>
                          <button class="btn btn-sm btn-secondary" data-action="review-task" data-status="rejected" data-task-id="${task.id}">退回</button>
                        ` : ""}
                        <button class="icon-btn" data-action="delete-task" data-task-id="${task.id}" aria-label="删除日程">${ICONS.trash}</button>
                      </div>
                    </div>
                  `;
                  }).join("")}</div>`
                : `<div class="empty-state"><div class="empty-emoji">🗓️</div><strong>还没有日程模板</strong><p>从每天都能完成的一件小事开始。</p><button class="btn btn-primary btn-sm" data-action="new-task">新建约定</button></div>`
            }
          </section>
          <section class="card section-card">
            <div class="section-head">
              <div><h2>扣分约定</h2><p>每个扣分项先警告，警告用完后按约定扣分</p></div>
              <button class="btn btn-primary btn-sm" data-action="new-deduction">${ICONS.plus}新建扣分项</button>
            </div>
            ${deductionManageList(state.deductionRules)}
          </section>
        </div>

        <aside class="right-rail">
          <section class="card section-card">
            <div class="section-head">
              <div><h3>家庭成员</h3><p>${activeMembers.length} 位成员在使用</p></div>
              <button class="text-link" data-action="new-member">${ICONS.plus}添加</button>
            </div>
            <div class="member-stack">
              ${familyData.members.map((member) => `
                <div class="member-row">
                  ${avatar(member)}
                  <div class="member-row-main">
                    <div class="member-row-top"><strong>${escapeHtml(member.name)} ${member.active ? "" : "（停用）"}</strong><span>${roleLabel(member.role)} · ${member.points} 分</span></div>
                    <div class="progress-line"><span style="--value:${Math.min(100, member.points % 100)}%;--bar-color:${escapeHtml(member.color)}"></span></div>
                  </div>
                  <button class="icon-btn" data-action="edit-member" data-member-id="${member.id}" aria-label="编辑成员">${ICONS.edit}</button>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="card section-card">
            <div class="section-head"><div><h3>积分与奖励</h3><p>维护家庭的鼓励方式</p></div></div>
            <div style="display:grid;gap:8px">
              <button class="btn btn-secondary btn-block" data-action="navigate" data-view="rewards">${ICONS.gift}管理奖励与兑换</button>
              <button class="btn btn-secondary btn-block" data-action="adjust-points">${ICONS.star}手动调整成员积分</button>
            </div>
          </section>
          <section class="suggestion-card">
            <h3>管理提示</h3>
            <p>审核不是监督孩子每一秒，而是帮助孩子练习自我检查。退回任务时，写下一句具体建议，下一次更容易做好。</p>
          </section>
        </aside>
      </div>
    </div>
  `;
}

function recurrenceLabel(task) {
  if (task.recurrence === "daily") return "每天";
  if (task.recurrence === "weekdays") return "工作日";
  if (task.recurrence === "weekly") {
    const names = ["一", "二", "三", "四", "五", "六", "日"];
    return `每周${(task.weekdays || []).map((day) => names[day - 1]).join("、")}`;
  }
  return `${formatDate(task.startDate, { short: true })}单次`;
}

function openModal(title, subtitle, body) {
  document.getElementById("modal-root").innerHTML = `
    <div class="modal-backdrop" data-action="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="modal-head">
          <div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div>
          <button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">${ICONS.close}</button>
        </div>
        <div class="modal-body">${body}</div>
      </div>
    </div>
  `;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
  document.body.style.overflow = "";
}

function formError(form, message) {
  const node = form.querySelector("[data-form-error]");
  if (node) node.textContent = message;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("照片读取失败，请重新选择"));
    reader.readAsDataURL(file);
  });
}

async function compressEvidenceImage(file) {
  if (!file?.size) return null;
  if (!file.type.startsWith("image/")) throw new Error("请选择图片文件");
  const dataUrl = await readFileAsDataUrl(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      if (String(dataUrl).length < 5 * 1024 * 1024) resolve(dataUrl);
      else reject(new Error("照片处理失败，请换一张较小的图片"));
    };
    image.src = dataUrl;
  });
}

async function ensureFamilyData() {
  if (!state.familyData) state.familyData = await api("/api/family");
  return state.familyData;
}

async function openTaskModal(task = null) {
  const familyData = await ensureFamilyData();
  const isChild = state.user.role === "child";
  const members = familyData.members.filter(
    (member) => member.active && (!isChild || member.id === state.user.id)
  );
  if (!members.length) return toast("请先添加一位家庭成员", "error");
  const selectedMemberIds = new Set(
    task?.memberIds?.length
      ? task.memberIds
      : [members.find((member) => member.role === "child")?.id || members[0].id]
  );
  const chosenWeekdays = task?.weekdays || [];
  const categories = ["习惯", "学习", "家务", "运动", "亲情", "阅读", "艺术", "其他"];
  const weekNames = ["一", "二", "三", "四", "五", "六", "日"];
  const title = isChild
    ? task
      ? "修改自建任务"
      : "提交自建任务"
    : task
      ? "编辑约定任务"
      : "新建约定任务";
  const subtitle = isChild
    ? "家长审核通过后才会出现在你的日程中"
    : "孩子接受后生效；之后清单由家长维护";
  openModal(
    title,
    subtitle,
    `
      <form class="form-stack" data-form="task" data-task-id="${task?.id || ""}">
        <div class="workflow-note">
          <span class="workflow-icon">${isChild ? "📝" : "🤝"}</span>
          <div>
            <strong>${isChild ? "这是你的自建任务" : "这是一份家庭约定"}</strong>
            <p>${
              isChild
                ? "可提出任务内容、频次与期望积分。家长审核通过后生效；修改已生效任务会重新进入审核。"
                : "孩子接受后按约定频次出现在日程里。若修改已接受的内容，需要孩子重新确认。"
            }</p>
          </div>
        </div>
        <div class="field">
          <label for="task-title">要完成什么</label>
          <input class="input" id="task-title" name="title" maxlength="80" value="${escapeHtml(task?.title || "")}" placeholder="比如：自己整理书包" required autofocus>
        </div>
        ${
          isChild
            ? `<div class="locked-member">${avatar(state.user)}<div><strong>${escapeHtml(state.user.name)}</strong><small>自建任务会提交给家长审核</small></div></div>`
            : `
              <div class="field">
                <span class="field-label">分配给（可同时选择多人）</span>
                <div class="member-multiselect">
                  ${members.map((member) => `
                    <label class="member-select-option">
                      <input type="checkbox" name="memberIds" value="${member.id}" ${selectedMemberIds.has(member.id) ? "checked" : ""}>
                      ${avatar(member)}
                      <span><strong>${escapeHtml(member.name)}</strong><small>${roleLabel(member.role)}</small></span>
                    </label>
                  `).join("")}
                </div>
                <span class="field-hint">每位孩子需要分别接受约定，并独立提交自己的完成成果。</span>
              </div>
              <div class="field">
                <label for="task-category">分类</label>
                <select class="select" id="task-category" name="category">
                  ${categories.map((category) => `<option ${category === (task?.category || "习惯") ? "selected" : ""}>${category}</option>`).join("")}
                </select>
              </div>
            `
        }
        ${
          isChild
            ? `<div class="field">
                <label for="task-category">分类</label>
                <select class="select" id="task-category" name="category">
                  ${categories.map((category) => `<option ${category === (task?.category || "习惯") ? "selected" : ""}>${category}</option>`).join("")}
                </select>
              </div>`
            : ""
        }
        <div class="form-grid">
          <div class="field">
            <label for="task-points">${isChild ? "期望奖励积分" : "验收奖励积分"}</label>
            <input class="input" id="task-points" name="points" type="number" min="0" max="1000" step="1" value="${task?.points ?? 2}" required>
          </div>
          <div class="field">
            <label for="task-time">计划时间</label>
            <input class="input" id="task-time" name="dueTime" type="time" value="${escapeHtml(task?.dueTime || "")}">
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="task-start">开始日期</label>
            <input class="input" id="task-start" name="startDate" type="date" value="${escapeHtml(task?.startDate || state.today)}" required>
          </div>
          <div class="field">
            <label for="task-end">结束日期 <span class="field-hint">（可不填）</span></label>
            <input class="input" id="task-end" name="endDate" type="date" value="${escapeHtml(task?.endDate || "")}">
          </div>
        </div>
        <div class="field">
          <label for="task-recurrence">重复方式</label>
          <select class="select" id="task-recurrence" name="recurrence">
            <option value="once" ${(!task || task.recurrence === "once") ? "selected" : ""}>仅一次</option>
            <option value="daily" ${task?.recurrence === "daily" ? "selected" : ""}>每天</option>
            <option value="weekdays" ${task?.recurrence === "weekdays" ? "selected" : ""}>周一到周五</option>
            <option value="weekly" ${task?.recurrence === "weekly" ? "selected" : ""}>每周指定日期</option>
          </select>
        </div>
        <div class="field ${task?.recurrence === "weekly" ? "" : "hidden"}" data-weekday-field>
          <span class="field-label">每周哪几天</span>
          <div class="weekday-picker">
            ${weekNames.map((name, index) => `
              <label class="weekday-choice">
                <input type="checkbox" name="weekday" value="${index + 1}" ${chosenWeekdays.includes(index + 1) ? "checked" : ""}>
                <span>周${name}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="workflow-note workflow-note--soft">
          <span class="workflow-icon">✅</span>
          <div>
            <strong>按频次上报，由家长验收成果</strong>
            <p>每次上报时需要填写完成成果，也可以附一张照片。验收通过后积分才会到账。</p>
          </div>
        </div>
        <div class="field">
          <label for="task-notes">${isChild ? "为什么想做这件事" : "给孩子的验收说明"} <span class="field-hint">（可选）</span></label>
          <textarea class="textarea" id="task-notes" name="notes" maxlength="500" placeholder="写清具体要做到什么，比只说“认真一点”更有帮助。">${escapeHtml(task?.notes || "")}</textarea>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">${
            isChild
              ? task
                ? "重新提交审核"
                : "提交给家长审核"
              : task
                ? "保存并重新确认"
                : "发起家庭约定"
          }</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

async function openDeductionModal(rule = null) {
  const familyData = await ensureFamilyData();
  const children = familyData.members.filter(
    (member) => member.active && member.role === "child"
  );
  if (!children.length) return toast("请先添加一位孩子成员", "error");
  const memberId = rule?.memberId || children[0].id;
  openModal(
    rule ? "修改扣分项" : "新建扣分项",
    "孩子接受后生效；修改内容后需要孩子重新接受",
    `
      <form class="form-stack" data-form="deduction" data-rule-id="${rule?.id || ""}">
        <div class="workflow-note">
          <span class="workflow-icon">⚠️</span>
          <div>
            <strong>先提醒，再承担约定后果</strong>
            <p>每次记录先消耗一次警告。警告次数用完后，之后每次记录才会按设置扣除积分。</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="deduction-title">扣分项名称</label>
            <input class="input" id="deduction-title" name="title" maxlength="80" value="${escapeHtml(rule?.title || "")}" placeholder="比如：未经同意拿家人的物品" required autofocus>
          </div>
          <div class="field">
            <label for="deduction-member">约定成员</label>
            ${
              rule
                ? `<div class="locked-member" style="min-height:45px">${avatar({ name: rule.memberName, avatarUrl: rule.memberAvatarUrl, color: rule.memberColor })}<div><strong>${escapeHtml(rule.memberName)}</strong><small>扣分项归属成员</small></div></div>`
                : `<select class="select" id="deduction-member" name="memberId" required>
                    ${children.map((child) => `<option value="${child.id}" ${child.id === memberId ? "selected" : ""}>${escapeHtml(child.name)}</option>`).join("")}
                  </select>`
            }
          </div>
        </div>
        <div class="field">
          <label for="deduction-description">具体说明 <span class="field-hint">（孩子需要理解什么行为会触发）</span></label>
          <textarea class="textarea" id="deduction-description" name="description" maxlength="500" placeholder="例如：拿别人的东西前先征得同意；第一次提醒，之后按约定处理。">${escapeHtml(rule?.description || "")}</textarea>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="deduction-warning-limit">警告次数</label>
            <input class="input" id="deduction-warning-limit" name="warningLimit" type="number" min="0" max="99" step="1" value="${rule?.warningLimit ?? 3}" required>
            <span class="field-hint">默认 3 次；填 0 表示第一次记录就扣分。</span>
          </div>
          <div class="field">
            <label for="deduction-points">警告用完后每次扣分</label>
            <input class="input" id="deduction-points" name="points" type="number" min="1" max="1000" step="1" value="${rule?.points ?? 2}" required>
          </div>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">${rule ? "保存并重新确认" : "发起扣分约定"}</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

async function openMemberModal(member = null) {
  openModal(
    member ? "编辑家庭成员" : "添加家庭成员",
    member ? "密码留空表示不修改" : "每位成员都有独立的登录密码与积分",
    `
      <form class="form-stack" data-form="member" data-member-id="${member?.id || ""}">
        <div class="form-grid">
          <div class="field">
            <label for="member-name">成员称呼</label>
            <input class="input" id="member-name" name="name" maxlength="20" value="${escapeHtml(member?.name || "")}" placeholder="比如：小宇" required autofocus>
          </div>
          <div class="field">
            <label for="member-role">家庭角色</label>
            <select class="select" id="member-role" name="role" ${member ? "disabled" : ""}>
              <option value="child" ${(!member || member.role === "child") ? "selected" : ""}>孩子</option>
              <option value="parent" ${member?.role === "parent" ? "selected" : ""}>家长</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="member-color">成员辅助颜色</label>
            <input class="input" id="member-color" name="color" type="color" value="${escapeHtml(member?.color || "#E36F52")}">
            <span class="field-hint">未设置照片时，用于显示姓名首字。</span>
          </div>
          <div class="workflow-note workflow-note--soft">
            <span class="workflow-icon">📷</span>
            <div><strong>头像照片由成员自己设置</strong><p>请成员登录后前往“家庭 → 我的账户”上传照片，家长也可以在这里添加成员。</p></div>
          </div>
        </div>
        <div class="field">
          <label for="member-pin">${member ? "重置登录密码 <span class=\"field-hint\">（留空不修改）</span>" : "登录密码"}</label>
          <input class="input pin-input" id="member-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" placeholder="4–8 位数字" ${member ? "" : "required"}>
        </div>
        ${member ? `
          <label class="checkbox-row">
            <input type="checkbox" name="active" ${member.active ? "checked" : ""}>
            <span><strong>允许该成员登录</strong><small>停用后积分和历史记录会保留，可随时重新启用。</small></span>
          </label>
        ` : ""}
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">${member ? "保存修改" : "添加成员"}</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

function openRewardModal(reward = null) {
  openModal(
    reward ? "编辑奖励" : "添加心愿奖励",
    "设置一个全家认可、真正值得期待的小愿望",
    `
      <form class="form-stack" data-form="reward" data-reward-id="${reward?.id || ""}">
        <div class="form-grid">
          <div class="field">
            <label for="reward-title">奖励名称</label>
            <input class="input" id="reward-title" name="title" maxlength="60" value="${escapeHtml(reward?.title || "")}" placeholder="比如：挑选周末电影" required autofocus>
          </div>
          <div class="field">
            <label for="reward-icon">奖励图标</label>
            <input class="input" id="reward-icon" name="icon" maxlength="8" value="${escapeHtml(reward?.icon || "🎁")}">
          </div>
        </div>
        <div class="field">
          <label for="reward-description">奖励说明</label>
          <textarea class="textarea" id="reward-description" name="description" maxlength="200" placeholder="具体说明什么时间、怎么兑现。">${escapeHtml(reward?.description || "")}</textarea>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="reward-cost">需要积分</label>
            <input class="input" id="reward-cost" name="cost" type="number" min="1" max="100000" value="${reward?.cost || 30}" required>
          </div>
          <div class="field">
            <label for="reward-stock">可兑换数量</label>
            <input class="input" id="reward-stock" name="stock" type="number" min="0" max="9999" value="${reward?.stock ?? 10}" required>
          </div>
        </div>
        ${reward ? `
          <label class="checkbox-row">
            <input type="checkbox" name="active" ${reward.active ? "checked" : ""}>
            <span><strong>在上架状态</strong><small>下架后保留历史兑换记录，但成员不能再兑换。</small></span>
          </label>
        ` : ""}
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">${reward ? "保存修改" : "添加奖励"}</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

async function openPointsModal() {
  const familyData = await ensureFamilyData();
  const members = familyData.members.filter((member) => member.active);
  openModal(
    "调整成员积分",
    "用于补充家庭奖励或修正特殊情况，所有变化都会保留记录",
    `
      <form class="form-stack" data-form="points">
        <div class="field">
          <label for="points-member">家庭成员</label>
          <select class="select" id="points-member" name="memberId">
            ${members.map((member) => `<option value="${member.id}">${escapeHtml(member.name)} · 当前 ${member.points} 分</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="points-delta">调整数量</label>
          <input class="input" id="points-delta" name="delta" type="number" min="-1000" max="1000" value="10" required>
          <span class="field-hint">正数增加积分，负数减少积分；调整后积分不能低于 0。</span>
        </div>
        <div class="field">
          <label for="points-reason">调整原因</label>
          <input class="input" id="points-reason" name="reason" maxlength="100" placeholder="比如：主动帮助家人整理房间" required>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">确认调整</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

function openPinModal() {
  openModal(
    "修改登录密码",
    "密码为 4–8 位数字，修改后其他设备需要重新登录",
    `
      <form class="form-stack" data-form="pin">
        <div class="field">
          <label for="current-pin">当前密码</label>
          <input class="input pin-input" id="current-pin" name="currentPin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required autofocus>
        </div>
        <div class="field">
          <label for="new-pin">新密码</label>
          <input class="input pin-input" id="new-pin" name="newPin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required>
        </div>
        <div class="field">
          <label for="confirm-pin">再次输入新密码</label>
          <input class="input pin-input" id="confirm-pin" name="confirmPin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" required>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">保存新密码</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

function openAvatarModal() {
  openModal(
    "修改我的头像",
    "从相册选择或拍一张照片，会立即更新到全家的页面",
    `
      <form class="form-stack" data-form="profile">
        <div class="profile-avatar-preview">
          <div id="profile-avatar-preview">${avatar(state.user)}</div>
          <div><strong>${escapeHtml(state.user.name)}</strong><span>${roleLabel(state.user.role)} · 我的头像</span></div>
        </div>
        <label class="upload-box" for="avatar-image">
          <span class="upload-icon">📷</span>
          <span><strong>${state.user.avatarUrl ? "更换头像照片" : "选择头像照片"}</strong><small>从相册选择，或使用手机直接拍照</small></span>
          <input id="avatar-image" name="avatarImage" type="file" accept="image/*" capture="user">
        </label>
        <div class="workflow-note workflow-note--soft">
          <span class="workflow-icon">🔒</span>
          <div><strong>照片仅家庭成员可见</strong><p>支持 JPG、PNG 和 WebP，上传前会自动压缩。你随时可以更换或移除照片。</p></div>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">保存头像</button>
          ${state.user.avatarUrl ? `<button class="btn btn-danger-soft btn-lg" type="button" data-action="remove-avatar">移除照片</button>` : ""}
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

function findOccurrence(taskId, date) {
  const candidates = [
    ...(state.scheduleRows || []),
    ...(state.dashboard?.tasks || []),
    ...(state.dashboard?.familyTasks || []),
  ];
  return candidates.find(
    (task) => task.taskId === Number(taskId) && task.date === date
  );
}

function openCompletionModal(task) {
  openModal(
    "上报完成成果",
    "家长会按约定验收这次结果，通过后积分到账",
    `
      <form class="form-stack" data-form="complete" data-task-id="${task.taskId}" data-date="${escapeHtml(task.date)}">
        <div class="completion-summary">
          <span class="task-icon">${categoryEmoji(task.category)}</span>
          <div>
            <strong>${escapeHtml(task.title)}</strong>
            <span>${escapeHtml(task.date)} · ${escapeHtml(task.dueTime || "时间灵活")} · +${task.points} 分</span>
          </div>
          <span class="task-type-chip">${task.taskType === "custom" ? "自建任务" : "约定任务"}</span>
        </div>
        <div class="field">
          <label for="evidence-note">完成成果 <span class="field-hint">（说明你做了什么、结果如何）</span></label>
          <textarea class="textarea" id="evidence-note" name="evidenceNote" maxlength="1000" placeholder="比如：书桌整理好了，课本按科目放进文件袋，铅笔也削好了。" ${task.evidenceRequired ? "" : ""} autofocus></textarea>
        </div>
        <div class="field">
          <label for="evidence-image">成果照片 <span class="field-hint">（可选，手机可直接拍照）</span></label>
          <label class="upload-box" for="evidence-image">
            <span class="upload-icon">📷</span>
            <span><strong>拍照或选择一张照片</strong><small>JPG、PNG 或 WebP，会自动压缩</small></span>
            <input id="evidence-image" name="evidenceImage" type="file" accept="image/*" capture="environment">
          </label>
          <div class="image-preview hidden" data-image-preview></div>
        </div>
        <div class="workflow-note workflow-note--soft">
          <span class="workflow-icon">⏳</span>
          <div><strong>提交后等待家长验收</strong><p>步骤清楚、结果具体的说明，更容易得到清楚的反馈。</p></div>
        </div>
        <p class="form-error" data-form-error></p>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg" type="submit">提交成果</button>
          <button class="btn btn-secondary btn-lg" type="button" data-action="close-modal">取消</button>
        </div>
      </form>
    `
  );
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const submit = form.querySelector('button[type="submit"]');
  formError(form, "");
  if (submit) submit.disabled = true;
  try {
    if (kind === "setup") {
      const data = Object.fromEntries(new FormData(form));
      if (data.childName && !data.childPin) throw new Error("请为孩子设置登录密码");
      if (data.demoData === "on" && !data.childName) {
        throw new Error("使用示例日程时，请填写一位孩子的称呼和密码");
      }
      await api("/api/setup", {
        method: "POST",
        body: { ...data, demoData: data.demoData === "on" },
      });
      await boot();
      return;
    }

    if (kind === "login") {
      const data = Object.fromEntries(new FormData(form));
      await api("/api/login", {
        method: "POST",
        body: { memberId: state.loginMemberId, pin: data.pin },
      });
      state.view = "today";
      await boot();
      return;
    }

    if (kind === "complete") {
      const data = new FormData(form);
      const evidenceNote = String(data.get("evidenceNote") || "").trim();
      const imageFile = data.get("evidenceImage");
      const task = findOccurrence(form.dataset.taskId, form.dataset.date);
      if (task?.evidenceRequired && !evidenceNote && !imageFile?.size) {
        throw new Error("请填写完成成果，或上传一张成果照片");
      }
      const evidenceImage = imageFile?.size
        ? await compressEvidenceImage(imageFile)
        : undefined;
      const result = await api("/api/occurrences/complete", {
        method: "POST",
        body: {
          taskId: Number(form.dataset.taskId),
          date: form.dataset.date,
          evidenceNote,
          evidenceImage,
        },
      });
      closeModal();
      toast(
        result.status === "approved"
          ? `验收结果已记录，获得 ${result.points} 积分`
          : "成果已提交，等待家长验收"
      );
      await navigate(state.view);
      return;
    }

    if (kind === "task") {
      const taskId = form.dataset.taskId;
      const data = new FormData(form);
      const weekdays = [...form.querySelectorAll('input[name="weekday"]:checked')].map(
        (input) => Number(input.value)
      );
      const memberIds = state.user.role === "child"
        ? [state.user.id]
        : data.getAll("memberIds").map(Number).filter(Number.isInteger);
      if (!memberIds.length) throw new Error("请至少选择一位家庭成员");
      const body = {
        title: data.get("title"),
        memberId: memberIds[0],
        memberIds,
        category: data.get("category"),
        points: Number(data.get("points")),
        dueTime: data.get("dueTime") || null,
        startDate: data.get("startDate"),
        endDate: data.get("endDate") || null,
        recurrence: data.get("recurrence"),
        weekdays,
        requireApproval: data.get("requireApproval") === "on",
        notes: data.get("notes"),
      };
      await api(taskId ? `/api/tasks/${taskId}` : "/api/tasks", {
        method: taskId ? "PUT" : "POST",
        body,
      });
      closeModal();
      toast(
        state.user.role === "child"
          ? taskId
            ? "已重新提交给家长审核"
            : "自建任务已提交，等待家长审核"
          : taskId
            ? "约定已更新，等待孩子重新确认"
            : "约定已发起，等待孩子接受"
      );
      await navigate(state.view);
      return;
    }

    if (kind === "deduction") {
      const ruleId = form.dataset.ruleId;
      const data = new FormData(form);
      const body = {
        title: data.get("title"),
        description: data.get("description"),
        points: Number(data.get("points")),
        warningLimit: Number(data.get("warningLimit")),
      };
      if (!ruleId) body.memberId = Number(data.get("memberId"));
      await api(ruleId ? `/api/deduction-rules/${ruleId}` : "/api/deduction-rules", {
        method: ruleId ? "PATCH" : "POST",
        body,
      });
      closeModal();
      toast(ruleId ? "扣分项已修改，等待孩子重新接受" : "扣分约定已发起，等待孩子接受");
      await navigate("manage");
      return;
    }

    if (kind === "member") {
      const memberId = form.dataset.memberId;
      const data = new FormData(form);
      const body = {
        name: data.get("name"),
        color: data.get("color"),
      };
      if (data.get("pin")) body.pin = data.get("pin");
      if (!memberId) body.role = data.get("role");
      if (memberId) body.active = data.get("active") === "on";
      await api(memberId ? `/api/members/${memberId}` : "/api/members", {
        method: memberId ? "PATCH" : "POST",
        body,
      });
      state.familyData = null;
      closeModal();
      toast(memberId ? "成员资料已更新" : "新成员已加入家庭");
      await navigate(state.view);
      return;
    }

    if (kind === "reward") {
      const rewardId = form.dataset.rewardId;
      const data = new FormData(form);
      const body = {
        title: data.get("title"),
        icon: data.get("icon"),
        description: data.get("description"),
        cost: Number(data.get("cost")),
        stock: Number(data.get("stock")),
      };
      if (rewardId) body.active = data.get("active") === "on";
      await api(rewardId ? `/api/rewards/${rewardId}` : "/api/rewards", {
        method: rewardId ? "PUT" : "POST",
        body,
      });
      closeModal();
      toast(rewardId ? "奖励已更新" : "新奖励已上架");
      await navigate(state.view);
      return;
    }

    if (kind === "points") {
      const data = new FormData(form);
      await api("/api/points/adjust", {
        method: "POST",
        body: {
          memberId: Number(data.get("memberId")),
          delta: Number(data.get("delta")),
          reason: data.get("reason"),
        },
      });
      state.familyData = null;
      closeModal();
      toast("积分已调整，记录已保存");
      await navigate(state.view);
      return;
    }

    if (kind === "profile") {
      const data = new FormData(form);
      const imageFile = data.get("avatarImage");
      if (!imageFile?.size && !state.user.avatarUrl) {
        throw new Error("请选择一张头像照片");
      }
      const avatarImage = imageFile?.size
        ? await compressEvidenceImage(imageFile)
        : undefined;
      if (!avatarImage && !state.user.avatarUrl) {
        throw new Error("请选择一张头像照片");
      }
      const result = await api("/api/me/profile", {
        method: "PATCH",
        body: { avatarImage },
      });
      state.user = result.member;
      state.auth.user = result.member;
      state.familyData = null;
      closeModal();
      toast("头像已更新");
      await boot();
      return;
    }

    if (kind === "pin") {
      const data = new FormData(form);
      if (data.get("newPin") !== data.get("confirmPin")) throw new Error("两次输入的新密码不一致");
      await api("/api/me/pin", {
        method: "POST",
        body: { currentPin: data.get("currentPin"), newPin: data.get("newPin") },
      });
      closeModal();
      toast("登录密码已修改");
      return;
    }

    if (kind === "family-name") {
      const data = new FormData(form);
      const result = await api("/api/family", {
        method: "PATCH",
        body: { name: data.get("name") },
      });
      state.auth.family = result.family;
      state.familyData = null;
      toast("家庭名称已保存");
      await navigate("family");
      return;
    }
  } catch (error) {
    formError(form, error.message);
    toast(error.message, "error");
  } finally {
    if (submit) submit.disabled = false;
  }
}

async function handleAction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "modal-backdrop" && target !== event.target) return;
  event.preventDefault();

  try {
    if (action === "reload" || action === "refresh") {
      if (action === "reload") await boot();
      else await navigate(state.view);
    } else if (action === "select-login-member") {
      state.loginMemberId = Number(target.dataset.memberId);
      renderLoginPage(state.auth);
    } else if (action === "logout") {
      await api("/api/logout", { method: "POST" });
      state.user = null;
      state.auth = null;
      state.familyData = null;
      await boot();
    } else if (action === "navigate") {
      await navigate(target.dataset.view);
    } else if (action === "new-task") {
      await openTaskModal();
    } else if (action === "new-deduction") {
      await openDeductionModal();
    } else if (action === "edit-deduction") {
      const rule = state.deductionRules.find(
        (item) => item.id === Number(target.dataset.ruleId)
      );
      if (rule) await openDeductionModal(rule);
    } else if (action === "delete-deduction") {
      if (!window.confirm("删除后这项扣分约定不再显示，历史记录仍会保留。确定删除吗？")) return;
      await api(`/api/deduction-rules/${target.dataset.ruleId}`, { method: "DELETE" });
      toast("扣分项已删除");
      await navigate("manage");
    } else if (action === "accept-deduction") {
      if (!window.confirm("接受这份扣分约定后，家长可按约定记录警告和扣分。确定接受吗？")) return;
      await api(`/api/deduction-rules/${target.dataset.ruleId}/accept`, {
        method: "POST",
      });
      toast("已接受扣分约定");
      await navigate("today");
    } else if (action === "record-deduction") {
      const note = window.prompt("记录本次行为说明（可留空）：", "");
      if (note === null) return;
      const result = await api(
        `/api/deduction-rules/${target.dataset.ruleId}/record`,
        { method: "POST", body: { note } }
      );
      if (result.result === "warning") {
        toast(`已记录警告，本项还剩 ${result.remainingWarnings} 次警告`);
      } else if (result.deducted > 0) {
        toast(`警告已用完，已扣除 ${result.deducted} 积分`);
      } else {
        toast("警告已用完，但当前没有可扣积分");
      }
      await navigate("manage");
    } else if (action === "reset-deduction") {
      if (!window.confirm("将警告次数重置为 0，并开启新一轮提醒吗？")) return;
      await api(`/api/deduction-rules/${target.dataset.ruleId}/reset`, {
        method: "POST",
        body: {},
      });
      toast("已开启新一轮警告");
      await navigate("manage");
    } else if (action === "complete-task") {
      const occurrence = findOccurrence(target.dataset.taskId, target.dataset.date);
      if (occurrence) openCompletionModal(occurrence);
    } else if (action === "change-week") {
      state.weekStart = addDays(state.weekStart, Number(target.dataset.offset));
      state.scheduleDate = state.weekStart;
      await navigate("schedule");
    } else if (action === "current-week") {
      state.weekStart = startOfWeek(state.today);
      state.scheduleDate = state.today;
      await navigate("schedule");
    } else if (action === "select-schedule-date") {
      state.scheduleDate = target.dataset.date;
      await navigate("schedule");
    } else if (action === "close-modal" || action === "modal-backdrop") {
      closeModal();
    } else if (action === "clear-evidence-image") {
      const input = document.getElementById("evidence-image");
      if (input) input.value = "";
      const preview = document.querySelector("[data-image-preview]");
      if (preview) {
        preview.innerHTML = "";
        preview.classList.add("hidden");
      }
    } else if (action === "new-member") {
      await openMemberModal();
    } else if (action === "edit-member") {
      await ensureFamilyData();
      const member = state.familyData.members.find(
        (item) => item.id === Number(target.dataset.memberId)
      );
      if (member) await openMemberModal(member);
    } else if (action === "new-reward") {
      openRewardModal();
    } else if (action === "edit-reward") {
      const reward = state.rewards.find((item) => item.id === Number(target.dataset.rewardId));
      if (reward) openRewardModal(reward);
    } else if (action === "edit-task") {
      const task = [
        ...state.manageTasks,
        ...(state.dashboard?.taskInbox || []),
        ...(state.dashboard?.tasks || []),
        ...(state.scheduleRows || []),
      ].find((item) => item.id === Number(target.dataset.taskId));
      if (task) await openTaskModal(task);
    } else if (action === "delete-task") {
      if (!window.confirm("删除后，这个日程之后的日期将不再出现。历史完成记录仍会保留。确定删除吗？")) return;
      await api(`/api/tasks/${target.dataset.taskId}`, { method: "DELETE" });
      toast("任务已删除");
      await navigate(state.view);
    } else if (action === "accept-task") {
      if (!window.confirm("接受这份家庭约定后，任务会按约定频次加入你的日程。确定接受吗？")) return;
      await api(`/api/tasks/${target.dataset.taskId}/accept`, { method: "POST" });
      toast("已接受约定，任务开始生效");
      await navigate("today");
    } else if (action === "review-task") {
      const status = target.dataset.status;
      let note = "";
      if (status === "rejected") {
        note = window.prompt("写下具体修改建议，孩子会看到：", "请调整任务难度或完成标准后再提交。") || "";
        if (!note.trim()) return;
      }
      await api(`/api/tasks/${target.dataset.taskId}/review`, {
        method: "POST",
        body: { status, note },
      });
      toast(status === "approved" ? "任务已生效" : "任务已退回，孩子可修改后重交");
      await navigate(state.view);
    } else if (action === "adjust-points") {
      await openPointsModal();
    } else if (action === "change-pin") {
      openPinModal();
    } else if (action === "change-avatar") {
      openAvatarModal();
    } else if (action === "remove-avatar") {
      if (!window.confirm("移除头像照片，并使用姓名首字作为头像吗？")) return;
      await api("/api/me/avatar", { method: "DELETE" });
      closeModal();
      toast("头像照片已移除");
      await boot();
    } else if (action === "redeem-reward") {
      const reward = state.rewards.find((item) => item.id === Number(target.dataset.rewardId));
      if (!reward) return;
      if (!window.confirm(`用 ${reward.cost} 积分兑换“${reward.title}”吗？兑换申请会扣除积分，家长退回时会返还。`)) return;
      const result = await api(`/api/rewards/${reward.id}/redeem`, { method: "POST" });
      state.user.points = result.points;
      toast(result.status === "approved" ? "兑换成功！" : "兑换申请已提交");
      await navigate("rewards");
    } else if (action === "cancel-redemption") {
      if (!window.confirm("取消这次兑换申请并退回积分吗？")) return;
      await api(`/api/redemptions/${target.dataset.redemptionId}/cancel`, { method: "POST" });
      toast("兑换已取消，积分已退回");
      await navigate("rewards");
    } else if (action === "review-completion") {
      const status = target.dataset.status;
      await api(`/api/completions/${target.dataset.completionId}/review`, {
        method: "POST",
        body: { status, note: "" },
      });
      toast(status === "approved" ? "已通过，孩子获得积分" : "已退回，不会扣除积分");
      await navigate("manage");
    } else if (action === "review-redemption") {
      const status = target.dataset.status;
      await api(`/api/redemptions/${target.dataset.redemptionId}/review`, {
        method: "POST",
        body: { status, note: "" },
      });
      toast(status === "approved" ? "兑换已确认" : "兑换已退回，积分已返还");
      await navigate("manage");
    }
  } catch (error) {
    toast(error.message, "error");
  }
}

document.addEventListener("submit", handleSubmit);
document.addEventListener("click", handleAction);
document.addEventListener("change", (event) => {
  if (event.target.id === "task-recurrence") {
    const field = document.querySelector("[data-weekday-field]");
    if (field) field.classList.toggle("hidden", event.target.value !== "weekly");
  }
  if (event.target.id === "evidence-image") {
    const preview = document.querySelector("[data-image-preview]");
    const file = event.target.files?.[0];
    if (preview) {
      preview.innerHTML = file
        ? `<img src="${URL.createObjectURL(file)}" alt="成果照片预览"><button type="button" class="btn btn-sm btn-secondary" data-action="clear-evidence-image">移除照片</button>`
        : "";
      preview.classList.toggle("hidden", !file);
    }
  }
  if (event.target.id === "avatar-image") {
    const preview = document.getElementById("profile-avatar-preview");
    const file = event.target.files?.[0];
    if (preview && file) {
      const imageUrl = URL.createObjectURL(file);
      preview.innerHTML = `<span class="avatar has-photo"><img src="${imageUrl}" alt="新头像预览"></span>`;
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".modal-backdrop")) closeModal();
});

window.addEventListener("DOMContentLoaded", boot);
if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
