/* ---------- crypto helpers ----------
   AES-256-GCM via the browser's native Web Crypto API.
   The passphrase is stretched with PBKDF2 (150,000 rounds, SHA-256) and a
   fresh random salt per message. salt + iv + ciphertext are packed together
   and base64-encoded into the text that gets shared. */

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(bytes){
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
function fromBase64(b64){
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(password, salt){
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:150000, hash:'SHA-256' },
    baseKey,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}

async function encryptMessage(message, password){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipherBuf = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(message));
  const cipherBytes = new Uint8Array(cipherBuf);
  const combined = new Uint8Array(salt.length + iv.length + cipherBytes.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(cipherBytes, salt.length + iv.length);
  return toBase64(combined);
}

async function decryptMessage(b64text, password){
  const combined = fromBase64(b64text);
  if(combined.length < 29) throw new Error('Cipher text is too short to be valid.');
  const salt = combined.slice(0,16);
  const iv = combined.slice(16,28);
  const cipherBytes = combined.slice(28);
  const key = await deriveKey(password, salt);
  const plainBuf = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, cipherBytes);
  return dec.decode(plainBuf);
}
