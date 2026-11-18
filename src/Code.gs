/**
 * Meal Prep Buddy — server side.
 * Data lives in the Google Sheet this script is attached to.
 * Tabs are created automatically the first time the app opens.
 */

const SHEETS = {
  Recipes: ['id', 'name', 'servings', 'kcal', 'protein', 'carbs', 'fat', 'ingredients', 'steps'],
  Plan: ['week', 'day', 'meal', 'recipeId'],
  Log: ['id', 'date', 'meal', 'name', 'servings', 'kcal', 'protein', 'carbs', 'fat'],
  Settings: ['key', 'value'],
};
const DEFAULT_TARGETS = { kcal: 2000, protein: 120, carbs: 200, fat: 65 };

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Meal Prep Buddy')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

/* ---------- setup & helpers ---------- */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    if (ss.getSheetByName(name)) return;
    const sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // Keep date columns as plain text so Sheets doesn't reformat them.
    if (name === 'Plan') sh.getRange('A:A').setNumberFormat('@');
    if (name === 'Log') sh.getRange('B:B').setNumberFormat('@');
    if (name === 'Settings') {
      const rows = Object.keys(DEFAULT_TARGETS).map(function (k) { return [k, DEFAULT_TARGETS[k]]; });
      sh.getRange(2, 1, rows.length, 2).setValues(rows);
    }
  });
  // Remove the empty default tab, if it's still there.
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

function sheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

/** Reads a tab into objects keyed by header; _row is the sheet row number. */
function rows_(name) {
  const values = sheet_(name).getDataRange().getValues();
  const head = values.shift();
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return values.map(function (r, i) {
    const o = { _row: i + 2 };
    head.forEach(function (h, j) {
      o[h] = r[j] instanceof Date ? Utilities.formatDate(r[j], tz, 'yyyy-MM-dd') : r[j];
    });
    return o;
  });
}

function newId_(prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

function num_(v) {
  return Number(v) || 0;
}

/* ---------- reads ---------- */

/** Everything the app needs for one week (week = Monday as yyyy-MM-dd). */
function getAll(week) {
  setup();
  const recipes = rows_('Recipes').filter(function (r) { return r.id && r.name; }).map(function (r) {
    return {
      id: String(r.id), name: String(r.name), servings: num_(r.servings) || 1,
      kcal: num_(r.kcal), protein: num_(r.protein), carbs: num_(r.carbs), fat: num_(r.fat),
      ingredients: String(r.ingredients || ''), steps: String(r.steps || ''),
    };
  });
  const settings = Object.assign({}, DEFAULT_TARGETS);
  rows_('Settings').forEach(function (s) { if (s.key) settings[s.key] = num_(s.value); });
  const checked = JSON.parse(PropertiesService.getUserProperties().getProperty('grocery_' + week) || '[]');
  return { recipes: recipes, plan: planFor_(week), settings: settings, checked: checked };
}

function planFor_(week, day) {
  return rows_('Plan')
    .filter(function (p) { return p.week === week && (day === undefined || Number(p.day) === day); })
    .map(function (p) { return { day: Number(p.day), meal: String(p.meal), recipeId: String(p.recipeId) }; });
}

/** Log entries + planned meals for one date. */
function getDay(date, week, day) {
  setup();
  const log = rows_('Log').filter(function (l) { return l.date === date; }).map(function (l) {
    return {
      id: String(l.id), meal: String(l.meal), name: String(l.name), servings: num_(l.servings),
      kcal: num_(l.kcal), protein: num_(l.protein), carbs: num_(l.carbs), fat: num_(l.fat),
    };
  });
  return { log: log, planned: planFor_(week, day) };
}

/* ---------- writes ---------- */

function saveRecipe(r) {
  const id = r.id || newId_('r');
  const row = [id, r.name, num_(r.servings) || 1, num_(r.kcal), num_(r.protein), num_(r.carbs), num_(r.fat),
    r.ingredients || '', r.steps || ''];
  const existing = r.id && rows_('Recipes').find(function (x) { return String(x.id) === r.id; });
  if (existing) sheet_('Recipes').getRange(existing._row, 1, 1, row.length).setValues([row]);
  else sheet_('Recipes').appendRow(row);
  return id;
}

function deleteRecipe(id) {
  deleteWhere_('Recipes', function (r) { return String(r.id) === id; });
  deleteWhere_('Plan', function (p) { return String(p.recipeId) === id; });
}

/** Puts one recipe into the same meal slot on several days (batch prep). Empty recipeId clears. */
function setPlan(week, days, meal, recipeId) {
  deleteWhere_('Plan', function (p) {
    return p.week === week && p.meal === meal && days.indexOf(Number(p.day)) !== -1;
  });
  if (!recipeId || !days.length) return;
  const sh = sheet_('Plan');
  const rows = days.map(function (d) { return [week, d, meal, recipeId]; });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
}

function addLog(e) {
  sheet_('Log').appendRow([newId_('l'), e.date, e.meal, e.name, num_(e.servings) || 1,
    num_(e.kcal), num_(e.protein), num_(e.carbs), num_(e.fat)]);
}

function deleteLog(id) {
  deleteWhere_('Log', function (l) { return String(l.id) === id; });
}

function setGroceryChecked(week, keys) {
  PropertiesService.getUserProperties().setProperty('grocery_' + week, JSON.stringify(keys));
}

function saveSettings(s) {
  const sh = sheet_('Settings');
  const rows = Object.keys(DEFAULT_TARGETS).map(function (k) { return [k, num_(s[k])]; });
  sh.getRange(2, 1, sh.getMaxRows() - 1, 2).clearContent();
  sh.getRange(2, 1, rows.length, 2).setValues(rows);
}

function deleteWhere_(name, test) {
  const sh = sheet_(name);
  rows_(name).filter(test).reverse().forEach(function (r) { sh.deleteRow(r._row); });
}
