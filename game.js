// NUMBERFALL GAME
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyuncu altta yiyen emoji
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 60,
  height: 60,
  emoji: '😋',
  mouthOpen: false
};

// falling numbers array 
let fallingNumbers = [];
let score = 0;
let level = 1;
let health = 3;

// Oyun kontrolü
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Update: Oyun lojiği
function update() {
  // Oyuncu hareketi
  if (keys['ArrowLeft'] || keys['a']) player.x -= 7;
  if (keys['ArrowRight'] || keys['d']) player.x += 7;
  
  // sınır koyduk aşmaması için
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

// çiz
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
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
}

// Game Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Başlat
gameLoop();