# Meal Prep Buddy 🥗

A personal meal prep, cooking, grocery and nutrition app built on Google Apps Script.
Your data lives in a Google Sheet that you own.

| Tab | What it does |
|---|---|
| 🍳 Recipes | Save recipes with nutrition per serving. Tap one for cook mode, where you can check off ingredients and steps. |
| 📅 Plan | A weekly grid. Pick a recipe for a slot and tick extra days to batch-prep it. |
| 🛒 Grocery | Built from the week's plan. Combines amounts and works out how many batches to cook. |
| 📊 Nutrition | Log what you ate ("Ate it" on planned meals, or add any food). Shows progress against daily targets. |

## How updates work

The code lives in this repo. Whenever a change lands on `main`, a GitHub Action
(`.github/workflows/deploy.yml`) pushes it to your Apps Script project and updates the web app.
The app URL stays the same. You ask Claude for a change, and it shows up in the app.

## One-time setup (about 10 minutes, all in the browser)

**1. Allow tools to manage your scripts.** Go to https://script.google.com/home/usersettings and turn **Google Apps Script API** on.

**2. Create the app and get a deploy key.** Open https://shell.cloud.google.com. It's free and already signed in to your Google account. Run these commands one at a time:

```bash
npx -y @google/clasp@3.4.1 login --no-localhost
```

Open the link it prints and click **Allow**. The page you end up on won't load, and that's expected. Copy that page's full address from the address bar, paste it into Cloud Shell, and press Enter.

```bash
npx -y @google/clasp@3.4.1 create-script --type sheets --title "Meal Prep Buddy"
```

This creates your Sheet and its script. Copy the **"Created new script"** link it prints.

```bash
cat ~/.clasprc.json
```

Copy everything this prints. It's your deploy key, so keep it private and don't paste it into chat.

**3. Give GitHub the key.** In this repo on GitHub, go to **Settings → Secrets and variables → Actions → New repository secret**:
- Name: `CLASPRC_JSON`
- Secret: paste what `cat ~/.clasprc.json` printed

**4. Send Claude the "Created new script" link.** It isn't secret. Claude adds it to the repo, and the first deploy runs.

**5. Open the app.** The deploy run on GitHub (**Actions** tab → latest run) shows your **App URL**. Open it, approve access to your Sheet, and add it to your phone's home screen.

## Tips

- **Ingredients:** write one per line, starting with the amount: `200 g chicken breast`, `2 eggs`, `1/2 cup oats`, `1 1/2 tbsp soy sauce`. Lines without an amount (such as `salt to taste`) still show up on the grocery list.
- **Nutrition per serving:** take it from the package label or an app like MyFitnessPal. The app multiplies it by the number of servings you eat.
- **Batch prep:** when you add a recipe to a slot, tick the other days you'll eat it. The grocery list works out whole batches. For example, 5 lunches from a 4-serving recipe means 2 batches.
- **Daily targets:** tap ⚙️ (top right).
- You can edit any of your data directly in the Sheet.

## Development

```bash
node test/smoke.js
```

This runs an end-to-end browser test of the app against a fake Sheet.
