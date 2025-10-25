// === AUTH SYSTEM ===
const STORAGE_KEY = 'robobot_users';
const CURRENT_KEY = 'robobot_current';

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
