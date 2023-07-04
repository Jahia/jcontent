import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {Query} from '@apollo/react-components';
import {PredefinedFragments} from '@jahia/data-helper';
import gql from 'graphql-tag';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, cmGoto} from '~/JContent/redux/JContent.redux';
import {Dropdown} from '@jahia/moonstone';
import {cmSetPreviewMode, cmSetPreviewSelection, cmSetPreviewState} from '~/JContent/redux/preview.redux';
import styles from './SiteSwitcher.scss';
import {batchActions} from 'redux-batched-actions';
import {getTargetSiteLanguageForSwitch} from '~/utils/getTargetSiteLanguageForSwitch';

const QUERY = gql`
            query SiteNodes($query: String!, $displayLanguage:String!) {
                jcr {
                    result:nodesByQuery(query: $query) {
                        siteNodes:nodes {
                            name
                            hasPermission(permissionName: "jContentAccess")
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

const getSites = data => {
    let siteNodes = data?.jcr.result?.siteNodes?.filter(s => s.hasPermission) || [];
    // Sort system site to the end of list (by returning null)
    return _.sortBy(siteNodes, s => (s.name === 'systemsite') ? null : s.displayName);
};

const SiteSwitcher = ({selector, onSelectAction}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();
    const {siteKey, currentLang} = useSelector(selector, shallowEqual);

    const onSelectSite = (siteNode, currentLang) => {
        let newLang = getTargetSiteLanguageForSwitch(siteNode, currentLang);
        dispatch(onSelectAction(siteNode, newLang));
    };

    return (
        <Query fetchPolicy="network-only" query={QUERY} variables={{query: 'select * from [jnt:virtualsite] where ischildnode(\'/sites\')', displayLanguage: currentLang}}>
            {
                ({error, loading, data}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        let message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return (
                            <Dropdown isDisabled
                                      data={[{label: 'none', value: 'none', name: 'none', site: 'none'}]}
                                      className={styles.siteSwitcher}
                                      onChange={() => {}}
                            />
                        );
                    }

                    const sites = getSites(data);

                    // Lookup current site, get first site in case not found. Avoid the component to break if not site found at all.
                    let currentSite = sites.find(site => site.name === siteKey) || sites?.[0] || {};

                    return (
                        <Dropdown
                            data-cm-role="site-switcher"
                            label={currentSite.displayName}
                            value={siteKey}
                            className={styles.siteSwitcher}
                            data={sites.map(s => ({label: s.displayName, value: s.path, name: s.name, site: s.site}))}
                            onChange={(e, siteNode) => {
                                onSelectSite(siteNode, currentLang);
                                return true;
                            }}
                        />
                    );
                }
            }
        </Query>
    );
};

SiteSwitcher.propTypes = {
    // This must return redux action object compatible with dispatch fcn
    onSelectAction: PropTypes.func,
    selector: PropTypes.func
};

SiteSwitcher.defaultProps = {
    onSelectAction: (siteNode, language) => (batchActions([
        cmGoto({site: siteNode.name, language}),
        cmSetPreviewMode(CM_PREVIEW_MODES.EDIT),
        cmSetPreviewState(CM_DRAWER_STATES.HIDE),
        cmSetPreviewSelection(null)
    ])),
    selector: state => ({
        siteKey: state.site,
        currentLang: state.language
    })
};

export default SiteSwitcher;
