'use strict';

const React = require('react');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);
const Titlebar = require('./titlebar');
const Game = require('./game');
const Settings = require('./settings');

class Mine extends GlobalEventComponent {
    constructor(props) {
        super(props);

        let savedSettings = localStorage.getItem('settings');
        savedSettings = JSON.parse(savedSettings);

        this.state = {
            settings: this.calcSettings(savedSettings),
            settingsModified: false,
            settingsOpen: false,
            blur: false
        };
    }

    calcSettings(override={}) {
        const {darkmode=false, cheat=false} = override;
        const columns = Math.min(
            Math.floor((window.innerWidth / 20) - 2),
            override.columns || Infinity
        );
        const rows = Math.min(
            Math.floor(((window.innerHeight - 38) / 20) - 2),
            override.rows || Infinity
        );
        const mines = Math.min(
            Math.floor((rows * columns) / 5),
            override.mines || Infinity
        );

        return {
            columns: columns,
            rows: rows,
            mines: mines,
            darkmode: darkmode,
            cheat: cheat
        };
    }

    onGlobalResize(event) {
        const {settings, settingsModified} = this.state;

        if (!settingsModified) {
            this.setState({
                settings: this.calcSettings(settings)
            });
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

        localStorage.setItem('settings', JSON.stringify(settings));
    }

    toggleSettings(open=false) {
        console.log(`toggleSettings(open=${open})`);
        this.setState({
            settingsOpen: open,
            blur: open
        });
    }

    render() {
        const {onSettingsUpdate, toggleSettings} = this;
        const {settings, blur, settingsOpen} = this.state;

        return (
            <div id="mine-wrapper" className={`${blur ? 'blur' : ''} ${settings.darkmode ? 'darkmode' : ''}`}>
                <Titlebar key="titlebar"
                    openSettings={toggleSettings.bind(this, true)}/>
                <Game key="game"
                    settings={settings}/>
                <Settings key="settings"
                    open={settingsOpen}
                    settings={settings}
                    onUpdate={onSettingsUpdate.bind(this)}
                    toggleSettings={toggleSettings.bind(this)}/>
            </div>
        );
    }
}

module.exports = Mine;
