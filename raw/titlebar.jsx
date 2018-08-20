'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    constructor(props) {
        super();

        this.toggleSettings = props.toggleSettings;
        this.toggleHelp = props.toggleHelp;
    }

    render() {
        return (
            <div className="titlebar">
                {title}
                <div className="titlebar-buttons-right">
                    <div className="help-button" onClick={event => this.toggleHelp()}></div>
                    <div className="settings-button" onClick={event => this.toggleSettings()}></div>
                </div>
            </div>
        );
    }
}

module.exports = Titlebar;
