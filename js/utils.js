/* ---------- theme ---------- */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  if(themeToggle) themeToggle.textContent = t === 'dark' ? '🌙' : '☀';
  localStorage.setItem('cs-theme', t);
}
applyTheme(localStorage.getItem('cs-theme') || 'dark');
if(themeToggle){
  themeToggle.addEventListener('click', ()=>{
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

/* ---------- toast ---------- */
let toastEl = null;
function toast(msg){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(()=>toastEl.classList.remove('show'), 2200);
}

/* ---------- robust clipboard copy ----------
   navigator.clipboard only works in secure contexts (https or localhost).
   Falls back to a hidden textarea + execCommand for file:// or older browsers. */
async function copyToClipboard(text){
  if(!text) return false;
  if(window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch(e){ /* fall through to legacy method */ }
  }
  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){
    return false;
  }
}

/* ---------- robust file download ----------
   The anchor must be attached to the document before .click() fires
   in some browsers (notably Firefox), or the click is silently ignored. */
function downloadTextFile(filename, text){
  const blob = new Blob([text], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

/* ---------- password strength ---------- */
function scoreStrength(val){
  let score = 0;
  if(val.length >= 8) score++;
  if(val.length >= 14) score++;
  if(/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  return Math.min(score, 4);
}
function updateStrength(val, barEl, labelEl){
  if(!val){
    barEl.style.width = '0%';
    barEl.style.background = 'var(--danger)';
    labelEl.textContent = 'Enter a key to see its strength';
    return;
  }
  const score = scoreStrength(val);
  const pct = [12,30,50,72,100][score];
  const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
  const colors = ['var(--danger)','var(--danger)','var(--brass)','var(--success)','var(--success)'];
  barEl.style.width = pct + '%';
  barEl.style.background = colors[score];
  labelEl.textContent = labels[score] + ' passphrase';
}

/* ---------- status banners ---------- */
function showStatus(el, kind, msg){
  el.className = 'status show ' + kind;
  el.textContent = msg;
}
function hideStatus(el){
  el.className = 'status';
  el.textContent = '';
}

/* ---------- dial animation (home page only) ---------- */
const ticksGroup = document.getElementById('ticksGroup');
if(ticksGroup){
  for(let i=0;i<48;i++){
    const angle = (i/48)*360;
    const long = i % 6 === 0;
    const r1 = 120, r2 = long ? 108 : 114;
    const rad = angle * Math.PI/180;
    const x1 = 150 + r1*Math.sin(rad), y1 = 150 - r1*Math.cos(rad);
    const x2 = 150 + r2*Math.sin(rad), y2 = 150 - r2*Math.cos(rad);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1);
    line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke', long ? 'var(--brass)' : 'var(--border)');
    line.setAttribute('stroke-width', long ? 1.4 : 1);
    ticksGroup.appendChild(line);
  }
  const dialArrow = document.getElementById('dialArrow');
  let dialAngle = 0;
  if(dialArrow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    setInterval(()=>{
      dialAngle += 6;
      dialArrow.style.transform = `rotate(${dialAngle}deg)`;
    }, 1400);
  }
}

/* ---------- footer clock ---------- */
const clockTag = document.getElementById('clockTag');
if(clockTag){
  function tickClock(){
    clockTag.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
  tickClock();
  setInterval(tickClock, 30000);
}
