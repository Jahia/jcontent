import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {SiteInfo} from '@jahia/react-apollo';
import {cmSetAvailableLanguages} from '../JContent.redux';
import {LanguageSwitcher} from '@jahia/design-system-kit';
import {registry} from '@jahia/ui-extender';

export class SiteLanguageSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.onSelectLanguage = this.onSelectLanguage.bind(this);
    }

    onSelectLanguage(lang) {
        console.debug(`%c  Switching language to: ${lang}`, 'color: #6B5CA5');
        this.props.onSelectLanguage(lang);
        // Switch edit mode linker language
        window.authoringApi.switchLanguage(lang);
    }

    render() {
        const {t, notificationContext, siteKey, lang, setAvailableLanguages} = this.props;

        return (
            <SiteInfo siteKey={siteKey} displayLanguage={lang}>
                {({siteInfo, error, loading}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        let message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    // Update redux
                    setAvailableLanguages(siteInfo.languages);

                    return (
                        <LanguageSwitcher
                            lang={lang}
                            languages={siteInfo.languages}
                            color="inverted"
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
        dispatch(registry.get('redux-reducer', 'language').actions.setLanguage(lang));
    },
    setAvailableLanguages: availableLanguages => {
        dispatch(cmSetAvailableLanguages(availableLanguages));
    }
});

SiteLanguageSwitcher.propTypes = {
    onSelectLanguage: PropTypes.func.isRequired,
    setAvailableLanguages: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    notificationContext: PropTypes.object.isRequired,
    siteKey: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired
};

export default compose(
    withTranslation(),
    withNotifications(),
    connect(mapStateToProps, mapDispatchToProps)
)(SiteLanguageSwitcher);
