const SHAPES = {
    I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 36 },
    O: { shape: [[1,1],[1,1]], color: 33 },
    S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: 32 },
    Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: 31 },
    J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: 34 },
    L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: 35 },
    T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: 37 }
};
const TYPES = Object.keys(SHAPES);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Piece {
    constructor(type) {
        this.type = type;
        this.shape = SHAPES[type].shape.map(row => [...row]);
        this.color = SHAPES[type].color;
        this.x = 3;
        this.y = 0;
        this.rotation = 0;
        this.lastRotate = false;
    }

    static generateBag() {
        return shuffle(TYPES.slice()).map(type => new Piece(type));
    }

    spawn(board) {
        // 盤面中央に配置
        if (this.shape[0].length === 4) {
            this.x = 3; // Iピース
        } else if (this.type === 'O') {
            this.x = 4;
        } else {
            this.x = 3;
        }
        this.y = 0;
        this.rotation = 0;
        this.lastRotate = false;
    }

    clone() {
        const p = new Piece(this.type);
        p.shape = this.shape.map(row => [...row]);
        p.color = this.color;
        p.x = this.x;
        p.y = this.y;
        p.rotation = this.rotation;
        p.lastRotate = this.lastRotate;
        return p;
    }

    canMove(dx, dy, board) {
        return board.canPlace(this, this.x + dx, this.y + dy, this.shape);
    }

    move(dx, dy, board) {
        if (this.canMove(dx, dy, board)) {
            this.x += dx;
            this.y += dy;
            return true;
        }
        return false;
    }

    tryRotate(dir, board) {
        // SRS簡易実装
        const rotated = this.rotateShape(dir);
        const kicks = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
        for (const [kx,ky] of kicks) {
            if (board.canPlace(this, this.x + kx, this.y + ky, rotated)) {
                this.shape = rotated;
                this.x += kx;
                this.y += ky;
                this.rotation = (this.rotation + dir + 4) % 4;
                this.lastRotate = true;
                return true;
            }
        }
        this.lastRotate = false;
        return false;
    }

    rotateShape(dir) {
        const N = this.shape.length;
        let rotated = Array.from({length: N}, () => Array(N).fill(0));
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                rotated[x][N - y - 1] = dir === 1 ? this.shape[y][x] : this.shape[N - x - 1][y];
        return rotated;
    }
}

module.exports = Piece;