// 遊戲常數
const COLS = 10; // 遊戲區域寬度
const ROWS = 20; // 遊戲區域高度
const BLOCK_SIZE = 30; // 方塊大小
const COLORS = [
    null,
    '#FF0D72', // I 方塊 - 紅色
    '#0DC2FF', // J 方塊 - 藍色
    '#0DFF72', // L 方塊 - 綠色
    '#F538FF', // O 方塊 - 粉色
    '#FF8E0D', // S 方塊 - 橙色
    '#FFE138', // T 方塊 - 黃色
    '#3877FF'  // Z 方塊 - 藍紫色
];

// 方塊形狀定義 (Tetrominoes)
const SHAPES = [
    null,
    // I 方塊
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J 方塊
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // L 方塊
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // O 方塊
    [
        [4, 4],
        [4, 4]
    ],
    // S 方塊
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    // T 方塊
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // Z 方塊
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// 遊戲狀態
let canvas, ctx; // 主畫布
let nextCanvas, nextCtx; // 下一個方塊預覽畫布
let requestId = null;
let gameOver = false;
let paused = false;
let score = 0;
let lines = 0;
let level = 1;
let dropStart = Date.now();
let gameBoard = createMatrix(COLS, ROWS);
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    next: null,
    score: 0
};

// DOM 元素
let scoreElement, linesElement, levelElement, highScoreElement;
let startBtn, pauseBtn, resetBtn, themeBtn;

// 觸控控制按鈕
let leftBtn, rightBtn, downBtn, rotateBtn, dropBtn;

// 主題
let currentTheme = 'dark';

// 遊戲初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
    // 初始化畫布
    canvas = document.getElementById('tetris');
    ctx = canvas.getContext('2d');
    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

    nextCanvas = document.getElementById('nextPiece');
    nextCtx = nextCanvas.getContext('2d');
    nextCtx.scale(BLOCK_SIZE / 2, BLOCK_SIZE / 2);

    // 獲取 DOM 元素
    scoreElement = document.getElementById('score');
    linesElement = document.getElementById('lines');
    levelElement = document.getElementById('level');
    highScoreElement = document.getElementById('highScore');
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    resetBtn = document.getElementById('resetBtn');
    themeBtn = document.getElementById('themeBtn');
    
    // 獲取觸控控制按鈕
    leftBtn = document.getElementById('leftBtn');
    rightBtn = document.getElementById('rightBtn');
    downBtn = document.getElementById('downBtn');
    rotateBtn = document.getElementById('rotateBtn');
    dropBtn = document.getElementById('dropBtn');

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', handleKeyPress);
    
    // 添加按鈕事件監聽器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    themeBtn.addEventListener('click', toggleTheme);
    
    // 添加觸控控制按鈕事件監聽器
    leftBtn.addEventListener('click', () => playerMove(-1));
    rightBtn.addEventListener('click', () => playerMove(1));
    downBtn.addEventListener('click', () => {
        moveDown();
        dropStart = Date.now();
    });
    rotateBtn.addEventListener('click', () => playerRotate(1));
    dropBtn.addEventListener('click', hardDrop);
    
    // 初始化遊戲
    resetGame();
    drawBoard();
    
    // 設置高分存儲
    setupHighScore();
    
    // 初始化主題
    loadTheme();
}

// 切換主題
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('tetrisTheme', currentTheme);
}

// 加載保存的主題
function loadTheme() {
    const savedTheme = localStorage.getItem('tetrisTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
    }
}

// 創建矩陣
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// 遊戲循環
function gameLoop() {
    const now = Date.now();
    const dropInterval = 1000 - (level - 1) * 50; // 隨著等級提高，方塊下落速度增加
    
    if (now - dropStart > dropInterval) {
        moveDown();
        dropStart = now;
    }
    
    draw();
    if (!gameOver && !paused) {
        requestId = requestAnimationFrame(gameLoop);
    }
}

