import React from "react";
import {compose, Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {lodash as _} from 'lodash';
import {Button, Menu, MenuItem, Typography, withStyles} from '@material-ui/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {translate} from "react-i18next";
import {connect} from 'react-redux';
import {ProgressOverlay, withNotifications} from "@jahia/react-material";
import {cmSetLanguage} from "../redux/actions";

const styles = theme => ({
    typography: {
        opacity: '0.9',
        fontFamily: "Nunito sans, sans-serif",
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '7px',
        color: '#504e4d',
        backgroundSize: '18px'
    },
    typographyLight: {
        opacity: '0.9',
        fontFamily: "Nunito sans, sans-serif",
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '7px',
        color: '#f5f5f5',
        backgroundSize: '18px'
    },
    formControl: {
        minWidth: 120,
    },
    iconLight: {
        color: theme.palette.background.paper,
        fontSize: '10px'
    },
    iconDark: {
        color: '#504e4d',
        fontSize: '10px',
    },
    input1: {
        backgroundColor: "transparent",
        color: "#ffffff",
        boxShadow: "none",
        fontSize: "0.875rem",
    }
});

class LanguageSwitcher extends React.Component {

    constructor(props) {
        super(props);
        this.query = gql`
            query siteLanguages($path: String!) {
                jcr(workspace: LIVE) {
                    result:nodeByPath(path: $path) {
                        site {
                            defaultLanguage
                            languages {
                                displayName
                                language
                                activeInEdit
                            }
                            ...NodeCacheRequiredFields
                        }
                        ...NodeCacheRequiredFields
                    }
                }
                wsDefault:jcr {
                    result:nodeByPath(path: $path) {
                        site {
                            defaultLanguage
                            languages {
                                displayName
                                language
                                activeInEdit
                            }
                            ...NodeCacheRequiredFields
                        }
                        ...NodeCacheRequiredFields
                    }
                }
            }
            ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    }

    onSelectLanguage(lang) {
        console.log("Switching language to: " + lang);
        this.props.onSelectLanguage(lang);
        // Switch edit mode linker language
        window.parent.authoringApi.switchLanguage(lang);
    };

    validateLanguageExists(languages, data, lang) {
        if (!_.isEmpty(languages)) {
            // If we can't find the selected language in the list of available languages,
            // we will implicitly switch to the default language of the site.
            let existingLanguage = _.find(languages, function (language) {
                return language.language === lang;
            });
            if (existingLanguage === undefined) {
                let language = _.find(languages, function (language) {
                    const result = data.jcr ? data.jcr.result : data.wsDefault.result;
                    return language.language === result.site.defaultLanguage;
                });
                return language.language;
            }
            return true;
        }
        return true;
    };

    parseSiteLanguages(data) {
        let parsedSiteLanguages = [];
        if (data && (data.jcr || data.wsDefault)) {
            let siteLanguages = data.jcr ? data.jcr.result.site.languages :  data.wsDefault.result.site.languages;
            for (let i in siteLanguages) {
                if (siteLanguages[i].activeInEdit) {
                    parsedSiteLanguages.push(siteLanguages[i]);
                }
            }
        }
        return parsedSiteLanguages;
    }

    render() {

        const {t, notificationContext, siteKey, lang, dark} = this.props;
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
                    let existingLanguage = this.validateLanguageExists(displayableLanguages, data, lang);
                    if (existingLanguage === true) {
                        return <LanguageSwitcherDisplay
                            lang={lang}
                            dark={dark}
                            languages={displayableLanguages}
                            onSelectLanguage={(lang) => this.onSelectLanguage(lang)}
                        />
                    } 
                    this.onSelectLanguage(existingLanguage);
                    return null;
                    
                }
            }
        </Query>;
    }
}

class LanguageSwitcherDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
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

        return <React.Fragment>
            <Button aria-owns={anchorEl ? 'language-switcher' : null} aria-haspopup="true" data-cm-role="language-switcher" onClick={this.handleClick}>
                <Typography className={dark ? classes.typography : classes.typographyLight}>
                    {this.uppercaseFirst(_.find(languages, (language) => language.language === lang).displayName)}
                    &nbsp;
                </Typography>
                <FontAwesomeIcon icon="chevron-down" className={dark ? classes.iconDark : classes.iconLight}/>
            </Button>
            <Menu id="language-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                {languages.map((lang) => {
                    return <MenuItem
                        key={lang.language}
                        onClick={() => {
                            onSelectLanguage(lang.language);
                            this.handleClose();
                        }}
                    >
                        {this.uppercaseFirst(lang.displayName)}
                    </MenuItem>;
                })}
            </Menu>
        </React.Fragment>
    }
}

const mapStateToProps = (state) => ({
    siteKey: state.site,
    lang: state.language
});

const mapDispatchToProps = (dispatch) => ({
    onSelectLanguage: (lang) => {
        dispatch(cmSetLanguage(lang));
    }
});

compose(withStyles(styles, {withTheme: true}))(LanguageSwitcherDisplay);

export default compose(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcher);
