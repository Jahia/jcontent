import React from 'react';
import {compose} from 'react-apollo';
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem, Typography, withStyles} from '@material-ui/core';
import {ChevronDown} from 'mdi-material-ui';

const styles = theme => ({
    typography: {
        opacity: '0.9',
        fontFamily: 'Nunito sans, sans-serif',
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '7px',
        color: '#504e4d',
        backgroundSize: '18px'
    },
    typographyLight: {
        opacity: '0.9',
        fontFamily: 'Nunito sans, sans-serif',
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '7px',
        color: '#f5f5f5',
        backgroundSize: '18px'
    },
    formControl: {
        minWidth: 120
    },
    iconLight: {
        color: theme.palette.background.paper,
        fontSize: '18px'
    },
    iconDark: {
        color: '#504e4d',
        fontSize: '18px'
    },
    input1: {
        backgroundColor: 'transparent',
        color: '#ffffff',
        boxShadow: 'none',
        fontSize: '0.875rem'
    }
});

class LanguageSwitcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.uppercaseFirst = this.uppercaseFirst.bind(this);
    }

    handleClick(event) {
        this.setState({anchorEl: event.currentTarget});
    }

    handleClose() {
        this.setState({anchorEl: null});
    }

    uppercaseFirst(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    }

    render() {
        let {lang, languages, onSelectLanguage, classes, dark} = this.props;
        let {anchorEl} = this.state;

        return (
            <React.Fragment>
                <Button aria-owns={anchorEl ? 'language-switcher' : null} aria-haspopup="true" data-cm-role="language-switcher" onClick={this.handleClick}>
                    <Typography className={dark ? classes.typography : classes.typographyLight}>
                        {this.uppercaseFirst(_.find(languages, language => language.language === lang).displayName)}
                    &nbsp;
                    </Typography>
                    <ChevronDown className={dark ? classes.iconDark : classes.iconLight}/>
                </Button>
                <Menu id="language-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                    {languages.map(lang => {
                    return (
                        <MenuItem
                            key={lang.language}
                            onClick={() => {
                            onSelectLanguage(lang.language);
                            this.handleClose();
                        }}
                            >
                            {this.uppercaseFirst(lang.displayName)}
                        </MenuItem>
);
                })}
                </Menu>
            </React.Fragment>
        );
    }
}

export default compose(withStyles(styles, {withTheme: true}))(LanguageSwitcherDisplay);
