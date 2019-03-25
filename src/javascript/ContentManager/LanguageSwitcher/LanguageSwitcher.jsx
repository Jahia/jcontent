import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {SiteInfo} from '@jahia/react-apollo';
import {cmSetAvailableLanguages, cmSetLanguage, cmSetSiteDisplayableName} from '../ContentManager.redux-actions';
import LanguageSwitcherDisplay from './LanguageSwitcherDisplay';

export class LanguageSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.onSelectLanguage = this.onSelectLanguage.bind(this);
    }

    onSelectLanguage(lang) {
        console.log('Switching language to: ' + lang);
        this.props.onSelectLanguage(lang);
        // Switch edit mode linker language
        window.parent.authoringApi.switchLanguage(lang);
    }

    render() {
        const {t, notificationContext, siteKey, lang, setAvailableLanguages, setSiteDisplayableName} = this.props;

        return (
            <SiteInfo siteKey={siteKey} displayLanguage={lang}>
                {({siteInfo, error, loading}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    // update redux
                    setAvailableLanguages(siteInfo.languages);
                    if (siteInfo.displayName) {
                        setSiteDisplayableName(siteInfo.displayName);
                    }

                    return (
                        <LanguageSwitcherDisplay
                            lang={lang}
                            languages={siteInfo.languages}
                            onSelectLanguage={lang => this.onSelectLanguage(lang)}
                        />
                    );
                }}
            </SiteInfo>
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
    },
    setSiteDisplayableName: siteDisplayableName => {
        dispatch(cmSetSiteDisplayableName(siteDisplayableName));
    }
});

LanguageSwitcher.propTypes = {
    onSelectLanguage: PropTypes.func.isRequired,
    setAvailableLanguages: PropTypes.func.isRequired,
    setSiteDisplayableName: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    notificationContext: PropTypes.object.isRequired,
    siteKey: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired
};

export default compose(
    translate(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(LanguageSwitcher);
