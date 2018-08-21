'use strict';

const React = require('react');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);

class Game extends GlobalEventComponent {
    constructor(props) {
        super(props);

        const {settings} = props;

        this.showDimensionsTimeout = null;
        this.resizingTimeout = null;
        this.state = {
            settings: settings,
            cells: Game.buildCells(settings),
            played: false,
            gameOver: 0,
            peek: {
                enabled: false,
                which: null,
                all: false
            },
            flagMode: false,
            buildNewGame: false,
            showDimensions: false,
            resizing: false,
            blur: false,
            selectedCell: null
        };
    }

    static settingsChanged(settingsOne, settingsTwo) {
        let changed = false;

        for (let k in settingsOne) {
            if (settingsOne[k] !== settingsTwo[k]) {
                changed = true;
                break;
            }
        }

        return changed;
    }

    onGlobalResize(event) {
        const {showDimensionsTimeout, resizingTimeout} = this;

        clearTimeout(showDimensionsTimeout);
        clearTimeout(resizingTimeout);

        this.showDimensionsTimeout = setTimeout(() => {
            this.setState({
                showDimensions: false
            });
        }, 1e3);

        this.resizingTimeout = setTimeout(() => {
            this.setState({
                resizing: false
            });
        }, 200);

        this.setState({
            showDimensions: true,
            resizing: true
        });
    }

    onGlobalKeyDown(event) {
        const {cells, peek, settings, selectedCell, gameOver, blur} = this.state;
        const {key, altKey, ctrlKey, shiftKey, metaKey} = event;
        const capslock = event.getModifierState('CapsLock');
        const boardFocus = !gameOver && !blur;
        let state = {
            flagMode: shiftKey || capslock ? true : false
        };
        let buildNewGame = false;
        let newSelectedCell = selectedCell;

        if (key === 'Alt' || key === 'Control') {
            let newPeek = Object.assign({}, peek);

            newPeek.enabled = settings.cheat && altKey ? true : false;
            newPeek.all = settings.cheat && ctrlKey ? true : false;
            state.peek = newPeek;
        } else if (boardFocus && key === 'n' && metaKey) {
            state.buildNewGame = true;
        } else if (boardFocus && key === 'Escape') {
            state.selectedCell = null;
        } else if (key === 'Enter' && gameOver) {
            this.newGame();
            return;
        } else if (boardFocus && key === ' ' || key === 'Enter' && selectedCell) {
            this.expose(...selectedCell);
        } else if (boardFocus && key.startsWith('Arrow')) {
            let currentCell = selectedCell;
            let newCell = [];
            let hDir = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
            let vDir = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0;

            if (!currentCell) {
                currentCell = [vDir < 0 ? 0 : -vDir, hDir < 0 ? 0 : -hDir];
            }

            if (metaKey) {
                if (vDir) {
                    newCell[0] = vDir < 0 ? 0 : (cells.length - 1);
                    vDir = -vDir;
                } else {
                    newCell[0] = currentCell[0];
                }

                if (hDir) {
                    newCell[1] = hDir < 0 ? 0 : (cells[0].length - 1);
                    hDir = -hDir;
                } else {
                    newCell[1] = currentCell[1];
                }
            } else {
                newCell[0] = (cells.length + (currentCell[0] + vDir)) % cells.length;
                newCell[1] = (cells[0].length + (currentCell[1] + hDir)) % cells[0].length;
            }

            while (cells[newCell[0]][newCell[1]].state === 'expose' && cells[newCell[0]][newCell[1]].value === 0) {
                newCell[0] += vDir;
                newCell[1] += hDir;
            }

            state.selectedCell = newCell;
        }

        this.setState(state);
    }

    onGlobalBlur(event) {
        this.setState({
            flagMode: false,
            peak: {
                enabled: false,
                all: false
            }
        });
    }

    onGlobalKeyUp(event) {
        const {peek, settings} = this.state;
        const {key, altKey, ctrlKey, shiftKey} = event;
        const capslock = event.getModifierState('CapsLock');
        let newPeek = Object.assign({}, peek);

        if (key === 'Alt' || key === 'Control') {
            newPeek.enabled = settings.cheat && altKey ? true : false;
            newPeek.all = settings.cheat && ctrlKey ? true : false;
        }

        this.setState({
            flagMode: shiftKey || capslock ? true : false,
            peek: newPeek
        });
    }

    componentDidUpdate() {
        const {buildNewGame, resizing} = this.state;

        if (buildNewGame && resizing === false) {
            this.newGame();
        }
    }

