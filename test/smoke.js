const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
  const path=require('path'); const dir=path.join(__dirname,'../src/'); const out=process.env.OUT||require('os').tmpdir(); process.chdir(__dirname);
  let html=fs.readFileSync(dir+'Index.html','utf8');
  html=html.replace('<script>', '<script>'+fs.readFileSync('fake.js','utf8')+'\nconst SERVER=(function(){'+fs.readFileSync(dir+'Code.gs','utf8')+'\nreturn {getAll,getDay,saveRecipe,deleteRecipe,setPlan,addLog,deleteLog,setGroceryChecked,saveSettings};})();\n</script><script>');
  const page=path.join(out,'page.html'); fs.writeFileSync(page,html);
  const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:390,height:844}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  pg.on('dialog',d=>d.accept());
  await pg.goto('file://'+page); await pg.waitForTimeout(300);
  // add recipe
  await pg.click('nav button[data-tab=recipes]'); await pg.click('text=+ New');
  await pg.fill('#r_name',"Chicken Rice Bowl"); await pg.fill('#r_servings','4'); await pg.fill('#r_kcal','550'); await pg.fill('#r_protein','40'); await pg.fill('#r_carbs','60'); await pg.fill('#r_fat','12');
  await pg.fill('#r_ingredients',"800 g chicken breast\n2 cups rice\n1 1/2 tbsp soy sauce\n2 cloves garlic\nbaker's salt to taste");
  await pg.fill('#r_steps',"1. Cook rice\n2. Season chicken\n3. Pan fry and serve");
  await pg.click('#sheet >> text=Save'); await pg.waitForTimeout(300);
  await pg.screenshot({path:path.join(out,'1-cook.png')}); await pg.click('text=All recipes'); await pg.click('text=+ New'); await pg.fill('#r_name','Overnight Oats'); await pg.fill('#r_servings','1'); await pg.fill('#r_kcal','350');
  await pg.fill('#r_ingredients','1/2 cup oats\n1 cup milk\n1 banana'); await pg.click('#sheet >> text=Save'); await pg.waitForTimeout(300);
  await pg.screenshot({path:path.join(out,'1b-list.png')});
  // plan: chicken lunch Mon-Fri (5 meals -> 2 batches), oats breakfast every day
  await pg.click('nav button[data-tab=plan]'); await pg.waitForTimeout(100);
  await pg.locator('.slot').nth(1).click(); await pg.selectOption('#slot_recipe',{label:'Chicken Rice Bowl'});
  for(const i of [1,2,3,4]) await pg.check(`.chips input[value="${i}"]`);
  await pg.click('#sheet >> text=Save'); await pg.waitForTimeout(300);
  await pg.locator('.slot').nth(0).click(); await pg.selectOption('#slot_recipe',{label:'Overnight Oats'});
  for(const i of [1,2,3,4,5,6]) await pg.check(`.chips input[value="${i}"]`);
  await pg.click('#sheet >> text=Save'); await pg.waitForTimeout(300);
  await pg.screenshot({path:path.join(out,'2-plan.png')});
  await pg.click('nav button[data-tab=grocery]'); await pg.waitForTimeout(100);
  await pg.locator('.check input').nth(5).click(); await pg.waitForTimeout(200);
  await pg.screenshot({path:path.join(out,'3-grocery.png'),fullPage:true});
  console.log(await pg.locator('main').innerText());
  await pg.click('nav button[data-tab=nutrition]'); await pg.waitForTimeout(300);
  const ate=pg.locator('text=Ate it'); if(await ate.count()) { await ate.first().click(); await pg.waitForTimeout(300); }
  await pg.click('text=+ Add food'); await pg.fill('#a_name','Banana'); await pg.fill('#a_kcal','105'); await pg.fill('#a_carbs','27'); await pg.fill('#a_servings','2');
  await pg.click('#sheet button:text("Add")'); await pg.waitForTimeout(300);
  await pg.screenshot({path:path.join(out,'4-nutrition.png'),fullPage:true});
  console.log('---\n'+await pg.locator('main').innerText());
  await pg.click('text=⚙️'); await pg.fill('#s_kcal','1800'); await pg.click('#sheet >> text=Save'); await pg.waitForTimeout(300);
  console.log('---sheets', JSON.stringify(await pg.evaluate(()=>book.sheets.map(s=>[s.name,s.data]))));
  console.log('ERRORS',errs); await b.close(); if(errs.length) process.exit(1); console.log('Smoke test passed. Screenshots in',out);
})();
