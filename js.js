const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

let tiles = [];
let nTilesX = 10;
let nTilesY = 10;
let nBombs = 10;
let tileSize = 51;

class Tile {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.isBomb = false;
        this.isOpen = false;
        this.bombsAround = 0;
        this.marked = false;
    }
}

function setDifficulty(x, y, bombs) {
    nTilesX = x;
    nTilesY = y;
    nBombs = bombs;
    tileSize = Math.floor(511 / Math.max(x, y));
    canvas.width = x * tileSize + 1;
    canvas.height = y * tileSize + 1;
    restartGame();
}

function modoNerd() {
    let x = parseInt(prompt("Casas na horizontal (mínimo 2):"));
    let y = parseInt(prompt("Casas na vertical (mínimo 2):"));
    let b = parseInt(prompt("Quantidade de bombas (mínimo 1):"));

    if (isNaN(x) || isNaN(y) || isNaN(b) || x < 2 || y < 2 || b < 1 || b >= x * y) {
        alert("Valores inválidos.");
        return;
    }

    setDifficulty(x, y, b);
}

function generateTiles() {
    tiles = [];
    for (let i = 0; i < nTilesX; i++) {
        for (let j = 0; j < nTilesY; j++) {
            tiles.push(new Tile(i, j));
        }
    }
}

function generateBombs() {
    for (let i = 0; i < nBombs; i++) {
        let available = tiles.filter(t => !t.isBomb);
        let random = Math.floor(Math.random() * available.length);
        available[random].isBomb = true;
    }
}

function generateNBombs() {
    tiles.forEach(t => {
        t.bombsAround = calculateNBombsAround(t);
    });
}

function calculateNBombsAround(tile) {
    let count = 0;
    for (let i = tile.i - 1; i <= tile.i + 1; i++) {
        for (let j = tile.j - 1; j <= tile.j + 1; j++) {
            if (i !== tile.i || j !== tile.j) {
                if (getTile(i, j)?.isBomb) count++;
            }
        }
    }
    return count;
}

function getTile(i, j) {
    return tiles.find(t => t.i === i && t.j === j);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tiles.forEach(drawTile);
}

function drawTile(tile) {
    let x = tile.i * tileSize + 1;
    let y = tile.j * tileSize + 1;

    if (tile.isOpen) {
        ctx.fillStyle = tile.isBomb ? "#ff0000" : "#999999";
        ctx.fillRect(x, y, tileSize - 1, tileSize - 1);
        if (!tile.isBomb && tile.bombsAround) {
            ctx.fillStyle = "red";
            ctx.font = `${tileSize * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(tile.bombsAround, x + tileSize / 2, y + tileSize * 0.75);
        }
    } else {
        ctx.fillStyle = tile.marked ? "#3399ff" : "#aaaaaa"; // azul se marcado
        ctx.fillRect(x, y, tileSize - 1, tileSize - 1);
        if (tile.marked) {
            ctx.fillStyle = "white";
            ctx.font = `${tileSize * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText("P", x + tileSize / 2, y + tileSize * 0.75);
        }
    }
}

function openTile(tile) {
    if (!tile || tile.isOpen || tile.marked) return;

    tile.isOpen = true;

    if (tile.isBomb) {
        gameOver();
        return;
    }

    if (tile.bombsAround === 0) {
        for (let i = tile.i - 1; i <= tile.i + 1; i++) {
            for (let j = tile.j - 1; j <= tile.j + 1; j++) {
                if (i !== tile.i || j !== tile.j) {
                    openTile(getTile(i, j));
                }
            }
        }
    }

    checkWin();
}

function checkWin() {
    const safeTiles = tiles.filter(t => !t.isBomb);
    const opened = safeTiles.filter(t => t.isOpen);
    if (safeTiles.length === opened.length) {
        setTimeout(() => {
            alert("Você venceu!");
            restartGame();
        }, 10);
    }
}

function gameOver() {
    tiles.forEach(t => t.isBomb && (t.isOpen = true));
    draw();
    setTimeout(() => {
        alert("Fim de jogo!");
        restartGame();
    }, 10);
}

function restartGame() {
    generateTiles();
    generateBombs();
    generateNBombs();
    draw();
}

// Clique normal: abre a casa
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left) / tileSize);
    const j = Math.floor((e.clientY - rect.top) / tileSize);
    const tile = getTile(i, j);

    if (!tile) return;

    if (e.ctrlKey) {
        // Marcar/desmarcar como bandeira
        if (!tile.isOpen) {
            tile.marked = !tile.marked;
        }
    } else {
        // Abrir normalmente
        openTile(tile);
    }

    draw();
});


setDifficulty(10, 10, 10); // inicia no modo fácil por padrão
