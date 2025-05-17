//ボード描画とロジック

class Board {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({length: height}, () => Array(width).fill(0));
    }

    canPlace(piece, x = piece.x, y = piece.y, shape = piece.shape) {
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (!shape[py][px]) continue;
                let bx = x + px;
                let by = y + py;
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) return false;
                if (this.grid[by][bx]) return false;
            }
        }
        return true;
    }

    merge(piece) {
        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    let bx = piece.x + px;
                    let by = piece.y + py;
                    if (by >= 0 && by < this.height && bx >= 0 && bx < this.width)
                        this.grid[by][bx] = piece.color;
                }
            }
        }
    }

    clearLines(piece) {
        let lines = 0;
        let tetris = false;
        let tspin = false;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(0));
                lines++;
                y++;
            }
        }
        if (lines === 4) tetris = true;
        // Tスピン判定は簡易的に
        if (piece.type === 'T' && piece.lastRotate && lines > 0) tspin = true;
        return { lines, tspin, tetris };
    }

    getGhostY(piece) {
        let y = piece.y;
        while (this.canPlace(piece, piece.x, y + 1, piece.shape)) {
            y++;
        }
        return y;
    }
}

module.exports = Board;