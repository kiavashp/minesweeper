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
            settings: savedSettings,
            settingsModified: false,
            blur: false
        };
    }

    calcSettings(override={}) {
        const columns = Math.floor((window.innerWidth / 20) - 2);
        const rows = Math.floor(((window.innerHeight - 38) / 20) - 2);
        const mines = Math.floor((rows * columns) / 5);
        const {darkmode=false, cheat=false} = override;

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

    onBlur(blur) {
        this.setState({
            blur: blur ? true : false
        });
    }

    render() {
        const {onSettingsUpdate, onBlur} = this;
        const {settings, blur} = this.state;

        return (
            <div id="mine-wrapper" className={`${blur ? 'blur' : ''} ${settings.darkmode ? 'darkmode' : ''}`}>
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
