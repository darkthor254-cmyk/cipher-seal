const encMessage = document.getElementById('encMessage');
const encCharCount = document.getElementById('encCharCount');
const encKey = document.getElementById('encKey');
const encKeyToggle = document.getElementById('encKeyToggle');
const encKeyRandom = document.getElementById('encKeyRandom');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const encryptBtn = document.getElementById('encryptBtn');
const encStatus = document.getElementById('encStatus');
const encOutputBlock = document.getElementById('encOutputBlock');
const encOutput = document.getElementById('encOutput');
const qrHolder = document.getElementById('qrHolder');

encMessage.addEventListener('input', ()=>{
  encCharCount.textContent = encMessage.value.length + ' characters';
});

encKeyToggle.addEventListener('click', ()=>{
  const showing = encKey.type === 'text';
  encKey.type = showing ? 'password' : 'text';
  encKeyToggle.textContent = showing ? '👁' : '🙈';
});

const RANDOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%&*';
encKeyRandom.addEventListener('click', ()=>{
  const arr = crypto.getRandomValues(new Uint32Array(20));
  let out = '';
  arr.forEach(n => out += RANDOM_CHARS[n % RANDOM_CHARS.length]);
  encKey.type = 'text';
  encKeyToggle.textContent = '🙈';
  encKey.value = out;
  updateStrength(out, strengthBar, strengthLabel);
});

encKey.addEventListener('input', ()=>updateStrength(encKey.value, strengthBar, strengthLabel));

encryptBtn.addEventListener('click', async ()=>{
  hideStatus(encStatus);
  encOutputBlock.classList.remove('show');
  qrHolder.classList.remove('show');
  qrHolder.innerHTML = '';
  const msg = encMessage.value;
  const key = encKey.value;
  if(!msg.trim()){ showStatus(encStatus,'err','Enter a message to encrypt.'); return; }
  if(!key){ showStatus(encStatus,'err','Enter a secret key.'); return; }
  encryptBtn.disabled = true;
  encryptBtn.textContent = 'Sealing…';
  try{
    const result = await encryptMessage(msg, key);
    encOutput.value = result;
    encOutput.style.height = 'auto';
    encOutput.style.height = Math.min(220, encOutput.scrollHeight) + 'px';
    encOutputBlock.classList.add('show');
    showStatus(encStatus,'ok','Message encrypted. Copy the text below and share it — send the key another way.');
  }catch(e){
    showStatus(encStatus,'err','Something went wrong while encrypting. Try again.');
  }finally{
    encryptBtn.disabled = false;
    encryptBtn.textContent = 'Encrypt message';
  }
});

document.getElementById('copyEncOutput').addEventListener('click', async ()=>{
  const ok = await copyToClipboard(encOutput.value);
  toast(ok ? 'Copied to clipboard' : 'Could not copy — select the text and copy manually');
});

document.getElementById('downloadEncOutput').addEventListener('click', ()=>{
  if(!encOutput.value){ toast('Nothing to download yet'); return; }
  downloadTextFile('encrypted-message.txt', encOutput.value);
});

document.getElementById('qrEncOutput').addEventListener('click', ()=>{
  if(!encOutput.value){ toast('Encrypt a message first'); return; }
  qrHolder.innerHTML = '';
  qrHolder.classList.add('show');
  new QRCode(qrHolder, { text: encOutput.value, width:200, height:200, colorDark:'#12151B', colorLight:'#ffffff' });
});
