import React from "react";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem} from '@material-ui/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {translate} from "react-i18next";
import connect from "react-redux/es/connect/connect";
import {setLanguage} from "../redux/actions";
import {ProgressOverlay, withNotifications} from "@jahia/react-material";

class LanguageSwitcher extends React.Component {

    constructor(props) {
        super(props);

        this.query = gql`query siteLanguages($path: String!) {
            jcr(workspace: LIVE) {
                result:nodeByPath(path: $path) {
                    site {
                        defaultLanguage
                        languages {
                            displayName
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

    validateLanguageExists = (languages, data, lang) => {
        if (!_.isEmpty(languages)) {
            //If we cant find the selected language in the list of available languages,
            // we will implicitly switch to the default language of the site
            let languageExists = _.find(languages, function(language) {
                return language.language === lang;
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
        let parsedSiteLanguages = [];
        if (data && data.jcr != null) {
            let siteLanguages = data.jcr.result.site.languages;
            for (let i in siteLanguages) {
                if (siteLanguages[i].activeInEdit) {
                    parsedSiteLanguages.push(siteLanguages[i]);
                }
            }
        }
        //dxContext.siteLanguages = parsedSiteLanguages;
        return parsedSiteLanguages;
    }

    render() {
        const { t, notificationContext, siteKey, lang, onSelectLanguage } = this.props;
        const variables = {
            path: '/sites/' + siteKey,
        };
        return <Query query={this.query} variables={variables}>
            {
                ({error, loading, data}) => {
                    if (error) {
                        console.log("Error when fetching data: " + error);
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    let displayableLanguages = this.parseSiteLanguages(data);
                    let languageExists = this.validateLanguageExists(displayableLanguages, data, lang);
                    if (languageExists === true) {
                        return <LanguageSwitcherDisplay
                            languages={displayableLanguages}
                        />
                    } else {
                        onSelectLanguage(languageExists);
                        return null;
                    }
                }
            }
        </Query>
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
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    uppercaseFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.substr(1);
    };

    render() {
        let {lang, languages, onSelectLanguage} = this.props;
        let {anchorEl} = this.state;
        return <React.Fragment>
            <Button aria-owns={anchorEl ? 'language-switcher' : null} aria-haspopup="true"
                    onClick={this.handleClick} data-cm-role={'language-switcher'}>
                {_.find(languages, (language) => language.language === lang).displayName}
                &nbsp;
                <FontAwesomeIcon icon="chevron-down"/>
            </Button>
            <Menu id="language-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                {languages.map((lang) => {
                    return <MenuItem key={lang.language} onClick={() => {
                        onSelectLanguage(lang.language);
                        this.handleClose();
                    }}>
                        {this.uppercaseFirst(lang.displayName)}
                    </MenuItem>;
                })}
            </Menu>
        </React.Fragment>
    }
}

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelectLanguage: (lang) => dispatch(setLanguage(lang))
});

LanguageSwitcherDisplay = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcherDisplay);

LanguageSwitcher = _.flowRight(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcher);


export default LanguageSwitcher;