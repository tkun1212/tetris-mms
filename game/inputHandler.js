//キー入力処理
const readline = require('readline');

class Input {
    constructor(game) {
        this.game = game;
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);

        this.onKeypress = (str, key) => {
            if (key.name === 'left') { game.moveLeft(); game.resetLockDelay(); }
            else if (key.name === 'right') { game.moveRight(); game.resetLockDelay(); }
            else if (key.name === 'down') { game.softDrop(); game.resetLockDelay(); }
            else if (key.name === 'up') { game.rotate(1); game.resetLockDelay(); }
            else if (key.name === 'z') { game.rotate(-1); game.resetLockDelay(); }
            else if (key.name === 'space') game.hardDrop();
            else if (key.name === 'c') game.hold();
            else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) game.exit();
        };
        process.stdin.on('keypress', this.onKeypress);

        // 終了時クリーンアップ
        process.on('exit', this.cleanup.bind(this));
    }

    cleanup() {
        process.stdin.removeListener('keypress', this.onKeypress);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
    }
}

module.exports = Input;