import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {compose} from '~/utils';
import {Query} from 'react-apollo';
import {PredefinedFragments} from '@jahia/data-helper';
import gql from 'graphql-tag';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {withNotifications} from '@jahia/react-material';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, cmGoto} from '~/JContent/JContent.redux';
import {Dropdown} from '@jahia/moonstone';
import {cmSetPreviewMode, cmSetPreviewSelection, cmSetPreviewState} from '~/JContent/preview.redux';
import styles from './SiteSwitcher.scss';
import {createStructuredSelector} from 'reselect';
import {batchActions} from 'redux-batched-actions';

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
    let siteNodes = [];
    if (data && data.jcr.result !== null) {
        for (let i in data.jcr.result.siteNodes) {
            if (data.jcr.result.siteNodes[i].hasPermission) {
                siteNodes.push(data.jcr.result.siteNodes[i]);
            }
        }
    }

    return _.sortBy(siteNodes, ['displayName']);
};

const getTargetSiteLanguageForSwitch = (siteNode, currentLang) => {
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

    return newLang ? newLang : siteNode.site.defaultLanguage;
};

const SiteSwitcher = ({selectorObject, onSelectAction, notificationContext}) => {
    const {t} = useTranslation();
    const selector = useMemo(() => createStructuredSelector(selectorObject), [selectorObject]);
    const dispatch = useDispatch();
    const {siteKey, currentLang} = useSelector(state => selector(state));

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
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
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

                    // Lookup current site, get First site in case not found. Avoid the component to break if not site found at all.
                    let currentSite = sites.find(site => site.name === siteKey);
                    if (!currentSite) {
                        currentSite = sites.length > 0 ? sites[0] : {};
                    }

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
    selectorObject: PropTypes.shape({
        siteKey: PropTypes.string.isRequired,
        currentLang: PropTypes.string.isRequired
    }),
    notificationContext: PropTypes.object.isRequired
};

SiteSwitcher.defaultProps = {
    onSelectAction: (siteNode, language) => (batchActions([
        cmGoto({site: siteNode.name, language}),
        cmSetPreviewMode(CM_PREVIEW_MODES.EDIT),
        cmSetPreviewState(CM_DRAWER_STATES.HIDE),
        cmSetPreviewSelection(null)
    ])),
    selectorObject: {
        siteKey: state => state.site,
        currentLang: state => state.language
    }
};

export default compose(withNotifications())(SiteSwitcher);
