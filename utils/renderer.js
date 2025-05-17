//描画ユーティリティ
const { renderBoard } = require('../game/board');

class Renderer {
    constructor(game) {
        this.game = game;
    }

    render(isGameOver = false) {
        // 画面全体とスクロールバックバッファもクリア
        process.stdout.write('\x1b[H\x1b[2J\x1b[3J');
        const board = this.game.board;
        const piece = this.game.currentPiece;
        const ghostY = this.game.ghostY;
        const hold = this.game.holdPiece;
        const next = this.game.nextQueue;
        const scoring = this.game.scoring;

        // 枠線上部
        let top = '┌' + '─'.repeat(board.width) + '┐';
        console.log(top);

        // Next/Holdミニチュア用の行列を作成
        const holdMini = [];
        for (let i = 0; i < 4; i++) {
            let row = '';
            if (hold && hold.shape[i]) {
                for (let j = 0; j < hold.shape[i].length; j++) {
                    row += hold.shape[i][j] ? `\x1b[${hold.color}m■\x1b[0m` : ' ';
                }
            } else {
                row = '';
            }
            holdMini.push(row);
        }
        const nextMini = [];
        for (let n = 0; n < 5; n++) {
            let shape = next[n]?.shape || [];
            let color = next[n]?.color || 0;
            for (let i = 0; i < 4; i++) {
                let row = '';
                if (shape[i]) {
                    for (let j = 0; j < shape[i].length; j++) {
                        row += shape[i][j] ? `\x1b[${color}m■\x1b[0m` : ' ';
                    }
                } else {
                    row = '    ';
                }
                if (!nextMini[n]) nextMini[n] = [];
                nextMini[n][i] = row;
            }
        }

        // 盤面描画
        for (let y = 0; y < board.height; y++) {
            let line = '│';
            for (let x = 0; x < board.width; x++) {
                let cell = board.grid[y][x];
                // ゴーストピース
                let isGhost = false;
                if (piece) {
                    for (let py = 0; py < piece.shape.length; py++) {
                        for (let px = 0; px < piece.shape[py].length; px++) {
                            if (
                                piece.shape[py][px] &&
                                x === piece.x + px &&
                                y === this.game.ghostY + py
                            ) {
                                // ゴーストは床に重ならないように
                                if (!board.grid[y][x]) isGhost = true;
                            }
                        }
                    }
                }
                // 現在ピース
                let isPiece = false;
                if (piece && y >= piece.y && y < piece.y + piece.shape.length) {
                    let py = y - piece.y;
                    for (let px = 0; px < piece.shape[py]?.length; px++) {
                        if (piece.shape[py][px] && x === piece.x + px && y === piece.y + py) isPiece = true;
                    }
                }
                if (isPiece) line += `\x1b[${piece.color}m■\x1b[0m`;
                else if (isGhost) line += `\x1b[90m·\x1b[0m`;
                else if (cell) line += `\x1b[${cell}m■\x1b[0m`;
                else line += ' ';
            }
            line += '│';

            // Hold/Next/スコア表示
            // Hold
            if (y === 1) line += '  Hold:';
            if (y >= 2 && y < 6) line += '   ' + holdMini[y - 2];

            // Next
            if (y === 1) line += '  Next:';
            if (y >= 2 && y < 22) {
                let idx = Math.floor((y - 2) / 4);
                let subIdx = (y - 2) % 4;
                if (nextMini[idx] && nextMini[idx][subIdx]) {
                    line += '   ' + nextMini[idx][subIdx];
                }
            }

            // スコア
            if (y === 15) line += `  Score:${scoring.score}`;
            if (y === 16) line += `  REN:${this.game.ren} B2B:${this.game.b2b ? 'Yes' : 'No'}`;
            console.log(line);
        }
        // 枠線下部
        let bottom = '└' + '─'.repeat(board.width) + '┘';
        console.log(bottom);

        if (isGameOver) {
            console.log('\nGAME OVER');
        }
        console.log('\n←→:移動 ↓:ソフトドロップ ↑:回転 Z:逆回転 SPACE:ハードドロップ C:ホールド ESC/CTRL+C:終了');
    }
}

module.exports = Renderer;