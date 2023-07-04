import React from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {useSiteInfo} from '@jahia/data-helper';
import {Dropdown, Typography} from '@jahia/moonstone';
import styles from './LanguageSwitcher.scss';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import PropTypes from 'prop-types';

const LanguageSwitcher = ({setLanguageAction, selector}) => {
    const {siteKey, lang} = useSelector(selector, shallowEqual);
    const {siteInfo, error, loading} = useSiteInfo({siteKey, displayLanguage: lang});
    const {t} = useTranslation('jcontent');

    const dispatch = useDispatch();
    const notificationContext = useNotifications();
    const onSelectLanguageHandler = lang => {
        console.debug(`%c  Switching language to: ${lang}`, 'color: #6B5CA5');
        dispatch(setLanguageAction(lang));
    };

    if (error) {
        console.error('Error when fetching data: ', error);
        const message = t('jcontent:label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
        return null;
    }

    if (loading) {
        return (
            <Dropdown isDisabled
                      data={[{label: 'none', value: 'none'}]}
                      className={styles.languageSwitcher}
                      onChange={() => {
                      }}
            />
        );
    }

    const data = siteInfo.languages.filter(l => l.activeInEdit).map(l => ({label: l.language, value: l.language}));

    if (!data) {
        return null;
    }

    return (data.length === 1) ? (
        <div className={styles.label}>
            <Typography isUpperCase variant="body">{lang}</Typography>
        </div>
    ) : (
        <Dropdown
            data-cm-role="language-switcher"
            className={styles.languageSwitcher}
            label={lang}
            value={lang}
            data={data}
            onChange={(e, item) => {
                onSelectLanguageHandler(item.value);
                return true;
            }}
        />
    );
};

LanguageSwitcher.propTypes = {
    setLanguageAction: PropTypes.func,
    selector: PropTypes.func
};

LanguageSwitcher.defaultProps = {
    setLanguageAction: lang => cmGoto({language: lang}),
    selector: state => ({
        siteKey: state.site,
        lang: state.language
    })
};
export default LanguageSwitcher;
