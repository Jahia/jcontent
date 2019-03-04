import React from 'react';
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem, Typography} from '@material-ui/core';
import {ChevronDown} from 'mdi-material-ui';

export default class LanguageSwitcherDisplay extends React.Component {
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
        let {lang, languages, onSelectLanguage} = this.props;
        let {anchorEl} = this.state;
        return (
            <React.Fragment>
                {languages.length > 1 ? (
                    <React.Fragment>
                        <Button aria-owns={anchorEl ? 'language-switcher' : null}
                                aria-haspopup="true"
                                data-cm-role="language-switcher"
                                color="inherit"
                                onClick={this.handleClick}
                        >
                            <Typography noWrap variant="body1" color="inherit">
                                {this.uppercaseFirst(_.find(languages, language => language.language === lang).displayName)}
                                &nbsp;
                            </Typography>
                            <ChevronDown fontSize="small" color="inherit"/>
                        </Button>
                        <Menu id="language-switcher"
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl)}
                              onClose={this.handleClose}
                        >
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
                ) : (
                    <React.Fragment>
                        <Button aria-owns={anchorEl ? 'language-switcher' : null}
                                aria-haspopup="true"
                                data-cm-role="language-switcher"
                                color="inherit"
                                onClick={this.handleClick}
                        >
                            <Typography noWrap variant="body1" color="inherit">
                                {this.uppercaseFirst(_.find(languages, language => language.language === lang).displayName)}
                                &nbsp;
                            </Typography>
                        </Button>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}
