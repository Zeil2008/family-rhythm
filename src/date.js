"use strict";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidDate(value) {
  if (!DATE_PATTERN.test(String(value || ""))) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  return !value || TIME_PATTERN.test(value);
}

function dateInTimeZone(timeZone = "Asia/Shanghai", now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(value, amount) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(value) {
  const date = new Date(`${value}T12:00:00Z`);
  const day = date.getUTCDay();
  return addDays(value, -(day === 0 ? 6 : day - 1));
}

function weekday(value) {
  const day = new Date(`${value}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function dateRange(start, end, maximum = 93) {
  if (!isValidDate(start) || !isValidDate(end) || end < start) {
    throw new Error("日期范围无效");
  }
  const result = [];
  let cursor = start;
  while (cursor <= end && result.length < maximum) {
    result.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return result;
}

function normalizedWeekdays(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter((day) => Number.isInteger(day) && day >= 1 && day <= 7))]
    .sort((a, b) => a - b);
}

function occursOn(task, value) {
  if (task.archived || value < task.start_date) return false;
  if (task.end_date && value > task.end_date) return false;
  if (task.recurrence === "once") return value === task.start_date;
  if (task.recurrence === "daily") return true;
  if (task.recurrence === "weekdays") return weekday(value) <= 5;
  if (task.recurrence === "weekly") {
    let days = [];
    try {
      days = normalizedWeekdays(JSON.parse(task.weekdays || "[]"));
    } catch {
      days = [];
    }
    return days.includes(weekday(value)) || (days.length === 0 && weekday(value) === weekday(task.start_date));
  }
  return false;
}

function timeHasPassed(value, time, now = new Date()) {
  if (!time || value !== dateInTimeZone("Asia/Shanghai", now)) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const current = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${current.hour}:${current.minute}` > time;
}

function formatShortDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

module.exports = {
  addDays,
  dateInTimeZone,
  dateRange,
  formatShortDate,
  isValidDate,
  isValidTime,
  normalizedWeekdays,
  occursOn,
  startOfWeek,
  timeHasPassed,
  weekday,
};
