'use strict';

class Cell {
    constructor(value) {
        this.value = value;
        this.state = 'initial';
    }

    expose() {
        this.state = 'expose';
    }

    flag() {
        const {state} = this;
        if (state === 'initial') {
            this.state = 'flag';
        }
    }

    _valueName() {
        const {value} = this;
        let name;

        switch (value) {
            case -1:
                name = 'mine';
                break;
            case 0:
                name = 'empty';
                break;
            default:
                name = `${value}`;
        }

        return name;
    }

    className() {
        const {state, value} = this;
        let className;

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

        return className;
    }
}

module.exports = Cell;
