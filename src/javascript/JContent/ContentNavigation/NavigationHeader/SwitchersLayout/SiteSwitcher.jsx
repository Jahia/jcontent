import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {compose} from '~/utils';
import {Query} from 'react-apollo';
import {PredefinedFragments} from '@jahia/data-helper';
import gql from 'graphql-tag';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {withNotifications} from '@jahia/react-material';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, cmGoto} from '~/JContent/JContent.redux';
import {Dropdown} from '@jahia/moonstone';
import {batchActions} from 'redux-batched-actions';
import {cmSetPreviewMode, cmSetPreviewSelection, cmSetPreviewState} from '~/JContent/preview.redux';
import styles from './SiteSwitcher.scss';

class SiteSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.query = gql`
            query SiteNodes($query: String!, $displayLanguage:String!) {
                jcr {
                    result:nodesByQuery(query: $query) {
                        siteNodes:nodes {
                            name
                            hasPermission(permissionName: "editModeAccess")
                            displayName(language: $displayLanguage)
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
            // eslint-disable-next-line no-unused-vars
            for (let i in data.jcr.result.siteNodes) {
                if (data.jcr.result.siteNodes[i].hasPermission) {
                    siteNodes.push(data.jcr.result.siteNodes[i]);
                }
            }
        }

        return _.sortBy(siteNodes, ['displayName']);
    }

    getTargetSiteLanguageForSwitch(siteNode, currentLang) {
        let newLang = null;
        let siteLanguages = siteNode.site.languages;
        // eslint-disable-next-line no-unused-vars
        for (let i in siteLanguages) {
            if (Object.prototype.hasOwnProperty.call(siteLanguages, i)) {
                let lang = siteLanguages[i];
                if (lang.activeInEdit && lang.language === currentLang) {
                    newLang = currentLang;
                    break;
                }
            }
        }

        return newLang ? newLang : siteNode.site.defaultLanguage;
    }

    onSelectSite(siteNode, currentLang) {
        let newLang = this.getTargetSiteLanguageForSwitch(siteNode, currentLang);
        this.props.selectSite(siteNode, newLang);
        window.authoringApi.switchSite(siteNode.name, newLang);
    }

    render() {
        const {siteKey, currentLang, notificationContext, t} = this.props;
        return (
            <Query query={this.query} variables={{query: 'select * from [jnt:virtualsite] where ischildnode(\'/sites\')', displayLanguage: currentLang}}>
                {
                ({error, loading, data}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        let message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return (
                            <Dropdown isDisabled
                                      data={[{label: 'none', value: 'none', name: 'none', site: 'none'}]}
                                      className={styles.siteSwitcher}
                                />
                    );}

                    let sites = this.getSites(data);
                    return (
                        <Dropdown
                            data-cm-role="site-switcher"
                            label={sites.find(site => site.name === siteKey).displayName}
                            value={siteKey}
                            className={styles.siteSwitcher}
                            data={sites.map(s => ({label: s.displayName, value: s.path, name: s.name, site: s.site}))}
                            onChange={(e, siteNode) => {
                                this.onSelectSite(siteNode, currentLang);
                                this.props.dispatchBatch([
                                    cmSetPreviewMode(CM_PREVIEW_MODES.EDIT),
                                    cmSetPreviewState(CM_DRAWER_STATES.HIDE),
                                    cmSetPreviewSelection(null)
                                ]);
                                return true;
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
        dispatch(cmGoto({site: siteNode.name, language}));
    },
    dispatchBatch: actions => dispatch(batchActions(actions))
});

SiteSwitcher.propTypes = {
    selectSite: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    currentLang: PropTypes.string.isRequired,
    notificationContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    dispatchBatch: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    connect(mapStateToProps, mapDispatchToProps),
    withNotifications()
)(SiteSwitcher);
