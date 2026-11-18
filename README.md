# Meal Prep Buddy 🥗

A personal meal prep, cooking, grocery and nutrition app built on Google Apps Script.
Your data lives in a Google Sheet that you own.

| Tab | What it does |
|---|---|
| 🍳 Recipes | Save recipes with nutrition per serving. Tap one for cook mode, where you can check off ingredients and steps. |
| 📅 Plan | A weekly grid. Pick a recipe for a slot and tick extra days to batch-prep it. |
| 🛒 Grocery | Built from the week's plan. Combines amounts and works out how many batches to cook. |
| 📊 Nutrition | Log what you ate ("Ate it" on planned meals, or add any food). Shows progress against daily targets. |

## Setup (about 5 minutes)

1. Create a new Google Sheet (for example, at sheets.new) and name it **Meal Prep Buddy**.
2. In the Sheet, go to **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with this repo's [`Code.gs`](Code.gs).
4. Click **+ → HTML**, name the file `Index` (exactly), and paste in [`Index.html`](Index.html).
5. Click **Save** (💾).
6. Click **Deploy → New deployment** and choose the type **Web app**:
   - Execute as: **Me**
   - Who has access: **Only myself**
   - Click **Deploy** and approve the permissions. Google warns that the app is "unverified". That's expected for your own script: click **Advanced → Go to …**.
7. Open the **Web app URL**. The first time it loads, the app creates the Sheet tabs (`Recipes`, `Plan`, `Log`, `Settings`).

**On your phone:** open the URL in your browser and choose **Add to Home Screen**. It then works like an app.

**After you change the code:** go to **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

## Tips

- **Ingredients:** write one per line, starting with the amount: `200 g chicken breast`, `2 eggs`, `1/2 cup oats`, `1 1/2 tbsp soy sauce`. Lines without an amount (such as `salt to taste`) still show up on the grocery list.
- **Nutrition per serving:** take it from the package label or an app like MyFitnessPal. The app multiplies it by the number of servings you eat.
- **Batch prep:** when you add a recipe to a slot, tick the other days you'll eat it. The grocery list works out whole batches. For example, 5 lunches from a 4-serving recipe means 2 batches.
- **Daily targets:** tap ⚙️ (top right).
- You can edit any of your data directly in the Sheet.
