'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    render() {
        return (
            <div className="titlebar">
                {title}
            </div>
        );
    }
}

module.exports = Titlebar;
