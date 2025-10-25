// auth.js — hech qanday DOM manipulatsiyasi yo'q
(function(){
  const STORAGE_KEY = 'robobot_users';
  const CUR_KEY = 'robobot_current';

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveUsers(u){ localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }

  const currentUser = localStorage.getItem(CUR_KEY);

  if(!currentUser){
    // foydalanuvchi login qilmagan => login sahifasiga yuborish
    // NOTE: bu redirect tamomila DOM ga tegmaydi, faqatgina sahifa yo'naltiradi
    try { window.location.replace('login.html'); } catch(e){ window.location.href = 'login.html'; }
    return;
  }

  const users = loadUsers();
  const userData = users[currentUser];
  // Agar localStorage dagi current user ma'lumotlari yo'q bo'lsa — reset va loginga yubor
  if(!userData){
    localStorage.removeItem(CUR_KEY);
    try { window.location.replace('login.html'); } catch(e){ window.location.href = 'login.html'; }
    return;
  }

  // boshlang'ich level (o'yin bu qiymatni o'qishi uchun globalga beramiz)
  window.initialPlayerLevel = (typeof userData.level === 'number') ? userData.level : 1;

  // funksiyani globalga qo'yamiz — o'yin level o'zgarganda chaqiradi
  window.updatePlayerLevel = function(newLevel){
    if(typeof newLevel !== 'number') return;
    const all = loadUsers();
    if(!all[currentUser]) all[currentUser] = { password: userData.password || '', level: 1 };
    all[currentUser].level = newLevel;
    saveUsers(all);
    // hamda yangilangan qiymatni ham globalda yangilab qo'yish (agar o'yin yoki boshqa skript unga qarasa)
    window.initialPlayerLevel = newLevel;
    // console.log uchun faqat ichki diagnostika; siz xohlamasangiz olib tashlang
    try { console.log('Progress saqlandi:', currentUser, 'level', newLevel); } catch(e){}
  };

  // foydalanuvchi haqida ma'lumot olish uchun util:
  window.getCurrentUser = function(){
    return { username: currentUser, level: window.initialPlayerLevel };
  };

})();
