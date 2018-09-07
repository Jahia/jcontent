import React from "react";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {translate} from "react-i18next";

class LanguageSwitcher extends React.Component {

    constructor(props) {
        super(props);
        let {dxContext} = props;
        this.variables = {
            path: '/sites/' + dxContext.siteKey,
            language: dxContext.uilang
        };
        this.query = gql `query siteLanguages($path: String!, $language: String!) {
          jcr(workspace: LIVE) {
            result:nodeByPath(path: $path) {
              site {
                defaultLanguage
                languages {
                  displayName(language: $language)
                  language
                  activeInEdit
                }
              }
              ...NodeCacheRequiredFields
            }
          }
        }
        ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    }

    onSelectLanguage = (lang, langLabel, path, switchto, params) => {
        //Switch language functionality
        let {dxContext} = this.props;
        //get part of path from /sites/sitekey/...
        let extractedPath = path.substring(path.indexOf('/' + dxContext.siteKey + '/' + dxContext.lang));
        //update the language name in the context
        dxContext.langName = langLabel;
        // switch edit mode linker language
        window.parent.authoringApi.switchLanguage(lang);
        //update language in url and update route.
        switchto(extractedPath.replace(dxContext.siteKey + '/' + dxContext.lang, dxContext.siteKey + '/' + lang), params);
    };

    validateLanguageExists = (languages, data) => {
        let {dxContext} = this.props;
        if (!_.isEmpty(languages)) {
            //If we cant find the selected language in the list of available languages,
            // we will implicitly switch to the default language of the site
            let languageExists = _.find(languages, function(language) {
                return language.language === dxContext.lang;
            });
            if (languageExists === undefined) {
                let language = _.find(languages, function(language) {
                    return language.language === data.jcr.result.site.defaultLanguage;
                });
                return language.language;
            }
            return true;
        }
        return true;
    };

    parseSiteLanguages(data) {
        let {dxContext} = this.props;
        let parsedSiteLanguages = [];
        if (data && data.jcr != null) {
            let siteLanguages = data.jcr.result.site.languages;
            for (let i in siteLanguages) {
                if (siteLanguages[i].activeInEdit) {
                    parsedSiteLanguages.push(siteLanguages[i]);
                }
            }
        }
        dxContext.siteLanguages = parsedSiteLanguages;
        return parsedSiteLanguages;
    }

    render() {
        let {dxContext} = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => {
            return <Query query={this.query} variables={this.variables}>
                    {
                        ({error, loading, data}) => {
                            if (!loading) {
                                let displayableLanguages = this.parseSiteLanguages(data);
                                let languageExists = this.validateLanguageExists(displayableLanguages, data);
                                if (languageExists === true) {
                                    return <LanguageSwitcherDisplay
                                        dxContext={dxContext}
                                        languages={displayableLanguages}
                                        loading={loading}
                                        onSelectLanguage={(lang, langLabel) => this.onSelectLanguage(lang, langLabel, path, switchto, params)}
                                    />;
                                } else {
                                    this.onSelectLanguage(languageExists, path, switchto, params);
                                    return null;
                                }
                            }
                            return <span>Loading...</span>;
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

    uppercaseFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.substr(1);
    };

    render() {
        let {dxContext, languages, loading, onSelectLanguage} = this.props;
        let {anchorEl} = this.state;
        if (loading) {
            return <span>Loading...</span>
        } else {
            return <div>
                <Button aria-owns={anchorEl ? 'language-switcher' : null} aria-haspopup="true" onClick={this.handleClick} data-cm-role={'language-switcher'}>
                    {dxContext.lang}
                    &nbsp;
                    <FontAwesomeIcon icon="chevron-down"/>
                </Button>
                <Menu id="language-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                    {languages.map((lang, i) => {
                        return <MenuItem key={lang.language} onClick={() => {onSelectLanguage(lang.language, lang.displayName); this.handleClose();}}>
                            {this.uppercaseFirst(lang.displayName)}
                        </MenuItem>;
                    })}
                </Menu>
            </div>
        }
    }
}

export default translate()(LanguageSwitcher);