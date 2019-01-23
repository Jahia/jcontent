import React from 'react';
import {compose, Query} from 'react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import gql from 'graphql-tag';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, cmSetSite} from '../ContentManager.redux-actions';
import SiteSwitcherDisplay from './SiteSwitcherDisplay';
import {batchActions} from 'redux-batched-actions';
import {cmSetPreviewMode, cmSetPreviewSelection, cmSetPreviewState} from '../preview.redux-actions';

class SiteSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.variables = {
            query: 'select * from [jnt:virtualsite] where ischildnode(\'/sites\')'
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

        this.onSelectSite = this.onSelectSite.bind(this);
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
            if (Object.prototype.hasOwnProperty.call(siteLanguages, i)) {
                let lang = siteLanguages[i];
                if (lang.activeInEdit && lang.language === currentLang) {
                    newLang = currentLang;
                    break;
                }
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
        const {siteKey, currentLang, notificationContext, t} = this.props;
        return (
            <Query query={this.query} variables={this.variables}>
                {
                ({error, loading, data}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    let sites = this.getSites(data);
                    return (
                        <SiteSwitcherDisplay
                            siteKey={siteKey}
                            currentLang={currentLang}
                            siteNodes={sites}
                            onSelectSite={(siteNode, currentLang) => {
                                this.onSelectSite(siteNode, currentLang);
                                this.props.dispatchBatch([
                                    cmSetPreviewMode(CM_PREVIEW_MODES.EDIT),
                                    cmSetPreviewState(CM_DRAWER_STATES.HIDE),
                                    cmSetPreviewSelection(null)
                                ]);
                            }}
                    />
);
                }
            }
            </Query>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    currentLang: state.language
});

const mapDispatchToProps = dispatch => ({
    selectSite: (siteNode, language) => {
        dispatch(cmSetSite(siteNode.name, language, siteNode.displayName));
    },
    dispatchBatch: actions => dispatch(batchActions(actions))
});

export default compose(
    translate(),
    connect(mapStateToProps, mapDispatchToProps),
    withNotifications(),
)(SiteSwitcher);
