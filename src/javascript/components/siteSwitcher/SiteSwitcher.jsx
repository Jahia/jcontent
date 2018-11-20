import React from "react";
import {compose, Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {Button, Menu, MenuItem, Typography, withStyles} from '@material-ui/core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {lodash as _} from "lodash";
import {connect} from 'react-redux';
import {translate} from "react-i18next";
import {ProgressOverlay, withNotifications} from "@jahia/react-material";
import {cmSetSite} from "../redux/actions";

const styles = theme => ({
    typography: {
        opacity: '0.9',
        fontFamily: "Nunito sans, sans-serif",
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '5px',
        color: '#504e4d',
        backgroundSize: '18px'
    },
    typographyLight: {
        opacity: '0.9',
        fontFamily: "Nunito sans, sans-serif",
        fontSize: '1rem',
        fontWeight: 200,
        marginRight: '5px',
        color: theme.palette.background.paper,
        backgroundSize: '18px'
    },
    formControl: {
        minWidth: 120
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
        "color": "#ffffff",
        "boxShadow": "none",
        "fontSize": "0.875rem"
    },
});

class SiteSwitcher extends React.Component {

    constructor(props) {

        super(props);

        this.variables = {
            query: "select * from [jnt:virtualsite] where ischildnode('/sites')"
        };
        this.query = gql`
            query SiteNodes($query: String!) {
                jcr {
                    result:nodesByQuery(query: $query) {
                        siteNodes:nodes {
                            name
                            hasPermission(permissionName: "contentManager")
                            displayName
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
            }
            ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    }

    getSites(data) {
        let siteNodes = [];
        if (data && data.jcr.result !== null) {
            for (let i in data.jcr.result.siteNodes) {
                if (data.jcr.result.siteNodes[i].hasPermission) {
                    siteNodes.push(data.jcr.result.siteNodes[i]);
                }
            }
        }
        return siteNodes;
    }

    getTargetSiteLanguageForSwitch(siteNode, currentLang) {
        let newLang = null;
        let siteLanguages = siteNode.site.languages;
        for (let i in siteLanguages) {
            let lang = siteLanguages[i];
            if (lang.activeInEdit && lang.language === currentLang) {
                newLang = currentLang;
                break;
            }
        }
        return newLang !== null ? newLang : siteNode.site.defaultLanguage;
    }

    onSelectSite(siteNode, currentLang) {
        let newLang = this.getTargetSiteLanguageForSwitch(siteNode, currentLang);
        this.props.selectSite(siteNode, newLang);
        window.parent.authoringApi.switchSite(siteNode.name, newLang);
    }

    render() {
        const {siteKey, currentLang, notificationContext, dark, t} = this.props;
        return <Query query={this.query} variables={this.variables}>
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

                    let sites = this.getSites(data);
                    return <SiteSwitcherDisplay
                        siteKey={siteKey}
                        currentLang={currentLang}
                        dark={dark}
                        siteNodes={sites}
                        onSelectSite={(siteNode, currentLang) => this.onSelectSite(siteNode, currentLang)}
                    />;
                }
            }
        </Query>;
    }
}

class SiteSwitcherDisplay extends React.Component {

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

    render() {

        let {siteKey, siteNodes, loading, onSelectSite, classes, currentLang, dark} = this.props;
        let {anchorEl} = this.state;

        if (loading) {
            return <span>Loading...</span>;
        } 
        const siteNode = _.find(siteNodes, (siteNode) => siteNode.name === siteKey);
        return <React.Fragment>
            <Button aria-owns={anchorEl ? 'site-switcher' : null} aria-haspopup="true" data-cm-role="site-switcher" onClick={this.handleClick}>
                <Typography className={dark ? classes.typography : classes.typographyLight}>
                    {siteNode.displayName}
                </Typography>
                    &nbsp;
                <FontAwesomeIcon icon="chevron-down" className={dark ? classes.iconDark : classes.iconLight}/>
            </Button>
            <Menu id="site-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                {siteNodes.map((siteNode) => {
                    return <MenuItem key={siteNode.uuid} onClick={() => {
                        onSelectSite(siteNode, currentLang);
                        this.handleClose();
                    }}>
                        {siteNode.displayName}
                    </MenuItem>
                })}
            </Menu>
        </React.Fragment>;
        
    }
}

const mapStateToProps = (state) => ({
    siteKey: state.site,
    currentLang: state.language
});

const mapDispatchToProps = (dispatch) => ({
    selectSite: (siteNode, language) => {
        dispatch(cmSetSite(siteNode.name, language, siteNode.displayName));
    }
});

compose(
    translate(),
    withStyles(styles)
)(SiteSwitcherDisplay);

export default compose(
    translate(),
    connect(mapStateToProps, mapDispatchToProps),
    withNotifications(),
)(SiteSwitcher);
