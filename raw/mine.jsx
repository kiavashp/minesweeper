'use strict';

const React = require('react');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);
const Titlebar = require('./titlebar');
const Game = require('./game');
const Settings = require('./settings');
const Help = require('./help');

class Mine extends GlobalEventComponent {
    constructor(props) {
        super(props);

        let savedSettings = localStorage.getItem('settings') || '{}';
        savedSettings = JSON.parse(savedSettings);

        this.state = {
            settings: this.calcSettings(savedSettings, true),
            settingsOpen: false,
            helpOpen: false,
            blur: false
        };
    }

    calcSettings(override={}, overrideSize=false) {
        const {darkmode=false, cheat=false} = override;
        let columns = Math.floor((window.innerWidth / 20) - 3);
        let rows = Math.floor(((window.innerHeight - 38) / 20) - 3);
        let mines = Math.floor((rows * columns) / 5);

        if (overrideSize) {
            columns = Math.min(columns, override.columns || Infinity);
            rows = Math.min(rows, override.rows || Infinity);
            mines = Math.min(mines, override.mines || Infinity);
        }

        return {
            columns: columns,
            rows: rows,
            mines: mines,
            darkmode: darkmode,
            cheat: cheat
        };
    }

    onGlobalResize(event) {
        const {settings} = this.state;

        this.setState({
            settings: this.calcSettings(settings)
        });
    }

    onSettingsUpdate(key, value) {
        const settings = Object.assign({}, this.state.settings);

        if (key === 'rows' || key === 'columns') {
            value = Math.min(value, 100);
        }

        settings[key] = value;

        settings.mines = Math.min(
            settings.mines,
            (settings.rows * settings.columns) * 0.8
        ) | 0;

        this.setState({
            settings
        });

        localStorage.setItem('settings', JSON.stringify(settings));
    }

    toggleSettings(open=!this.state.settingsOpen) {
        this.setState({
            settingsOpen: open,
            helpOpen: false,
            blur: open
        });
    }

    toggleHelp(open=!this.state.helpOpen) {
        const {settingsOpen} = this;
        this.setState({
            helpOpen: open,
            settingsOpen: false,
            blur: open
        });
    }

    render() {
        const {onSettingsUpdate, toggleSettings, toggleHelp} = this;
        const {settings, blur, settingsOpen, helpOpen} = this.state;

        return (
            <div id="mine-wrapper" className={`${blur ? 'blur' : ''} ${settings.darkmode ? 'darkmode' : ''}`}>
                <Titlebar key="titlebar"
                    toggleSettings={toggleSettings.bind(this)}
                    toggleHelp={toggleHelp.bind(this)}/>
                <Game key="game"
                    settings={settings}
                    blur={blur}/>
                <Settings key="settings"
                    open={settingsOpen}
                    settings={settings}
                    onUpdate={onSettingsUpdate.bind(this)}
                    toggleSettings={toggleSettings.bind(this)}/>
                <Help key="help"
                    open={helpOpen}
                    cheatOn={settings.cheat}
                    toggleHelp={toggleHelp.bind(this)}/>
            </div>
        );
    }
}

module.exports = Mine;
