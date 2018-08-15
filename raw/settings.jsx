'use strict';

const React = require('react');
const {Transition} = require('react-transition-group');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);

class Settings extends GlobalEventComponent {
    constructor(props) {
        super(props);

        this.onUpdate = props.onUpdate;
        this.onBlur = props.onBlur;
        this.state = {
            open: false,
            settings: Object.assign({}, props.settings),
            keyMatch: null,
            inputValue: ''
        };
    }

    static getDerivedStateFromProps(props, state) {
        return {
            settings: props.settings
        };
    }

    onGlobalKeyDown(event) {
        const {onBlur} = this;
        const {open} = this.state;
        const {key} = event;

        if (!open && key === '/') {
            this.setState({
                open: true,
                inputValue: ''
            });
            onBlur(true);
            event.preventDefault();
        } else if (open && key === 'Escape') {
            this.setState({
                open: false
            });
            onBlur(false);
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
        const {keyMatch} = this.state;
        const valueCompare = (string.toLowerCase().split(':')[1] || '').trim();

        if (!keyMatch || !valueCompare) {
            return null;
        }

        if (keyMatch !== 'cheat') {
            if (/^[1-9][0-9]*$/.test(valueCompare)) {
                return parseInt(valueCompare);
            }
        } else if ('true'.startsWith(valueCompare)) {
            return true;
        } else if ('false'.startsWith(valueCompare)) {
            return false;
        } else {
            return null;
        }
    }

    onChange(event) {
        const {settings} = this.state;
        const {value} = event.target;
        const key = this.matchSettingsKey(value);

        this.setState({
            inputValue: value,
            keyMatch: key
        });
    }

    onKeyDown(event) {
        const {onUpdate} = this;
        const {keyMatch, inputValue, settings} = this.state;
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
        } else if (key.startsWith('Arrow') && keyMatch && !modifierKey) {
            let settingsKeys = Object.keys(settings);
            let currentValue = (inputValue.split(':')[1] || '').trimLeft();
            let currentKeyIndex = settingsKeys.indexOf(keyMatch);
            let direction = 0;

            if (key === 'ArrowUp') {
                direction = -1;
            } else if (key === 'ArrowDown') {
                direction = 1;
            } else {
                return;
            }

            event.preventDefault();

            let newKeyMatch = settingsKeys[(settingsKeys.length + currentKeyIndex + direction) % settingsKeys.length];

            if (newKeyMatch === 'cheat') {
                newKeyMatch = settingsKeys[settingsKeys.indexOf('cheat') + direction];
            }

            this.setState({
                keyMatch: newKeyMatch,
                inputValue: `${newKeyMatch}: ${currentValue}`
            });
        }
    }

    render() {
        const {open, settings, keyMatch, inputValue} = this.state;

        return (<Transition in={open} timeout={{enter: 10, exit: 300}}>
            {state => (<div className={[
                'settings-wrapper',
                state === 'entering' || state === 'exiting' ? 'ready' : '',
                state === 'entered' ? 'ready show' : ''
            ].filter(s => s).join(' ')}>
            	<div className="settings">
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
                            return (
                                <li key={key}
                                    className={[
                                        'settings-list-item',
                                        key === 'cheat' ? 'hidden' : '',
                                        key === keyMatch ? 'highlight' : ''
                                    ].filter(s => s).join(' ')}>{
                                        key
                                    }:<input type="text"
                                        className="settings-list-item-value"
                                        value={value}
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
