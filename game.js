 // === USER AUTH / LEVEL YUKLASH ===
const startingLevel = (typeof window.initialPlayerLevel === 'number')
? window.initialPlayerLevel
: 1;
let playerLevel = startingLevel; // o'yin shu leveldan boshlanadi
// ================================

// DOM elements
 const robot = document.getElementById('robot');
 const disk = document.getElementById('disk');
 const server = document.getElementById('server');
 const carryDisk = document.getElementById('carryDisk');
 const codeView = document.getElementById('code-view');
 const message = document.getElementById('message');
 const nextLevelBtn = document.getElementById('nextLevelBtn');
 const levelNumber = document.getElementById('level-number');
 const reset_counter = document.getElementById('reset_counter');

 // Game state
 let x = 1, y = 5, dir = 1; // dir: 0=up, 1=right, 2=down, 3=left
 let hasDisk = false;
 let commands = [];
 let level = playerLevel; // localStorage’dan yuklangan leveldan boshlanadi
 let isRunning = false;

 const cellSize = 80;
 let diskPos = { x: 3, y: 3 };
 let serverPos = { x: 5, y: 1 };

 // Initialize grid
 const grid = document.getElementById('grid');
 for (let i = 0; i < 49; i++) {
   const cell = document.createElement('div');
   cell.className = 'cell';
   grid.appendChild(cell);
 }

 // Create animated stars
 function createStars() {
   const starsContainer = document.getElementById('stars');
   for (let i = 0; i < 100; i++) {
     const star = document.createElement('div');
     star.className = 'star';
     star.style.left = Math.random() * 100 + '%';
     star.style.top = Math.random() * 100 + '%';
     star.style.animationDelay = Math.random() * 3 + 's';
     starsContainer.appendChild(star);
   }
 }

 // Add command to the queue
 function addCommand(cmd) {
   if (isRunning) return;

   commands.push(cmd);
   updateCodeView();
 }

 // Update code view
 function updateCodeView() {
   if (commands.length === 0) {
     codeView.innerHTML = '<span style="color: #666;">// Buyruqlaringizni qo\'shing 👇</span>';
   } else {
     codeView.innerHTML = commands.map((cmd, index) => {
       return `
     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
       <span style="color: #00ff9d;">${index + 1}. ${cmd}();</span>
       <button onclick="deleteCommand(${index})" 
         style="background: transparent; border: none; color: #ff4d4d; cursor: pointer; font-size: 14px;">
         ⌫
       </button>
     </div>
   `;
     }).join('');
   }
   codeView.scrollTop = codeView.scrollHeight;
 }

 // Yangi funksiya — buyruqni o‘chirish
 function deleteCommand(index) {
   commands.splice(index, 1);
   updateCodeView();
 }

 // // Update code view
 // function updateCodeView() {
 //   if (commands.length === 0) {
 //     codeView.innerHTML = '<span style="color: #666;">// Buyruqlaringizni qo\'shing 👇</span>';
 //   } else {
 //     codeView.innerHTML = commands.map((cmd, index) => {
 //       return `<span style="color: #00ff9d;">${index + 1}. ${cmd}();</span>`;
 //     }).join('<br>');
 //   }
 //   codeView.scrollTop = codeView.scrollHeight;
 // }

 // Reset game
 function reset() {
   if (isRunning) return;

   x = 1;
   y = 5;
   dir = 1;
   counter = 0;
   hasDisk = false;
   commands = [];
   carryDisk.style.display = "none";
   updateRobot();
   placeObjects();
   showMessage("");
   nextLevelBtn.style.display = "none";
   updateCodeView();



 }

 // Place disk and server
 function placeObjects() {
   disk.style.left = (diskPos.x * cellSize + cellSize / 2 - 20) + "px";
   disk.style.top = (diskPos.y * cellSize + cellSize / 2 - 5) + "px";
   server.style.left = (serverPos.x * cellSize + cellSize / 2 - 35) + "px";
   server.style.top = (serverPos.y * cellSize + cellSize / 2 - 35) + "px";
   disk.style.display = "block";
 }


 function move_forward() {
   if (dir === 0 && y > 0) y--;
   else if (dir === 1 && x < 6) x++;
   else if (dir === 2 && y < 6) y++;
   else if (dir === 3 && x > 0) x--;
   updateRobot();
 }

 // Turn robot left
 function turn_left() {
   dir = (dir + 3) % 4;
   updateRobot();
 }

 // Turn robot right
 function turn_right() {
   dir = (dir + 1) % 4;
   updateRobot();
 }
 // Pick up disk
 function pick_up() {
   if (x === diskPos.x && y === diskPos.y && !hasDisk) {
     hasDisk = true;
     disk.style.display = "none";
     carryDisk.style.display = "block";
     showMessage("💾 Disk olindi!", "success");
   } else if (hasDisk) {
     showMessage("❌ Siz allaqachon disk ko'taryapsiz!", "error");
   } else {
     showMessage("❌ Bu yerda disk yo'q!", "error");
   }
 }

 // Insert disk into server
 function insert() {
   if (x === serverPos.x && y === serverPos.y && hasDisk) {
     showMessage("🎉 TABRIKLAYMIZ! Disk serverga joylandi!", "success");
     carryDisk.style.display = "none";
     hasDisk = false;
     robot.classList.add('victory-animation');
     setTimeout(() => {
       robot.classList.remove('victory-animation');
       nextLevelBtn.style.display = "block";
     }, 1500);
   } else if (x === serverPos.x && y === serverPos.y && !hasDisk) {
     showMessage("❌ Avval diskni oling!", "error");
   } else {
     showMessage("❌ Bu joyda server yo'q!", "error");
   }
 }

 // Update robot position and rotation
 function updateRobot() {
   robot.style.left = (x * cellSize + cellSize / 2 - 35) + "px";
   robot.style.top = (y * cellSize + cellSize / 2 - 35) + "px";
   robot.style.transform = `rotate(${dir * 90}deg)`;
 }

 // Show message
 function showMessage(text, type = "") {
   message.textContent = text;
   message.className = type;
 }

 // Run commands
 function run() {
   if (isRunning || commands.length === 0) return;

   isRunning = true;
   showMessage("🤖 Dastur bajarilmoqda...", "");

   let i = 0;
   function next() {
     if (i < commands.length) {
       const cmd = commands[i];

       // Highlight current command
       updateCodeView();
       codeView.innerHTML = commands.map((c, index) => {
         const color = index === i ? '#ffff00' : '#00ff9d';
         const weight = index === i ? 'bold' : 'normal';
         return `<span style="color: ${color}; font-weight: ${weight};">${index + 1}. ${c}();</span>`;
       }).join('<br>');

       // Execute command
       window[cmd]();
       i++;
       setTimeout(next, 600);
     } else {
       isRunning = false;
       updateCodeView();
     }
   }
   next();
 }
 // === Klaviatura boshqaruvi ===
 document.addEventListener("keydown", (e) => {
   switch (e.key.toLowerCase()) {
     case "arrowup":
       addCommand("move_forward");
       break;
     case "arrowleft":
       addCommand("turn_left");
       break;
     case "arrowright":
       addCommand("turn_right");
       break;
     case "p": // 'P' ni bossang — pick_up
       addCommand("pick_up");
       break;
     case "i": // 'I' ni bossang — insert
       addCommand("insert");
       break;
     case "r": // 'R' ni bossang — reset
       reset();
       break;
     case "enter": // Enter bosilganda Run
       run();
       break;
     case "backspace": // Backspace bosilganda oxirgi buyruqni o'chirish
       e.preventDefault(); // sahifani orqaga qaytishdan saqlaydi holos 
       if (commands.length > 0) {
         commands.pop(); // oxirgi buyruqni o'chirish yban
         updateCodeView(); // code oynasini yangilash uchun molla holos
       }
       break;
   }
 });



 // Next level
 function nextLevel() {
   level++;
   window.updatePlayerLevel(level); // foydalanuvchi progressini saqlaydi
   levelNumber.textContent = level;
   showMessage("🆙 Level " + level + " boshlandi!", "success");
   nextLevelBtn.style.display = "none";

   x = 1;
   y = 5;
   dir = 1;
   hasDisk = false;
   commands = [];

   // Generate random positions
   diskPos = {
     x: Math.floor(Math.random() * 5) + 1,
     y: Math.floor(Math.random() * 5) + 1
   };
   serverPos = {
     x: Math.floor(Math.random() * 5) + 1,
     y: Math.floor(Math.random() * 5) + 1
   };

   // Ensure disk and server are not at the same position
   while (diskPos.x === serverPos.x && diskPos.y === serverPos.y) {
     serverPos = {
       x: Math.floor(Math.random() * 5) + 1,
       y: Math.floor(Math.random() * 5) + 1
     };
   }

   carryDisk.style.display = "none";
   placeObjects();
   updateRobot();
   updateCodeView();
 }

 // Initialize game
 createStars();
 updateRobot();
 placeObjects();
 updateCodeView();