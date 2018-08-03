import React from "react";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class LanguageSwitcher extends React.Component {
    constructor(props) {
        super(props);
        let {dxContext} = props;
        this.variables = {
            path: '/sites/' + dxContext.siteKey,
            languagesProperty: 'j:languages'

        };
        this.query = gql `query siteLanguages($path: String!, $languagesProperty: String!){
            jcr(workspace: LIVE) {
                site:nodeByPath(path: $path) {
                    name
                    languages:property(name: $languagesProperty) {
                        name
                        values
                    }
                }
            }
        }`;
    }

    onSelectLanguage = (lang, path) => {
        //Switch language functionality
        console.log('switching language');
    };

    parseLanguages(data) {
        if (data && data.jcr != null) {
            return data.jcr.site.languages.values;
        }
        return [];
    }

    render() {
        let {dxContext} = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => {
           return <Query query={this.query} variables={this.variables} fetchPolicy={"cache-network-only"} >
                {
                    ({error, loading, data}) => {
                        let languages = this.parseLanguages(data);
                        return <LanguageSwitcherDisplay dxContext={dxContext} languages={languages} loading={loading} onSelectLanguage={(lang) => this.onSelectLanguage(lang, path)}/>;
                    }
                }
            </Query>
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