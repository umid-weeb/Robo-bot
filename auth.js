// === AUTH SYSTEM ===
const CURRENT_KEY = 'robobot_current';

// Bu login sahifasi uchun faqat localStorage bilan ishlaydi
const STORAGE_KEY = 'robobot_users';

function loadUsers(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch(e){ return {}; }
}
function saveUsers(u){ localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }

function handleSignUp(){
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if(!username || !password) return alert('Iltimos username va parol kiriting.');
  const users = loadUsers();
  if(users[username]) return alert('Bu username allaqachon mavjud. Iltimos Log in qiling yoki boshqa username tanlang.');
  users[username] = { password: password, level: 1 };
  saveUsers(users);
  localStorage.setItem('robobot_current', username);
  window.location.href = "index.html";
}

function handleSignIn(){
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if(!username || !password) return alert('Iltimos username va parol kiriting.');
  const users = loadUsers();
  if(!users[username] || users[username].password !== password) return alert('Username yoki parol noto‘g‘ri.');
  localStorage.setItem('robobot_current', username);
  window.location.href = "index.html";
}

document.getElementById('btnSignUp').addEventListener('click', handleSignUp);
document.getElementById('btnSignIn').addEventListener('click', handleSignIn);

// Enter tugmasi bilan ham ishlash
document.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') handleSignIn();
});

// Agar brauzerda allaqachon current user bo'lsa va user ma'lumotlari mavjud bo'lsa, to'g'ridan-to'g'ri o'yinga o'tkazilsin
(function autoGoIfAlreadyAuth(){
  const cur = localStorage.getItem('robobot_current');
  if(!cur) return;
  const users = loadUsers();
  if(users[cur]) {
    // agar cookie/LS bilan oldin login qilingan bo'lsa, to'g'ridan-to'g'ri index.html
    window.location.href = "index.html";
  } else {
    // agar localStoragedagi current user yo'q bo'lib qolgan bo'lsa — tozalaymiz
    localStorage.removeItem('robobot_current');
  }
})();

// Agar foydalanuvchi login qilmagan bo‘lsa — login sahifasiga qaytar
const currentUser = localStorage.getItem(CURRENT_KEY);
if (!currentUser) {
  window.location.href = "login.html";
}

// Barcha foydalanuvchilarni yuklash
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

// Foydalanuvchilarni saqlash
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Foydalanuvchini yuklash
const users = loadUsers();
const userData = users[currentUser] || { level: 1, password: '' };

// 🔥 O‘yin uchun foydalanuvchi levelini globalga beramiz
window.initialPlayerLevel = userData.level || 1;

// 🧩 O‘yin ichidan progressni saqlaydigan funksiya
window.updatePlayerLevel = function (newLevel) {
  const users = loadUsers();
  if (!users[currentUser]) return;
  users[currentUser].level = newLevel; // foydalanuvchi uchun saqlanadi
  saveUsers(users);
  console.log(`💾 Progress saqlandi: ${currentUser} → Level ${newLevel}`);
};
