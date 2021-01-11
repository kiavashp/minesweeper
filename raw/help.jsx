'use strict';

const React = require('react');
const {Transition} = require('react-transition-group');
const GlobalEventComponent = require(`${__dirname}/global-event-component`);

class Shortcut extends React.Component {
    render() {
        const {shortcut} = this.props;

        if (shortcut.type === 'shortcut') {
            const {key, label} = shortcut;
            let keys = key;

            if (!Array.isArray(keys)) {
                keys = [keys];
            }

            return (<div className="help-shortcut">
                {keys.map(key => (<span key={key} className="help-shortcut-keys">{key}</span>))}
                {label}
            </div>);
        } else if (shortcut.type === 'label') {
            const {value} = shortcut;

            return (<div className="help-label">{value}</div>);
        } else {
            throw Error(`help: unrecognized shortcut type: ${JSON.stringify(shortcut.type)}`);
        }
    }
}

class Section extends React.Component {
    render() {
        const {section} = this.props;
        const {label, shortcuts} = section;

        return (<div className="help-section">
            <div className="help-label">{label}</div>
            {shortcuts.map((shortcut, i) => {
                return (<Shortcut key={i} shortcut={shortcut}/>);
            })}
        </div>);
    }
}

class Help extends GlobalEventComponent {
    constructor(props) {
        super(props);

        this.toggleHelp = props.toggleHelp;
        this.state = {
            open: false,
            cheatOn: props.cheatOn,
            sections: [
                {
                    label: 'General',
                    shortcuts: [
                        {type: 'shortcut', key: '⌘N', label: 'new game'},
                        {type: 'shortcut', key: '/', label: 'open settings'},
                        {type: 'shortcut', key: '⇧?', label: 'open help'},
                        {type: 'shortcut', key: '⎋', label: 'close popups'}
                    ]
                },
                {
                    label: 'Settings',
                    shortcuts: [
                        {type: 'shortcut', key: '⇥', label: 'auto complete label'},
                        {type: 'shortcut', key: '↑', label: 'select previous setting'},
                        {type: 'shortcut', key: '↓', label: 'select next setting'},
                        {type: 'shortcut', key: '↩', label: 'set value'}
                    ]
                },
                {
                    label: 'Gameplay',
                    shortcuts: [
                        {type: 'shortcut', key: '⇧', label: 'hold down to flag cell'},
                        {type: 'shortcut', key: '⇪', label: 'toggle flagmode'},
                        {type: 'shortcut', key: ['↑↓←→'], label: 'select cell'},
                        {type: 'shortcut', key: ['⌘ + ↑↓←→'], label: 'jump to edge'},
                        {type: 'shortcut', key: ['↩', '␣'], label: 'expose selected cell'}
                    ]
                },
                {
                    label: 'Cheat',
                    shortcuts: [
                        {type: 'shortcut', key: '⌥', label: 'show cell on hover'},
                        {type: 'shortcut', key: '⌃⌥', label: 'show all cells'}
                    ],
                    cheat: true
                }
            ]
        };
    }

    static getDerivedStateFromProps(props, state) {
        return {
            open: props.open,
            cheatOn: props.cheatOn
        };
    }

    onGlobalKeyDown(event) {
        const {open} = this.state;
        const {toggleHelp} = this.props;
        const {key} = event;

        event.modifierKey = event.metaKey || event.altKey || event.shiftKey || event.ctrlKey;

        if (!open && key === '?' && event.shiftKey) {
            toggleHelp(true);
        } else if (open && key === 'Escape' && !event.modifierKey) {
            toggleHelp(false);
        }
    }

    render() {
        const {sections, open, cheatOn} = this.state;
        const toggleHelp = this.toggleHelp;

        return (<Transition in={open} timeout={{enter: 10, exit: 300}}>
            {state => (<div className={[
                'help',
                state === 'entering' || state === 'exiting' ? 'ready' : '',
                state === 'entered' ? 'ready show' : ''
            ].filter(s => s).join(' ')}
            onClick={() => toggleHelp(false)}>
                <div className="help-body" onClick={e => e.stopPropagation()}>{
                    sections.map((section, i) => {
                        return section.cheat && !cheatOn
                            ? ''
                            : <Section key={i} section={section} cheatOn={cheatOn}/>;
                    })
                }</div>
            </div>)}
        </Transition>);
    }
}

module.exports = Help;
