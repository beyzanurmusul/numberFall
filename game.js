// ============================================
// NUMBERFALL GAME - WEEK 1 DAY 2
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

// ============================================
// INPUT
// ============================================
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

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

// Başlat
gameLoop();