// 繪製遊戲畫面
function draw() {
    // 清空畫布
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製遊戲區域
    drawMatrix(gameBoard, { x: 0, y: 0 });
    // 繪製當前方塊
    drawMatrix(player.matrix, player.pos);
    
    // 繪製下一個方塊預覽
    nextCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim();
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (player.next) {
        // 將下一個方塊置於預覽區域中央
        const offsetX = Math.floor((4 - player.next[0].length) / 2);
        const offsetY = Math.floor((4 - player.next.length) / 2);
        drawMatrix(player.next, { x: offsetX, y: offsetY }, nextCtx);
    }
}

// 繪製矩陣
function drawMatrix(matrix, offset, context = ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                
                // 繪製方塊邊框
                context.strokeStyle = '#222';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// 繪製遊戲板
function drawBoard() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMatrix(gameBoard, { x: 0, y: 0 });
}

// 生成隨機方塊
function getRandomPiece() {
    const pieceType = Math.floor(Math.random() * 7) + 1;
    return JSON.parse(JSON.stringify(SHAPES[pieceType])); // 深拷貝
}

// 重設方塊
function resetPiece() {
    player.matrix = player.next || getRandomPiece();
    player.next = getRandomPiece();
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    // 檢查遊戲是否結束
    if (checkCollision()) {
        gameOver = true;
        cancelAnimationFrame(requestId);
        requestId = null;
        
        // 保存高分
        saveHighScore();
        
        // 顯示遊戲結束訊息
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, COLS, ROWS);
        
        ctx.font = '1px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('遊戲結束', COLS / 2, ROWS / 2);
        
        // 顯示分數和高分
        ctx.font = '0.6px Arial';
        ctx.fillText(`得分: ${score}`, COLS / 2, ROWS / 2 + 1.5);
        ctx.fillText(`最高分: ${getHighScore()}`, COLS / 2, ROWS / 2 + 2.5);
    }
}

// 旋轉方塊
function rotatePiece(matrix, dir) {
    const n = matrix.length;
    const rotated = createMatrix(n, n);
    
    if (dir > 0) { // 順時針旋轉
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                rotated[x][n - 1 - y] = matrix[y][x];
            }
        }
    } else { // 逆時針旋轉
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                rotated[n - 1 - x][y] = matrix[y][x];
            }
        }
    }
    
    return rotated;
}

// 旋轉方塊並處理牆踢
function playerRotate(dir) {
    if (paused || gameOver) return;
    
    const originalPos = { ...player.pos };
    const originalMatrix = [...player.matrix];
    
    player.matrix = rotatePiece(player.matrix, dir);
    
    // 處理牆踢 (Wall kick)
    let offset = 1;
    while (checkCollision()) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        
        // 如果偏移過大，還原旋轉
        if (offset > player.matrix[0].length) {
            player.matrix = originalMatrix;
            player.pos = originalPos;
            return;
        }
    }
    
    // 播放旋轉音效
    playSound('rotate');
}

// 合併方塊到遊戲區域
function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                gameBoard[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    
    // 播放落地音效
    playSound('land');
}

// 清除已完成的行
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (gameBoard[y][x] === 0) {
                continue outer;
            }
        }
        
        // 該行已滿，清除它
        const row = gameBoard.splice(y, 1)[0].fill(0);
        gameBoard.unshift(row);
        y++; // 再次檢查同一行，因為已經將所有行下移
        
        linesCleared++;
    }
    
    if (linesCleared > 0) {
        // 更新分數
        lines += linesCleared;
        linesElement.textContent = lines;
        
        // 根據清除的行數計算分數
        switch (linesCleared) {
            case 1:
                player.score += 100 * level;
                break;
            case 2:
                player.score += 300 * level;
                break;
            case 3:
                player.score += 500 * level;
                break;
            case 4:
                player.score += 800 * level;
                break;
        }
        
        // 更新顯示的分數
        score = player.score;
        scoreElement.textContent = score;
        
        // 更新等級
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            levelElement.textContent = level;
        }
        
        // 播放消除音效
        playSound('clear');
    }
}

