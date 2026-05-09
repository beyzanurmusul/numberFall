// ============================================
// NUMBERFALL GAME  
// Canvas ve Context
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// CLASS: FallingNumber
// Düşen sayıları yönetir
// ============================================
class FallingNumber {
  constructor(x, y, number) {
    this.x = x;                    // X pozisyonu (rastgele)
    this.y = y;                    // Y pozisyonu (ekran üstü = -50)
    this.number = number;          // Sayı değeri (1-30)
    this.size = 40;                // Font boyutu
    this.speed = 3;                // Düşme hızı
  }

  // Sayıyı güncelle (aşağı hareket et)
  update() {
    this.y += this.speed;
  }

  // Sayıyı ekrana çiz
  draw() {
    ctx.font = `bold ${this.size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#00FF88';
    ctx.fillText(this.number, this.x, this.y);
  }

  // Sayı ekrandan çıktı mı?
  isOffScreen() {
    return this.y > canvas.height;
  }
}

// ============================================
// OYUNCU
// ============================================
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 60,
  height: 60,
  emoji: '😋',
  mouthOpen: false
};

// ============================================
// GAME STATE
// ============================================
let fallingNumbers = [];           // Düşen sayılar array'i
let score = 0;
let level = 1;
let health = 3;
let gameRunning = false;           // Oyun başladı mı?

// ============================================
// INPUT
// ============================================
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);


// ============================================
// 10 LEVEL RULES ARRAY
// Her level'in kuralı burada tanımlanmıştır
// ============================================
const levelRules = [
  {
    level: 1,
    name: "ODD NUMBERS",
    rule: (num) => num % 2 === 1,
    description: "Catch ODD numbers",
    examples: "1, 3, 5, 7, 9, 11...",
    avoid: "2, 4, 6, 8, 10..."
  },
  {
    level: 2,
    name: "EVEN NUMBERS",
    rule: (num) => num % 2 === 0,
    description: "Catch EVEN numbers",
    examples: "2, 4, 6, 8, 10, 12...",
    avoid: "1, 3, 5, 7, 9..."
  },
  {
    level: 3,
    name: "MULTIPLES OF 3",
    rule: (num) => num % 3 === 0 && num !== 0,
    description: "Catch MULTIPLES OF 3",
    examples: "3, 6, 9, 12, 15, 18...",
    avoid: "1, 2, 4, 5, 7, 8..."
  },
  {
    level: 4,
    name: "MULTIPLES OF 5",
    rule: (num) => num % 5 === 0 && num !== 0,
    description: "Catch MULTIPLES OF 5",
    examples: "5, 10, 15, 20, 25, 30...",
    avoid: "1, 2, 3, 4, 6, 7, 8, 9..."
  },
  {
    level: 5,
    name: "DIVISIBLE BY 7",
    rule: (num) => num % 7 === 0 && num !== 0,
    description: "Catch numbers DIVISIBLE BY 7",
    examples: "7, 14, 21, 28...",
    avoid: "1, 2, 3, 4, 5, 6, 8, 9..."
  },
  {
    level: 6,
    name: "PRIME NUMBERS",
    rule: (num) => {
      if (num < 2) return false;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
      }
      return true;
    },
    description: "Catch PRIME numbers",
    examples: "2, 3, 5, 7, 11, 13, 17, 19, 23...",
    avoid: "1, 4, 6, 8, 9, 10, 12..."
  },
  {
    level: 7,
    name: "PERFECT SQUARES",
    rule: (num) => {
      const sqrt = Math.sqrt(num);
      return Number.isInteger(sqrt) && num > 0;
    },
    description: "Catch PERFECT SQUARES",
    examples: "1, 4, 9, 16, 25...",
    avoid: "2, 3, 5, 6, 7, 8, 10..."
  },
  {
    level: 8,
    name: "SUM OF DIGITS > 10",
    rule: (num) => {
      const sum = String(num).split('').reduce((a, b) => a + parseInt(b), 0);
      return sum > 10;
    },
    description: "Catch numbers with DIGIT SUM > 10",
    examples: "19, 28, 29...",
    avoid: "1-18, 20-27..."
  },
  {
    level: 9,
    name: "ODD DIGIT SUM",
    rule: (num) => {
      const sum = String(num).split('').reduce((a, b) => a + parseInt(b), 0);
      return sum % 2 === 1;
    },
    description: "Catch numbers with ODD DIGIT SUM",
    examples: "1, 3, 5, 10, 12, 14...",
    avoid: "2, 4, 6, 8, 9, 11..."
  },
  {
    level: 10,
    name: "FIBONACCI",
    rule: (num) => [1, 2, 3, 5, 8, 13, 21].includes(num),
    description: "Catch FIBONACCI numbers",
    examples: "1, 2, 3, 5, 8, 13, 21...",
    avoid: "4, 6, 7, 9, 10, 11, 12..."
  }
];

// ============================================
// POPUP MEKANIZMASI
// Seviye başında kuralı göster
// ============================================

function showLevelPopup() {
  const popup = document.getElementById('levelPopup');
  const title = document.getElementById('popupTitle');
  const description = document.getElementById('popupDescription');
  const examples = document.getElementById('popupExamples');
  const avoid = document.getElementById('popupAvoid');
  
  const currentRule = levelRules[level - 1];
  
  title.textContent = `SEVİYE ${level}`;
  description.textContent = currentRule.description;
  examples.textContent = currentRule.examples;
  avoid.textContent = currentRule.avoid;
  
  popup.classList.remove('hidden');
  gameRunning = false;  // Oyunu durdur
}

function hidePopup() {
  const popup = document.getElementById('levelPopup');
  popup.classList.add('hidden');
  gameRunning = true;   // Oyunu başlat
}

// START butonu tıklandığında
document.getElementById('startButton').addEventListener('click', () => {
  hidePopup();
});

// ============================================
// SPAWN FUNCTION
// Yeni sayı oluştur
// ============================================

function spawnNumber() {
  const randomX = Math.random() * (canvas.width - 60);
  const randomNumber = Math.floor(Math.random() * 30) + 1;
  
  fallingNumbers.push(new FallingNumber(randomX, -50, randomNumber));
}

// ============================================
// UPDATE
// Oyun lojiğini güncelle
// ============================================
function update() {
  // Eğer oyun başlamadıysa update yapma
  if (!gameRunning) return;

  // Oyuncu hareketi
  if (keys['ArrowLeft'] || keys['a']) player.x -= 7;
  if (keys['ArrowRight'] || keys['d']) player.x += 7;
  
  // Sınır kontrolleri
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

  // Bazen yeni sayı spawn et (10% şansa)
  if (Math.random() < 0.1) {
    spawnNumber();
  }

  // Tüm sayıları güncelle
  for (let i = fallingNumbers.length - 1; i >= 0; i--) {
    fallingNumbers[i].update();

    // Sayı ekrandan çıktıysa, kaldır
    if (fallingNumbers[i].isOffScreen()) {
      fallingNumbers.splice(i, 1);
    }
  }
}

// ============================================
// DRAW
// Ekrana çiz
// ============================================
function draw() {
  // Ekranı temizle
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Tüm sayıları çiz
  for (let number of fallingNumbers) {
    number.draw();
  }

  // Oyuncu çiz
  ctx.font = `${player.width}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(player.emoji, player.x + player.width/2, player.y + player.height/2);
  
  // UI çiz
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Level: ${level}`, 20, 30);
  ctx.fillText(`Score: ${score}`, 20, 60);
  ctx.fillText(`Health: ${health}`, 20, 90);
  ctx.fillText(`Numbers: ${fallingNumbers.length}`, 20, 120);
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Başlat ve popup göster
gameLoop();
showLevelPopup();
