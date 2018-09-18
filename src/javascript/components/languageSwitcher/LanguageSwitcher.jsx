import React from "react";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem, Typography, withStyles} from '@material-ui/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {ProgressOverlay, withNotifications} from "@jahia/react-material";
import {cmSetLanguage} from "../redux/actions";

const styles = theme => ({
    typography: {
        opacity: '0.9',
        fontFamily: "Nunito sans, sans-serif",
        fontSize: '1rem',
        fontWeight: 200,
        paddingRight: '20px',
        color: '#504e4d',
        backgroundSize: '18px'
    },
    formControl: {
        minWidth: 120,
    },
    icontest: {
        fontSize: '0.500rem',
    },
    input1: {
        backgroundColor: "transparent",
        color: "#ffffff",
        boxShadow: "none",
        fontSize: "0.875rem",
    },
});

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

    onSelectLanguage = (lang) => {
        console.log("Switching language to: " + lang);
        // switch edit mode linker language
        window.parent.authoringApi.switchLanguage(lang);
    };

    validateLanguageExists = (languages, data, lang) => {
        if (!_.isEmpty(languages)) {
            //If we cant find the selected language in the list of available languages,
            // we will implicitly switch to the default language of the site
            let languageExists = _.find(languages, function (language) {
                return language.language === lang;
            });
            if (languageExists === undefined) {
                let language = _.find(languages, function (language) {
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
        return parsedSiteLanguages;
    }

    render() {
        const {t, notificationContext, siteKey, lang, onSelectLanguage, dxContext} = this.props;
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
                            onSelectLanguage={(lang) => this.onSelectLanguage(lang)}
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
        let {lang, languages, onSelectLanguage, classes} = this.props;
        let {anchorEl} = this.state;
        return <React.Fragment>
            <Button aria-owns={anchorEl ? 'language-switcher' : null} aria-haspopup="true"
                    onClick={this.handleClick} data-cm-role={'language-switcher'}>
                <Typography className={classes.typography}>
                    {_.find(languages, (language) => language.language === lang).displayName}
                    &nbsp;
                    <FontAwesomeIcon icon="chevron-down"/>
                </Typography>

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
    onSelectLanguage: (lang) => {
        if (ownProps.onSelectLanguage) {
            ownProps.onSelectLanguage(lang);
        }
        dispatch(cmSetLanguage(lang));
    }
});

LanguageSwitcherDisplay = _.flowRight(
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcherDisplay);

LanguageSwitcher = _.flowRight(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcher);


export default LanguageSwitcher;