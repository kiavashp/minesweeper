'use strict';

const React = require('react');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);
const Titlebar = require('./titlebar');
const Game = require('./game');
const Settings = require('./settings');

class Mine extends GlobalEventComponent {
    constructor(props) {
        super(props);

        this.state = {
            settings: this.calcSettings(),
            settingsModified: false,
            blur: false,
            darkmode: false
        };
    }

    calcSettings() {
        const columns = Math.floor((window.innerWidth / 20) - 2);
        const rows = Math.floor(((window.innerHeight - 38) / 20) - 2);
        const mines = Math.floor((rows * columns) / 5);

        return {
            columns: columns,
            rows: rows,
            mines: mines,
            cheat: false
        };
    }

    onGlobalResize(event) {
        const {settingsModified} = this.state;

        if (!settingsModified) {
            this.setState({
                settings: this.calcSettings()
            });
        }
    }

    onGlobalKeyDown(event) {
        const {darkmode} = this.state;
        const {key, ctrlKey} = event;

        if (ctrlKey && key === 'd') {
            this.setState({
                darkmode: !darkmode
            });

            event.preventDefault();
        }
    }

    onSettingsUpdate(key, value) {
        const settings = Object.assign({}, this.state.settings);

        settings[key] = value;

        settings.mines = Math.min(
            settings.mines,
            (settings.rows * settings.columns) * 0.8
        ) | 0;

        this.setState({
            settings,
            settingsModified: true
        });
    }

    onBlur(blur) {
        this.setState({
            blur: blur ? true : false
        });
    }

    render() {
        const {onSettingsUpdate, onBlur} = this;
        const {settings, darkmode, blur} = this.state;

        return (
            <div id="mine-wrapper" className={`${blur ? 'blur' : ''} ${darkmode ? 'darkmode' : ''}`}>
                <Titlebar key="titlebar"/>
                <Game key="game"
                    settings={settings}/>
                <Settings key="settings"
                    settings={settings}
                    onUpdate={onSettingsUpdate.bind(this)}
                    onBlur={onBlur.bind(this)}/>
            </div>
        );
    }
}

module.exports = Mine;
