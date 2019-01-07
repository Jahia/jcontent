import React from 'react';
import {compose, Query} from 'react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import gql from 'graphql-tag';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {cmSetAvailableLanguages, cmSetLanguage} from '../redux/actions';
import LanguageSwitcherDisplay from './LanguageSwitcherDisplay';

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
        this.onSelectLanguage = this.onSelectLanguage.bind(this);
    }

    onSelectLanguage(lang) {
        console.log('Switching language to: ' + lang);
        this.props.onSelectLanguage(lang);
        // Switch edit mode linker language
        window.parent.authoringApi.switchLanguage(lang);
    }

    parseSiteLanguages(data) {
        let parsedSiteLanguages = [];
        if (data && (data.jcr || data.wsDefault)) {
            let siteLanguages = data.jcr ? data.jcr.result.site.languages : data.wsDefault.result.site.languages;
            for (let i in siteLanguages) {
                if (siteLanguages[i].activeInEdit) {
                    parsedSiteLanguages.push(siteLanguages[i]);
                }
            }
        }
        this.props.setAvailableLanguages(parsedSiteLanguages);
        return parsedSiteLanguages;
    }

    render() {
        const {t, notificationContext, siteKey, lang, dark} = this.props;
        const variables = {
            path: '/sites/' + siteKey
        };

        return (
            <Query query={this.query} variables={variables}>
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

                    let displayableLanguages = this.parseSiteLanguages(data);
                    return (
                        <LanguageSwitcherDisplay
                            lang={lang}
                            dark={dark}
                            languages={displayableLanguages}
                            onSelectLanguage={lang => this.onSelectLanguage(lang)}
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
    lang: state.language
});

const mapDispatchToProps = dispatch => ({
    onSelectLanguage: lang => {
        dispatch(cmSetLanguage(lang));
    },
    setAvailableLanguages: availableLanguages => {
        dispatch(cmSetAvailableLanguages(availableLanguages));
    }
});

export default compose(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcher);
