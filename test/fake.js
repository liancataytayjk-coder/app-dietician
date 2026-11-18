// Minimal fake of the Apps Script services used by Code.gs
function FakeSheet(name){ this.name=name; this.data=[]; }
FakeSheet.prototype = {
  getRange(a,c,nr,nc){ const sh=this; if(typeof a==='string') return {setNumberFormat(){return this}};
    return { setValues(v){ for(let i=0;i<nr;i++){ sh.data[a-1+i]=sh.data[a-1+i]||[]; for(let j=0;j<nc;j++) sh.data[a-1+i][c-1+j]=v[i][j]; } return this; },
      setFontWeight(){return this}, clearContent(){ for(let i=0;i<nr;i++){ const r=sh.data[a-1+i]; if(r) for(let j=0;j<nc;j++) r[c-1+j]=''; } return this; } }; },
  setFrozenRows(){}, getLastRow(){ return this.data.length; }, getMaxRows(){ return Math.max(1000,this.data.length); },
  getDataRange(){ const d=this.data; const w=Math.max(...d.map(r=>r.length)); return { getValues(){ return d.map(r=>{const x=r.slice(); while(x.length<w)x.push(''); return x;}); } }; },
  appendRow(r){ this.data.push(r.slice()); }, deleteRow(n){ this.data.splice(n-1,1); },
};
const book={ sheets:[new FakeSheet('Sheet1')] };
const SpreadsheetApp={ getActiveSpreadsheet(){ return {
  getSheetByName(n){ return book.sheets.find(s=>s.name===n)||null; },
  insertSheet(n){ const s=new FakeSheet(n); book.sheets.push(s); return s; },
  getSheets(){ return book.sheets; }, getSpreadsheetTimeZone(){ return 'UTC'; }, deleteSheet(s){ book.sheets=book.sheets.filter(x=>x!==s); } }; } };
const props={}; const PropertiesService={ getUserProperties(){ return { getProperty:k=>props[k]||null, setProperty:(k,v)=>props[k]=v }; } };
const Utilities={ formatDate:d=>d.toISOString().slice(0,10) };
window.google={ script:{ get run(){ let ok=()=>{}, fail=()=>{}; const p=new Proxy({}, { get(_,fn){
  if(fn==='withSuccessHandler') return f=>{ok=f;return p}; if(fn==='withFailureHandler') return f=>{fail=f;return p};
  return (...args)=>setTimeout(()=>{ try{ ok(SERVER[fn](...JSON.parse(JSON.stringify(args)))) }catch(e){ console.error(e); fail(e) } },20); } }); return p; } } };
window.book=book;
