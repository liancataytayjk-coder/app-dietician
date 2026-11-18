# Meal Prep Buddy

Personal Google Apps Script web app (meal prep, cooking, grocery, nutrition) backed by a Google Sheet.
The owner wants things simple: add features only when they're clearly needed.

## Layout
- `src/Code.gs` — server: reads/writes the bound Sheet (tabs Recipes, Plan, Log, Settings; auto-created by `setup()`).
- `src/Index.html` — the whole UI (vanilla JS, mobile-first). Calls the server via `api(fn, ...args)` → `google.script.run`.
- `src/appsscript.json` — manifest (web app runs as owner, access: only owner).
- `.clasp.json` — points clasp at the Apps Script project (scriptId, rootDir `src`).
- `test/smoke.js` — end-to-end browser test with a fake SpreadsheetApp (`test/fake.js`). Run: `node test/smoke.js`.

## Deploying
Pushing to `main` (changes under `src/`) runs `.github/workflows/deploy.yml`, which `clasp push`es and updates the
existing web app deployment, so the URL never changes. Credentials live in the `CLASPRC_JSON` repo secret.

## When making changes
1. Edit `src/`, keep new server functions listed in the `SERVER` return in `test/smoke.js` if the UI calls them.
2. Run `node test/smoke.js` (must print "Smoke test passed").
3. Commit and push to `main`, then check the Deploy workflow run succeeded.
4. If `appsscript.json` needs new OAuth scopes, the owner has to open the app once and re-authorize.
