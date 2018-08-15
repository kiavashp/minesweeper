'use strict';

const React = require('react');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);

class Game extends GlobalEventComponent {
    constructor(props) {
        super(props);

        const {settings} = props;

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
            buildNewGame: false
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

    onGlobalKeyDown(event) {
        const {peek, settings} = this.state;
        const {key, altKey, ctrlKey, shiftKey} = event;
        let newPeek = Object.assign({}, peek);

        if (key === 'Alt' || key === 'Control') {
            newPeek.enabled = settings.cheat && altKey ? true : false;
            newPeek.all = settings.cheat && altKey && ctrlKey ? true : false;
        }

        this.setState({
            flagMode: shiftKey ? true : false,
            peek: newPeek
        });
    }

    onGlobalKeyUp(event) {
        const {peek, settings} = this.state;
        const {key, altKey, ctrlKey, shiftKey} = event;
        let newPeek = Object.assign({}, peek);

        if (key === 'Alt' || key === 'Control') {
            newPeek.enabled = settings.cheat && altKey ? true : false;
            newPeek.all = settings.cheat && altKey && ctrlKey ? true : false;
        }

        this.setState({
            flagMode: shiftKey ? true : false,
            peek: newPeek
        });
    }

    componentDidUpdate() {
        const {buildNewGame} = this.state;

        if (buildNewGame) {
            this.newGame();
        }
    }

    static getDerivedStateFromProps(props, state) {
        let settingsChanged = Game.settingsChanged(props.settings, state.cells.settings);
        let newState = {
            settings: props.settings,
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
            buildNewGame: false
        });
    }

    static cellClassName(cell, peek) {
        let {state, value} = cell;
        let className;

        if (peek) {
            state = 'expose';
        }

        switch (state) {
            case 'expose':
                className = `board-cell expose-${value === -1 ? 'mine' : value}`;
                break;
            case 'flag':
                className = 'board-cell flag';
                break;
            default:
                className = 'board-cell';
        }

        if (peek) {
            className += ' peek';
        }

        return className;
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
        const {flagMode} = state;
        const cells = Game.cloneCells(state.cells);
        const cell = cells[row][column];
        let gameOver = 0;

        if (cell.state === 'expose') {
            return;
        }

        cell.state = flagMode ? 'flag' : 'expose';

        if (!flagMode) {
            if (cell.value === 0) {
                this.exposeEmpty(cells, row, column);
            } else if (cell.value === -1) {
                gameOver = -1;
            }
        }

        this.setState({
            played: true,
            cells,
            gameOver
        });
    }

    peek(row, column, show) {
        const {peek} = this.state;
        const newPeek = Object.assign({}, peek);

        newPeek.which = show ? [row, column] : null;

        this.setState({
            peek: newPeek
        });
    }

    shouldPeek(cell, r, c) {
        const {peek} = this.state;
        const {enabled, which, all} = peek;

        return cell.state !== 'expose' && enabled && (
            all ||
            (which && which[0] === r && which[1] === c)
        );
    }

    render() {
        const {cells, gameOver} = this.state;

        return (<div className="game">
            <div className="board">
                {cells.map((row, r) => {
                    return (<div className="board-row" key={r}>
                        {row.map((cell, c) => {
                            if (gameOver) {
                                cell.state === 'expose';
                            }
                            let peek = this.shouldPeek(cell, r, c);
                            return (<span key={c}
                                className={Game.cellClassName(cell, peek)}
                                onClick={event => this.expose(r, c)}
                                onContextMenu={event => this.expose(r, c)}
                                onMouseEnter={event => this.peek(r, c, true)}
                                onMouseLeave={event => this.peek(r, c, false)}
                                data-value={cell.value}></span>);
                        })}
                    </div>);
                })}
            </div>
            {gameOver ? <div className="gameover">
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
