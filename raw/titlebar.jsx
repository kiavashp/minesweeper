'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    constructor(props) {
        super();

        this.openSettings = props.openSettings;
    }

    render() {
        return (
            <div className="titlebar">
                {title}
                <div className="settings-button"
                    onClick={event => this.openSettings()}></div>
            </div>
        );
    }
}

module.exports = Titlebar;
