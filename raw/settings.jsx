'use strict';

const React = require('react');
const {Transition} = require('react-transition-group');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);

class Settings extends GlobalEventComponent {
    constructor(props) {
        super(props);

        this.onUpdate = props.onUpdate;
        this.toggleSettings = props.toggleSettings;
        this.state = {
            open: false,
            settings: Object.assign({}, props.settings),
            keyMatch: null,
            inputValue: '',
            showCheat: false
        };
    }

    static getDerivedStateFromProps(props, state) {
        return Object.assign({
            open: props.open,
            settings: props.settings
        }, state.open ? {} : {
            inputValue: '',
            showCheat: false,
            keyMatch: false
        });
    }

    onGlobalKeyDown(event) {
        const {toggleSettings} = this;
        const {open} = this.state;
        const {key} = event;

        if (!open && key === '/') {
            toggleSettings(true);
            event.preventDefault();
        } else if (open && key === 'Escape') {
            toggleSettings(false);
            event.preventDefault();
        }
    }

    matchSettingsKey(value) {
        const {settings} = this.state;
        const valueCompare = value.toLowerCase().split(':')[0].trim();

        if (!valueCompare) {
            return null;
        }

        for (let k in settings) {
            const kCompare = k.toLowerCase().trim();

            if (k === 'cheat' && !settings.cheat) {
                if (kCompare === valueCompare) {
                    return k;
                }
            } else if (kCompare.startsWith(valueCompare)) {
                return k;
            }
        }

        return null;
    }

    matchSettingsValue(string) {
        const {keyMatch, settings} = this.state;
        const valueCompare = (string.toLowerCase().split(':')[1] || '').trim();

        if (!keyMatch) {
            return null;
        }

        let value = null;

        switch (keyMatch) {
            case 'cheat':
            case 'darkmode':
                if (valueCompare.length > 1) {
                    if ('on'.startsWith(valueCompare) || 'true'.startsWith(valueCompare)) {
                        value = true;
                    } else if ('off'.startsWith(valueCompare) || 'false'.startsWith(valueCompare)) {
                        value = false;
                    }
                } else if (!valueCompare.length) {
                    value = !settings[keyMatch];
                }
                break;
            default:
                if (valueCompare.length && /^[1-9][0-9]*$/.test(valueCompare)) {
                    value = parseInt(valueCompare);
                } else if (!valueCompare.length) {
                    value = settings[keyMatch];
                }
        }

        return value;
    }

    valueDisplay(key, value) {
        switch (key) {
            case 'cheat':
            case 'darkmode':
                value = value ? 'on' : 'off';
                break;
            default:
                value = value;
        }

        return value;
    }

    onChange(event) {
        const {settings, showCheat} = this.state;
        const {value} = event.target;
        const key = this.matchSettingsKey(value);

        this.setState({
            inputValue: value,
            keyMatch: key,
            showCheat: key === 'cheat' || showCheat ? true : false
        });
    }

    onKeyDown(event) {
        const {onUpdate} = this;
        const {keyMatch, inputValue, settings, showCheat} = this.state;
        const {target, key, shiftKey, altKey, ctrlKey, metaKey} = event;
        const {value} = target;
        const modifierKey = shiftKey || altKey || ctrlKey || metaKey;
        const expandedValue = `${keyMatch || ''}: `;

        if (key === 'Tab') {
            if (keyMatch && !inputValue.startsWith(expandedValue)) {
                this.setState({
                    inputValue: expandedValue
                });
            }

            event.preventDefault();
        } else if (key === 'Enter') {
            if (keyMatch) {
                const newValue = this.matchSettingsValue(value);

                if (newValue !== null) {
                    onUpdate(keyMatch, newValue);

                    if (shiftKey) {
                        this.setState({
                            keyMatch: null,
                            inputValue: ''
                        });
                    }
                }
            }

            event.preventDefault();
        } else if (key.startsWith('Arrow') && !modifierKey) {
            let settingsKeys = Object.keys(settings);
            let currentValue = (inputValue.split(':')[1] || '').trimLeft();
            let currentKeyIndex = keyMatch ? settingsKeys.indexOf(keyMatch) : null;
            let direction = 0;

            if (key === 'ArrowUp') {
                direction = -1;
            } else if (key === 'ArrowDown') {
                direction = 1;
            } else {
                return;
            }

            event.preventDefault();

            let newKeyMatch = currentKeyIndex !== null
                ? settingsKeys[(settingsKeys.length + currentKeyIndex + direction) % settingsKeys.length]
                : direction > 0 ? settingsKeys[0] : settingsKeys[settingsKeys.length - 1];

            if (newKeyMatch === 'cheat' && !showCheat) {
                newKeyMatch = settingsKeys[(settingsKeys.indexOf('cheat') + direction) % settingsKeys.length];
            }

            this.setState({
                keyMatch: newKeyMatch,
                inputValue: `${newKeyMatch}: ${currentValue}`
            });
        }
    }

    render() {
        const {open, settings, keyMatch, inputValue, showCheat} = this.state;
        const toggleSettings = this.toggleSettings;

        return (<Transition in={open} timeout={{enter: 10, exit: 300}}>
            {state => (<div className={[
                'settings-wrapper',
                state === 'entering' || state === 'exiting' ? 'ready' : '',
                state === 'entered' ? 'ready show' : ''
            ].filter(s => s).join(' ')}
            onClick={() => toggleSettings(false)}>
            	<div className="settings" onClick={e => e.stopPropagation()}>
            		{state !== 'exited'
                        ? <input className="settings-input"
                        type="text"
                        placeholder="option: value"
                        autoFocus={true}
                        value={inputValue}
                        onChange={event => this.onChange(event)}
                        onKeyDown={event => this.onKeyDown(event)}/>
                        : ''}
            		<ul className="settings-list">
                        {Object.entries(settings).map(([key, value], index) => {
                            let displayValue = this.valueDisplay(key, value);
                            return (
                                <li key={key}
                                    className={[
                                        'settings-list-item',
                                        key === 'cheat' && !showCheat ? 'hidden' : '',
                                        key === keyMatch ? 'highlight' : ''
                                    ].filter(s => s).join(' ')}>{
                                        key
                                    }:<input type="text"
                                        className="settings-list-item-value"
                                        value={displayValue}
                                        readOnly
                                        tabIndex="-1"
                                    /></li>
                            );
                        })}
            		</ul>
            	</div>
            </div>)}
        </Transition>);
    }
}

module.exports = Settings;
