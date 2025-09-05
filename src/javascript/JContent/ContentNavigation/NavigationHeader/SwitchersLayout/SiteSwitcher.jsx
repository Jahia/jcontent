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

const SiteSwitcher = ({selector, onSelectAction, isSiteEnabled}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();
    const {siteKey, currentLang, mode, path} = useSelector(selector, shallowEqual);

    const onSelectSite = (siteNode, currentLang) => {
        let newLang = getTargetSiteLanguageForSwitch(siteNode, currentLang);
        const newPath = localStorage.getItem('jcontent-previous-location-' + siteNode.name + '-' + mode) || path;
        const newTemplate = localStorage.getItem('jcontent-previous-template-' + siteNode.name + '-' + mode) || '';
        dispatch(onSelectAction(siteNode, newLang, mode, newPath, newTemplate));
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
                            <Dropdown isLoading
                                      data={[{label: 'none', value: 'none', name: 'none', site: 'none'}]}
                                      className={styles.siteSwitcher}
                                      onChange={() => {}}
                            />
                        );
                    }

                    const sites = getSites(data).filter(site => !isSiteEnabled || isSiteEnabled(site.name));

                    // Lookup current site, get first site in case not found. Avoid the component to break if not site found at all.
                    let currentSite = sites.find(site => site.name === siteKey) || sites?.[0] || {};

                    return (
                        <Dropdown
                            isDisabled={!sites?.length}
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
    selector: PropTypes.func,
    isSiteEnabled: PropTypes.func
};

SiteSwitcher.defaultProps = {
    // eslint-disable-next-line max-params
    onSelectAction: (siteNode, language, mode, path, template) => (batchActions([
        cmGoto({site: siteNode.name, language, mode, path, template}),
        cmSetPreviewMode(CM_PREVIEW_MODES.EDIT),
        cmSetPreviewState(CM_DRAWER_STATES.HIDE),
        cmSetPreviewSelection(null)
    ])),
    selector: state => ({
        siteKey: state.site,
        currentLang: state.language,
        mode: state.jcontent.mode,
        path: state.jcontent.path
    })
};

export default SiteSwitcher;
