class Scoring {
    constructor() {
        this.score = 0;
        this.lines = 0;
    }

    update(lines, tspin, tetris, ren, b2b) {
        let add = 0;
        if (tspin && lines === 1) add = 800;
        else if (tspin && lines === 2) add = 1200;
        else if (tspin && lines === 3) add = 1600;
        else if (tspin) add = 400;
        else if (tetris) add = 800;
        else if (lines === 3) add = 500;
        else if (lines === 2) add = 300;
        else if (lines === 1) add = 100;
        if (b2b && (tspin || tetris)) add = Math.floor(add * 1.5);
        if (ren > 0) add += ren * 50;
        this.score += add;
        this.lines += lines;
    }
}

module.exports = Scoring;
