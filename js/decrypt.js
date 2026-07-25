const decInput = document.getElementById('decInput');
const decKey = document.getElementById('decKey');
const decKeyToggle = document.getElementById('decKeyToggle');
const decryptBtn = document.getElementById('decryptBtn');
const decStatus = document.getElementById('decStatus');
const decOutputBlock = document.getElementById('decOutputBlock');
const decOutput = document.getElementById('decOutput');
const pasteDecInput = document.getElementById('pasteDecInput');
const uploadTxt = document.getElementById('uploadTxt');

decKeyToggle.addEventListener('click', ()=>{
  const showing = decKey.type === 'text';
  decKey.type = showing ? 'password' : 'text';
  decKeyToggle.textContent = showing ? '👁' : '🙈';
});

pasteDecInput.addEventListener('click', async ()=>{
  if(window.isSecureContext && navigator.clipboard && navigator.clipboard.readText){
    try{
      const text = await navigator.clipboard.readText();
      decInput.value = text;
      return;
    }catch(e){ /* fall through */ }
  }
  showStatus(decStatus,'err','Clipboard access needs HTTPS or a manual paste (Ctrl/Cmd+V) into the box.');
});

uploadTxt.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { decInput.value = reader.result.trim(); };
  reader.readAsText(file);
});

decryptBtn.addEventListener('click', async ()=>{
  hideStatus(decStatus);
  decOutputBlock.classList.remove('show');
  const text = decInput.value.trim();
  const key = decKey.value;
  if(!text){ showStatus(decStatus,'err','Paste the encrypted text first.'); return; }
  if(!key){ showStatus(decStatus,'err','Enter the secret key.'); return; }
  decryptBtn.disabled = true;
  decryptBtn.textContent = 'Unlocking…';
  try{
    const plain = await decryptMessage(text, key);
    decOutput.value = plain;
    decOutput.style.height = 'auto';
    decOutput.style.height = Math.min(220, decOutput.scrollHeight) + 'px';
    decOutputBlock.classList.add('show');
    showStatus(decStatus,'ok','Unlocked successfully.');
  }catch(e){
    showStatus(decStatus,'err','Invalid secret key or corrupted message.');
  }finally{
    decryptBtn.disabled = false;
    decryptBtn.textContent = 'Decrypt message';
  }
});

document.getElementById('copyDecOutput').addEventListener('click', async ()=>{
  const ok = await copyToClipboard(decOutput.value);
  toast(ok ? 'Copied to clipboard' : 'Could not copy — select the text and copy manually');
});
