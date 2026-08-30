const lc=require('lightningcss');
const fs=require('fs');
const css=fs.readFileSync('C:/Users/Utente/AppData/Local/Temp/opencode/out.css','utf8');
const lines=css.split('\n');
try{
  const r=lc.transform({filename:'globals.css', code:Buffer.from(css), minify:false, errorRecovery:true});
  for(const w of r.warnings){
    console.log('warning at line', w.loc.line, 'col', w.loc.column, ':', w.message);
    console.log('>', lines[w.loc.line-1]);
  }
}catch(e){ console.log('HARD ERROR:', e.message.split('\n')[0]); }
