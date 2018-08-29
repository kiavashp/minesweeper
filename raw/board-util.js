'use strict';

class BoardUtil {
    settingsChanged(settingsOne, settingsTwo) {
        let changed = false;

        for (let k in settingsOne) {
            if (settingsOne[k] !== settingsTwo[k]) {
                changed = true;
                break;
            }
        }

        return changed;
    }

    newCell(value) {
        return {
            value,
            state: 'initial'
        };
    }

    calcCell(cells, row, column) {
        let value = 0;

        this.forSurroundingCells(cells, row, column, (cell, r, c) => {
            if (cell.value === -1) {
                value += 1;
            }
        });

        return {value, state: 'initial'};
    }

    buildCells(settings) {
        const {columns, rows, mines} = settings;
        const cells = [];

        cells.settings = Object.assign({}, settings);

        for (let r = 0; r < rows; r += 1) {
            cells[r] = new Array(columns).fill(null);
        }

        for (let m = 0; m < mines;){
    		let mineR = Math.floor(Math.random() * rows);
            let mineC = Math.floor(Math.random() * columns);

            if (!cells[mineR][mineC]) {
    			cells[mineR][mineC] = this.newCell(-1);
                m += 1;
    		}
    	}

        this.forCells(cells, (cell, r, c) => {
            if (!cell) {
                cells[r][c] = this.calcCell(cells, r, c);
            }
        });

        return cells;
    }

    cellClassName(cell, peek, flagMode, selected) {
        let {state, value} = cell;
        let classNames = [
            'board-cell',
            `value-${value === -1 ? 'mine' : value || 'empty'}`
        ];

        if (selected) {
            classNames.push('selected');
        }

        switch (state) {
            case 'expose':
                classNames.push('exposed');
                break;
            case 'flag':
                classNames.push('flag');
                break;
            case 'initial':
            default:
                classNames.push('empty');
        }

        if (flagMode && !(peek.enabled || peek.all) && state === 'initial') {
            classNames.push('flagmode');
        }

        if (state !== 'expose') {
            if (peek.all) {
                classNames.push('peekall');
            } else if (peek.enabled) {
                classNames.push('peek');
            }
        }

        return classNames.join(' ');
    }

    cloneCells(cells) {
        let clone = [];

        clone.settings = Object.assign({}, cells.settings);

        for (let row of cells) {
            let newRow = [];

            for (let cell of row) {
                newRow.push(Object.assign({}, cell));
            }

            clone.push(newRow);
        }

        return clone;
    }

    forCells(cells, callback) {
        cells.forEach((row, r) => {
            row.forEach((cell, c) => {
                callback(cell, r, c);
            });
        });
    }

    everyCells(cells, callback) {
        return cells.every((row, r) => {
            return row.every((cell, c) => {
                return callback(cell, r, c);
            });
        });
    }

    forSurroundingCells(cells, row, column, callback) {
        for (let r = -1; r <= 1; r += 1) {
            for (let c = -1; c <= 1; c += 1) {
                if (r !== 0 || c !== 0) {
                    let checkRow = row + r;
                    let checkColumn = column + c;

                    if (checkRow >= 0 && checkRow < cells.length &&
                        checkColumn >=0 && checkColumn < cells[checkRow].length) {
                        let cell = cells[checkRow][checkColumn];

                        if (cell) {
                            callback(cell, checkRow, checkColumn);
                        }
                    }
                }
            }
        }
    }

    checkWin(cells) {
        const win = this.everyCells(cells, (cell, r, c) => {
            return cell.value === -1
                ? cell.state === 'flag'
                : cell.state === 'expose';
        });

        return win;
    }
}

module.exports = new BoardUtil();
