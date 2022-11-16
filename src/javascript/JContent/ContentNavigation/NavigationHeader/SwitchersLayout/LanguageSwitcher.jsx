import React from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {useSiteInfo} from '@jahia/data-helper';
import {Dropdown} from '@jahia/moonstone';
import styles from './LanguageSwitcher.scss';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {Separator} from '@jahia/moonstone';

const LanguageSwitcher = () => {
    const {siteKey, lang} = useSelector(state => ({
        siteKey: state.site,
        lang: state.language
    }), shallowEqual);
    const {siteInfo, error, loading} = useSiteInfo({siteKey, displayLanguage: lang});
    const {t} = useTranslation('jcontent');

    const dispatch = useDispatch();
    const notificationContext = useNotifications();
    const onSelectLanguageHandler = lang => {
        console.debug(`%c  Switching language to: ${lang}`, 'color: #6B5CA5');
        dispatch(cmGoto({language: lang}));
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
                      onChange={() => {}}
            />
        );
    }

    const data = siteInfo.languages.filter(l => l.activeInEdit).map(l => ({label: l.language, value: l.language}));
    return data && (data.length > 1) && (
        <>
            <Separator variant="vertical"/>
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
        </>

    );
};

export default LanguageSwitcher;
