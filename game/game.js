const Board = require('./board');
const Piece = require('./tetromino');
const Input = require('./inputHandler');
const Renderer = require('../utils/renderer');
const Scoring = require('./scoring');

class Game {
    constructor() {
        this.board = new Board();
        this.pieceBag = [];
        this.nextQueue = [];
        this.holdPiece = null;
        this.canHold = true;
        this.currentPiece = null;
        this.ghostY = 0;
        this.scoring = new Scoring();
        this.ren = 0;
        this.b2b = false;
        this.lockDelay = 500;
        this.lockTimer = null;
        this.isGameOver = false;
        this.input = new Input(this);
        this.renderer = new Renderer(this);
        this.interval = null;
    }

    start() {
        this.initBag();
        this.spawnPiece();
        this.renderer.render();
        this.interval = setInterval(() => this.tick(), 50);
    }

    initBag() {
        // 7-Bag生成
        this.pieceBag = Piece.generateBag();
        this.nextQueue = [];
        while (this.nextQueue.length < 5) {
            if (this.pieceBag.length === 0) this.pieceBag = Piece.generateBag();
            this.nextQueue.push(this.pieceBag.shift());
        }
    }

    spawnPiece() {
        if (this.nextQueue.length < 5) {
            if (this.pieceBag.length === 0) this.pieceBag = Piece.generateBag();
            this.nextQueue.push(this.pieceBag.shift());
        }
        this.currentPiece = this.nextQueue.shift();
        this.currentPiece.spawn(this.board);
        this.canHold = true;
        this.updateGhost();
        if (!this.board.canPlace(this.currentPiece)) {
            this.isGameOver = true;
            this.renderer.render(true);
            this.input.cleanup();
            clearInterval(this.interval);
            return;
        }
        this.startLockDelay();
    }

    hold() {
        if (!this.canHold) return;
        this.canHold = false;
        if (this.holdPiece) {
            let tmp = this.holdPiece;
            this.holdPiece = this.currentPiece.clone();
            this.currentPiece = tmp;
            this.currentPiece.spawn(this.board);
        } else {
            this.holdPiece = this.currentPiece.clone();
            this.spawnPiece();
        }
        this.updateGhost();
        this.renderer.render();
    }

    updateGhost() {
        this.ghostY = this.board.getGhostY(this.currentPiece);
    }

    startLockDelay() {
        if (this.lockTimer) clearTimeout(this.lockTimer);
        this.lockTimer = setTimeout(() => this.lockPiece(), this.lockDelay);
    }

    resetLockDelay() {
        this.startLockDelay();
    }

    lockPiece() {
        this.board.merge(this.currentPiece);
        const { lines, tspin, tetris } = this.board.clearLines(this.currentPiece);
        // スコア・REN・B2B計算
        this.scoring.update(lines, tspin, tetris, this.ren, this.b2b);
        if (lines > 0) {
            this.ren++;
            if (tspin || tetris) this.b2b = true;
            else this.b2b = false;
            this.renderer.render();
            setTimeout(() => {
                this.spawnPiece();
                this.renderer.render();
            }, 200); // ヒットストップ
        } else {
            this.ren = 0;
            this.b2b = false;
            this.spawnPiece();
            this.renderer.render();
        }
    }

    tick() {
        if (this.isGameOver) return;
        // ピースが下に動ける場合は落とす
        if (this.currentPiece.canMove(0, 1, this.board)) {
            this.currentPiece.move(0, 1, this.board);
            this.updateGhost();
            this.renderer.render();
            // 床から離れたらロックディレイをリセット
            if (this.lockTimer) {
                clearTimeout(this.lockTimer);
                this.lockTimer = null;
            }
        } else {
            // 床またはブロックに接触したらロックディレイ開始
            if (!this.lockTimer) {
                this.startLockDelay();
            }
        }
    }

    moveLeft() {
        if (this.currentPiece.canMove(-1, 0, this.board)) {
            this.currentPiece.move(-1, 0, this.board);
            this.updateGhost();
            this.renderer.render();
            this.resetLockDelay();
        }
    }

    moveRight() {
        if (this.currentPiece.canMove(1, 0, this.board)) {
            this.currentPiece.move(1, 0, this.board);
            this.updateGhost();
            this.renderer.render();
            this.resetLockDelay();
        }
    }

    softDrop() {
        if (this.currentPiece.canMove(0, 1, this.board)) {
            this.currentPiece.move(0, 1, this.board);
            this.updateGhost();
            this.renderer.render();
            this.resetLockDelay();
        }
    }

    hardDrop() {
        while (this.currentPiece.canMove(0, 1, this.board)) {
            this.currentPiece.move(0, 1, this.board);
        }
        this.updateGhost();
        this.renderer.render();
        this.lockPiece();
    }

    rotate(dir) {
        if (this.currentPiece.tryRotate(dir, this.board)) {
            this.updateGhost();
            this.renderer.render();
            this.resetLockDelay();
        }
    }

    exit() {
        this.input.cleanup();
        clearInterval(this.interval);
        process.exit(0);
    }
}

module.exports = Game;