    static getDerivedStateFromProps(props, state) {
        let settingsChanged = Game.settingsChanged(props.settings, state.cells.settings);
        let newState = {
            settings: props.settings,
            blur: props.blur
        };

        if (!state.played && settingsChanged) {
            newState.buildNewGame = true;
        }

        return newState;
    }

    static newCell(value) {
        return {
            value,
            state: 'initial'
        };
    }

    static calcCell(cells, row, column) {
        let value = 0;

        this.forSurroundingCells(cells, row, column, (cell, r, c) => {
            if (cell.value === -1) {
                value += 1;
            }
        });

        return {value, state: 'initial'};
    }

    static buildCells(settings) {
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
    			cells[mineR][mineC] = Game.newCell(-1);
                m += 1;
    		}
    	}

        Game.forCells(cells, (cell, r, c) => {
            if (!cell) {
                cells[r][c] = Game.calcCell(cells, r, c);
            }
        });

        return cells;
    }

    newGame() {
        const {settings} = this.state;
        const cells = Game.buildCells(settings);

        this.setState({
            cells,
            played: false,
            gameOver: 0,
            buildNewGame: false,
            selectedCell: null
        });
    }

    static cellClassName(cell, peek, flagMode, selected) {
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

    static cloneCells(cells) {
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

    static forCells(cells, callback) {
        cells.forEach((row, r) => {
            row.forEach((cell, c) => {
                callback(cell, r, c);
            });
        });
    }

    static everyCells(cells, callback) {
        return cells.every((row, r) => {
            return row.every((cell, c) => {
                return callback(cell, r, c);
            });
        });
    }

    static forSurroundingCells(cells, row, column, callback) {
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

    static checkWin(cells) {
        const win = Game.everyCells(cells, (cell, r, c) => {
            return cell.value === -1
                ? cell.state === 'flag'
                : cell.state === 'expose';
        });

        return win;
    }

    exposeEmpty(cells, row, column) {
        cells[row][column].state = 'expose';

        if (cells[row][column].value === 0) {
            Game.forSurroundingCells(cells, row, column, (cell, r, c) => {
                if (cell.state !== 'expose') {
                    this.exposeEmpty(cells, r, c);
                }
            });
        }
    }

    expose(row, column) {
        const {state} = this;
        const {flagMode, selectedCell} = state;
        const cells = Game.cloneCells(state.cells);
        const cell = cells[row][column];
        const newState = {played: true};

        if (selectedCell) {
            newState.selectedCell = [row, column];
        }

        if (cell.state === 'expose') {
            this.setState(newState);
            return;
        }

        cell.state = cell.state === 'flag'
            ? 'initial'
            : flagMode ? 'flag' : 'expose';

        if (!flagMode && cell.state === 'expose') {
            if (cell.value === 0) {
                this.exposeEmpty(cells, row, column);
            } else if (cell.value === -1) {
                newState.gameOver = -1;
            }
        }

        let gameWin = Game.checkWin(cells);

        if (gameWin) {
            newState.gameOver = 1;
        }

        newState.cells = cells;

        this.setState(newState);
    }

    render() {
        const {
            cells, peek, gameOver, flagMode,
            showDimensions, buildNewGame, selectedCell,
            resizing, settings, blur
        } = this.state;

        return (<div className="game">
            {
                resizing && buildNewGame
                ? <div key="board" className="board fakeit" style={{width: settings.columns * 20, height: settings.rows * 20}}></div>
                : <div key="board" className={`board ${gameOver === -1 ? 'gamelost' : ''}`}>
                    {cells.map((row, r) => {
                        return (<div className="board-row" key={r}>
                            {row.map((cell, c) => {
                                let selected = selectedCell && selectedCell.join('.') === `${r}.${c}`;
                                return (<span key={c}
                                    className={Game.cellClassName(cell, peek, flagMode, selected)}
                                    onClick={event => this.expose(r, c)}
                                    onContextMenu={event => this.expose(r, c)}
                                    data-value={cell.value}></span>);
                            })}
                        </div>);
                    })}
                </div>
            }
            {showDimensions && !blur
                ? <div key="dimensions" className="dimensions">{`${settings.columns}x${settings.rows}`}</div>
                : ''}
            {gameOver ? <div key="gameover" className="gameover">
                <div className="gameover-message">{
                    gameOver === -1
                    ? 'You Lose!'
                    : 'You Win!'
                }</div>
                <div className="gameover-playagain"
                    onClick={event => this.newGame()}>Play Again</div>
            </div> : ''}
        </div>);
    }
}

module.exports = Game;
