import React from "react";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class LanguageSwitcher extends React.Component {
    constructor(props) {
        super(props);
    }

    onSelectLanguage = (lang, path) => {
        //Switch language functionality
        console.log('switching language');
    };
    render() {
        let {dxContext} = this.props;
        //*Temp set of languages
        let languages = ["en", "fr"];
        return <CmRouter render={({path, params, goto, switchto}) => {
            return <LanguageSwitcherDisplay dxContext={dxContext} languages={languages} loading={false} onSelectLanguage={(lang) => this.onSelectLanguage(lang, path)}/>;
        }}/>

    }
}

class LanguageSwitcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        let {dxContext, languages, loading, onSelectLanguage} = this.props;
        let {anchorEl} = this.state;
        if (loading) {
            return <span>Loading...</span>
        } else {
            return <div>
                <Button aria-owns={anchorEl ? 'language-switcher' : null}
                        aria-haspopup="true"
                        onClick={this.handleClick}>
                    {dxContext.lang}
                    &nbsp;
                    <FontAwesomeIcon icon="chevron-down"/>
                </Button>
                <Menu id="language-switcher"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={this.handleClose}>
                    {languages.map((lang, i) => {
                        return <MenuItem key={lang} onClick={() => {onSelectLanguage(lang); this.handleClose();}}>{lang}</MenuItem>
                    })}
                </Menu>
            </div>
        }
    }
}

export default LanguageSwitcher;