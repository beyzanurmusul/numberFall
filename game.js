// ============================================
// NUMBERFALL GAME - FINAL VERSION
// WITH PHOTO UPLOAD IN POPUP
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================
// FOTOĞRAF YÜKLEME SİSTEMİ
// ============================================
const imageInput = document.getElementById('playerImage');
let playerImage = null;

// FOTOĞRAF BUTONU
document.getElementById('photoButton').addEventListener('click', () => {
  document.getElementById('playerImage').click();
});

// Fotoğraf seçildiğinde
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      playerImage = img;
      console.log('✅ Fotoğraf yüklendi!');
      document.getElementById('photoStatus').textContent = '✅ Fotoğraf seçildi: ' + file.name;
    };
    img.src = event.target.result;
  };
  
  reader.readAsDataURL(file);
});

class FallingNumber {
  constructor(x, y, number) {
    this.x = x;
    this.y = y;
    this.number = number;
    this.size = 40;
    this.speed = 3;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.font = `bold ${this.size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#00FF88';
    ctx.fillText(this.number, this.x, this.y);
  }

  isOffScreen() {
    return this.y > canvas.height;
  }
}

const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 60,
  height: 60,
  emoji: '😋',
  mouthOpen: false
};

let fallingNumbers = [];
let score = 0;
let level = 1;
let health = 3;
let gameRunning = false;

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

const levelRules = [
  {
    level: 1,
    name: "ODD NUMBERS",
    rule: (num) => num % 2 === 1,
    description: "Catch ODD numbers",
    examples: "1, 3, 5, 7, 9, 11...",
    avoid: "2, 4, 6, 8, 10...",
    emoji: "😋"
  },
  {
    level: 2,
    name: "EVEN NUMBERS",
    rule: (num) => num % 2 === 0,
    description: "Catch EVEN numbers",
    examples: "2, 4, 6, 8, 10, 12...",
    avoid: "1, 3, 5, 7, 9...",
    emoji: "🤓"
  },
  {
    level: 3,
    name: "MULTIPLES OF 3",
    rule: (num) => num % 3 === 0 && num !== 0,
    description: "Catch MULTIPLES OF 3",
    examples: "3, 6, 9, 12, 15, 18...",
    avoid: "1, 2, 4, 5, 7, 8...",
    emoji: "🚀"
  },
  {
    level: 4,
    name: "MULTIPLES OF 5",
    rule: (num) => num % 5 === 0 && num !== 0,
    description: "Catch MULTIPLES OF 5",
    examples: "5, 10, 15, 20, 25, 30...",
    avoid: "1, 2, 3, 4, 6, 7, 8, 9...",
    emoji: "🎯"
  },
  {
    level: 5,
    name: "DIVISIBLE BY 7",
    rule: (num) => num % 7 === 0 && num !== 0,
    description: "Catch numbers DIVISIBLE BY 7",
    examples: "7, 14, 21, 28...",
    avoid: "1, 2, 3, 4, 5, 6, 8, 9...",
    emoji: "⚡"
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
    avoid: "1, 4, 6, 8, 9, 10, 12...",
    emoji: "🧠"
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
    avoid: "2, 3, 5, 6, 7, 8, 10...",
    emoji: "🎪"
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
    avoid: "1-18, 20-27...",
    emoji: "🔥"
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
    avoid: "2, 4, 6, 8, 9, 11...",
    emoji: "💎"
  },
  {
    level: 10,
    name: "FIBONACCI",
    rule: (num) => [1, 2, 3, 5, 8, 13, 21].includes(num),
    description: "Catch FIBONACCI numbers",
    examples: "1, 2, 3, 5, 8, 13, 21...",
    avoid: "4, 6, 7, 9, 10, 11, 12...",
    emoji: "👑"
  }
];

const levelThresholds = [100, 150, 200, 250, 300, 350, 400, 450, 500, 600];

function showLevelPopup() {
  const popup = document.getElementById('levelPopup');
  const title = document.getElementById('popupTitle');
  const description = document.getElementById('popupDescription');
  const examples = document.getElementById('popupExamples');
  const avoid = document.getElementById('popupAvoid');
  const photoStatus = document.getElementById('photoStatus');
  
  const currentRule = levelRules[level - 1];
  
  title.textContent = `SEVİYE ${level}`;
  description.textContent = currentRule.description;
  examples.textContent = currentRule.examples;
  avoid.textContent = currentRule.avoid;
  
  // Fotoğraf statusu sıfırla her level'de
  if (playerImage) {
    photoStatus.textContent = '✅ Fotoğraf seçildi';
  } else {
    photoStatus.textContent = '';
  }
  
  popup.classList.remove('hidden');
  gameRunning = false;
}

function hidePopup() {
  const popup = document.getElementById('levelPopup');
  popup.classList.add('hidden');
  gameRunning = true;
}

document.getElementById('startButton').addEventListener('click', () => {
  hidePopup();
});

function spawnNumber() {
  const randomX = Math.random() * (canvas.width - 60);
  const randomNumber = Math.floor(Math.random() * 30) + 1;
  
  fallingNumbers.push(new FallingNumber(randomX, -50, randomNumber));
}

function checkCollisions() {
  const currentRule = levelRules[level - 1];
  
  for (let i = fallingNumbers.length - 1; i >= 0; i--) {
    const num = fallingNumbers[i];
    
    const dx = (num.x) - (player.x + player.width / 2);
    const dy = (num.y) - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 60) {
      const isCorrect = currentRule.rule(num.number);
      
      if (isCorrect) {
        score += 10;
        console.log(`✅ Doğru! +10 puan. Score: ${score}`);
      } else {
        health -= 1;
        console.log(`❌ Yanlış! -1 can. Health: ${health}`);
      }
      
      fallingNumbers.splice(i, 1);
    }
  }
  
  if (health <= 0) {
    gameRunning = false;
    alert(`OYUN BİTTİ!\nFinal Score: ${score}\nLevel: ${level}`);
    score = 0;
    health = 3;
    fallingNumbers = [];
    showLevelPopup();
    return;
  }

  if (level < 10 && score >= levelThresholds[level - 1]) {
    level++;
    score = 0;
    fallingNumbers = [];
    showLevelPopup();
    console.log(`🎉 LEVEL UP! Seviye: ${level}`);
  }
}

function update() {
  if (!gameRunning) return;

  if (keys['ArrowLeft'] || keys['a']) player.x -= 7;
  if (keys['ArrowRight'] || keys['d']) player.x += 7;
  
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

  if (Math.random() < 0.02) {
    spawnNumber();
  }

  for (let i = fallingNumbers.length - 1; i >= 0; i--) {
    fallingNumbers[i].update();

    if (fallingNumbers[i].isOffScreen()) {
      console.log(`⏬ Miss! Sayı kaçtı.`);
      fallingNumbers.splice(i, 1);
    }
  }

  checkCollisions();
}

function draw() {
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let number of fallingNumbers) {
    number.draw();
  }

  ctx.font = `${player.width}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // FOTOĞRAF VARSA GÖSTER, YOKSA EMOJİ
  if (playerImage) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    const currentRule = levelRules[level - 1];
    ctx.fillText(currentRule.emoji, player.x + player.width/2, player.y + player.height/2);
  }
  
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Level: ${level}`, 20, 30);
  ctx.fillText(`Score: ${score}`, 20, 60);
  
  let healthDisplay = '';
  for (let i = 0; i < health; i++) healthDisplay += '❤️';
  ctx.fillText(healthDisplay, 120, 60);
  
  ctx.fillStyle = '#16c784';
  ctx.font = '18px Arial';
  ctx.fillText(`Next Level: ${levelThresholds[level - 1]} puan`, 20, 90);
  
  ctx.font = '16px Arial';
  ctx.textAlign = 'right';
  const currentRule = levelRules[level - 1];
  ctx.fillText(`🎯 ${currentRule.description}`, canvas.width - 20, 30);
  
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
showLevelPopup();