// 檢查碰撞
function checkCollision() {
    const matrix = player.matrix;
    const pos = player.pos;
    
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] !== 0 &&
                (gameBoard[y + pos.y] === undefined ||
                 gameBoard[y + pos.y][x + pos.x] === undefined ||
                 gameBoard[y + pos.y][x + pos.x] !== 0)) {
                return true;
            }
        }
    }
    
    return false;
}

// 移動方塊
function playerMove(dir) {
    if (paused || gameOver) return;
    
    player.pos.x += dir;
    if (checkCollision()) {
        player.pos.x -= dir;
    } else {
        // 播放移動音效
        playSound('move');
    }
}

// 方塊下落
function moveDown() {
    if (paused || gameOver) return;
    
    player.pos.y++;
    
    if (checkCollision()) {
        player.pos.y--;
        merge();
        clearLines();
        resetPiece();
    }
}

// 方塊快速下落
function hardDrop() {
    if (paused || gameOver) return;
    
    while (!checkCollision()) {
        player.pos.y++;
    }
    
    player.pos.y--;
    merge();
    clearLines();
    resetPiece();
    dropStart = Date.now();
    
    // 播放硬降音效
    playSound('harddrop');
}

// 播放音效
function playSound(action) {
    // 創建簡單的音效
    // 注意：這裡是使用Web Audio API的簡單實現，實際項目中可以加載外部音頻文件
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // 設置音效特性
    switch(action) {
        case 'move':
            oscillator.type = 'sine';
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.1;
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'rotate':
            oscillator.type = 'square';
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'clear':
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 500;
            gainNode.gain.value = 0.2;
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'land':
            oscillator.type = 'sine';
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.15;
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
        case 'harddrop':
            oscillator.type = 'triangle';
            oscillator.frequency.value = 250;
            gainNode.gain.value = 0.2;
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.25);
            break;
    }
}

// 處理鍵盤輸入
function handleKeyPress(e) {
    if (gameOver) return;
    
    switch (e.keyCode) {
        case 37: // 左方向鍵
            playerMove(-1);
            break;
        case 39: // 右方向鍵
            playerMove(1);
            break;
        case 40: // 下方向鍵
            moveDown();
            dropStart = Date.now();
            break;
        case 38: // 上方向鍵
            playerRotate(1);
            break;
        case 32: // 空格鍵
            hardDrop();
            break;
        case 80: // P 鍵
            togglePause();
            break;
        case 84: // T 鍵
            toggleTheme();
            break;
    }
}

// 開始遊戲
function startGame() {
    if (!requestId && !gameOver) {
        paused = false;
        dropStart = Date.now();
        gameLoop();
    }
}

// 暫停/繼續遊戲
function togglePause() {
    if (gameOver) return;
    
    paused = !paused;
    pauseBtn.textContent = paused ? '繼續' : '暫停';
    
    if (!paused && !requestId) {
        dropStart = Date.now();
        gameLoop();
    }
}

// 重設遊戲
function resetGame() {
    // 重設遊戲狀態
    cancelAnimationFrame(requestId);
    requestId = null;
    gameOver = false;
    paused = true;
    score = 0;
    lines = 0;
    level = 1;
    
    // 重設顯示
    scoreElement.textContent = '0';
    linesElement.textContent = '0';
    levelElement.textContent = '1';
    pauseBtn.textContent = '暫停';
    highScoreElement.textContent = getHighScore();
    
    // 清空遊戲區域
    gameBoard = createMatrix(COLS, ROWS);
    
    // 生成新方塊
    player.score = 0;
    player.next = getRandomPiece();
    resetPiece();
    
    drawBoard();
}

// 高分功能
function setupHighScore() {
    if (!localStorage.getItem('tetrisHighScore')) {
        localStorage.setItem('tetrisHighScore', '0');
    }
    highScoreElement.textContent = getHighScore();
}

function getHighScore() {
    return parseInt(localStorage.getItem('tetrisHighScore') || '0');
}

function saveHighScore() {
    const highScore = getHighScore();
    if (score > highScore) {
        localStorage.setItem('tetrisHighScore', score.toString());
        highScoreElement.textContent = score;
    }
} 