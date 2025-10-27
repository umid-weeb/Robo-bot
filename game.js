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

let resetCount = 0;
const MAX_RESETS = 3;

// Game state
let x = 1, y = 5, dir = 1; // dir: 0=up, 1=right, 2=down, 3=left
let hasDisk = false;
let commands = [];
let level = 1;
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

// Stars background
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

// === KOMANDA QO‘SHISH ===
function addCommand(cmd) {
  if (isRunning) return;
  commands.push(cmd);
  updateCodeView();
}

// === KOMANDA O‘CHIRISH ===
function deleteCommand(index) {
  commands.splice(index, 1);
  updateCodeView();
}

// === CODE PANELNI YANGILASH ===
function updateCodeView() {
  if (commands.length === 0) {
    codeView.innerHTML = '<span style="color: #666;">// Buyruqlaringizni qo\'shing 👇</span>';
  } else {
    codeView.innerHTML = commands.map((cmd, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="color: #00ff9d;">${index + 1}. ${cmd}();</span>
        <button onclick="deleteCommand(${index})"
          style="background: transparent; border: none; color: #ff4d4d; cursor: pointer; font-size: 14px;">
          ⌫
        </button>
      </div>
    `).join('');
  }
  codeView.scrollTop = codeView.scrollHeight;
}

// === RESET FUNKSIYASI ===
function reset() {
  if (isRunning) return;
  resetCount++;
  if (reset_counter) reset_counter.textContent = resetCount;

  if (resetCount === MAX_RESETS) {
    showMessage("💀 Siz 3 marta reset qildingiz! O‘yin tugadi!", "error");
    disableGame();
    return;
  }

  x = 1;
  y = 5;
  dir = 1;
  hasDisk = false;
  commands = [];
  carryDisk.style.display = "none";
  updateRobot();
  placeObjects();
  showMessage(`🔁 Qayta boshladingiz (${resetCount}/${MAX_RESETS})`);
  nextLevelBtn.style.display = "none";
  updateCodeView();
}

// === ROBOTNI HARAKAT QILDIRISH ===
function move_forward() {
  let oldX = x, oldY = y;

  if (dir === 0) y--;        // UP
  else if (dir === 1) x++;   // RIGHT
  else if (dir === 2) y++;   // DOWN
  else if (dir === 3) x--;   // LEFT

  // DEVORGA URILGANINI TEKSHIRISH
  if (x < 0 || x > 6 || y < 0 || y > 6) {
    explodeRobot();
    x = oldX;
    y = oldY;
    return;
  }

  updateRobot();
}

// === PORTLASH FUNKSIYASI ===
function explodeRobot() {
  isRunning = true;
  showMessage("💥 Siz devorga urildingiz! O‘yin tugadi!", "error");
  robot.classList.add("explode");

  setTimeout(() => {
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "🔁 Qayta boshlash";
    restartBtn.style.marginTop = "15px";
    restartBtn.style.padding = "10px 20px";
    restartBtn.style.border = "none";
    restartBtn.style.borderRadius = "8px";
    restartBtn.style.background = "#ff4444";
    restartBtn.style.color = "white";
    restartBtn.style.cursor = "pointer";
    restartBtn.onclick = () => location.reload();
    message.innerHTML = "💥 Siz devorga urildingiz!<br>🔁 Qayta boshlang!";
    message.appendChild(restartBtn);
  }, 1200);
}

// === O‘YINNI TO‘XTATISH ===
function disableGame() {
  isRunning = true;
  document.querySelectorAll("button").forEach(btn => btn.disabled = true);
}

// === OBYEKT JOYLARI ===
function placeObjects() {
  disk.style.left = (diskPos.x * cellSize + cellSize / 2 - 20) + "px";
  disk.style.top = (diskPos.y * cellSize + cellSize / 2 - 5) + "px";
  server.style.left = (serverPos.x * cellSize + cellSize / 2 - 35) + "px";
  server.style.top = (serverPos.y * cellSize + cellSize / 2 - 35) + "px";
  disk.style.display = "block";
}

// === ROBOTNI BURISH ===
function turn_left() {
  dir = (dir + 3) % 4;
  updateRobot();
}

function turn_right() {
  dir = (dir + 1) % 4;
  updateRobot();
}

// === DISK O‘LISH ===
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

// === SERVERGA DISK JOYLASH ===
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

// === ROBOTNI YANGILASH ===
function updateRobot() {
  robot.style.left = (x * cellSize + cellSize / 2 - 35) + "px";
  robot.style.top = (y * cellSize + cellSize / 2 - 35) + "px";
  robot.style.transform = `rotate(${dir * 90}deg)`;
}

// === XABAR CHIQARISH ===
function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

// === KOMANDALARNI ISHGA TUSHURISH ===
function run() {
  if (isRunning || commands.length === 0) return;

  isRunning = true;
  showMessage("🤖 Dastur bajarilmoqda...", "");

  let i = 0;
  function next() {
    if (i < commands.length) {
      const cmd = commands[i];

      updateCodeView();
      codeView.innerHTML = commands.map((c, index) => {
        const color = index === i ? '#ffff00' : '#00ff9d';
        const weight = index === i ? 'bold' : 'normal';
        return `<span style="color: ${color}; font-weight: ${weight};">${index + 1}. ${c}();</span>`;
      }).join('<br>');

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

// === KLAVIATURA BILAN BOSHQARISH ===
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "arrowup": addCommand("move_forward"); break;
    case "arrowleft": addCommand("turn_left"); break;
    case "arrowright": addCommand("turn_right"); break;
    case "p": addCommand("pick_up"); break;
    case "i": addCommand("insert"); break;
    case "r": reset(); break;
    case "enter": run(); break;
    case "backspace":
      e.preventDefault();
      if (commands.length > 0) {
        commands.pop();
        updateCodeView();
      }
      break;
  }
});

// === NEXT LEVEL ===
function nextLevel() {
  level++;
  levelNumber.textContent = level;
  showMessage("🆙 Level " + level + " boshlandi!", "success");
  nextLevelBtn.style.display = "none";

  x = 1;
  y = 5;
  dir = 1;
  hasDisk = false;
  commands = [];

  diskPos = {
    x: Math.floor(Math.random() * 5) + 1,
    y: Math.floor(Math.random() * 5) + 1
  };
  serverPos = {
    x: Math.floor(Math.random() * 5) + 1,
    y: Math.floor(Math.random() * 5) + 1
  };

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

// === INIT ===
createStars();
updateRobot();
placeObjects();
updateCodeView();
