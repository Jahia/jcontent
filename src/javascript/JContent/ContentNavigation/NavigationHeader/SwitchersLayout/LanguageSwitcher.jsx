import React from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {useSiteInfo} from '@jahia/data-helper';
import {Dropdown, Pill} from '@jahia/moonstone';
import styles from './LanguageSwitcher.scss';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import PropTypes from 'prop-types';
import {Tooltip} from '@material-ui/core';
import clsx from 'clsx';

const LanguageSwitcher = ({setLanguageAction, selector, isFullDropdown}) => {
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
                      onChange={() => {}}/>
        );
    }

    const data = siteInfo.languages
        .filter(l => l.activeInEdit)
        .map(l => ({
            label: l.localizedDisplayName,
            value: l.language,
            iconEnd: <Pill label={l.language}/>
        }));

    if (!data) {
        return null;
    }

    const selectedLang = data.find(l => l.value === lang);

    const LabelPill = (
        <Tooltip title={selectedLang.label} placement="bottom-start">
            <Pill isReversed label={selectedLang.value}/>
        </Tooltip>
    );

    return (data.length === 1) ? (
        <div className={styles.label}>
            {LabelPill}
        </div>
    ) : (
        <Dropdown
            className={clsx(styles.languageSwitcher, {[styles.fullWidth]: isFullDropdown})}
            data-cm-role="language-switcher"
            icon={isFullDropdown ? undefined : LabelPill}
            label={isFullDropdown ? undefined : ' '}
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
    selector: PropTypes.func,
    isFullDropdown: PropTypes.bool
};

LanguageSwitcher.defaultProps = {
    setLanguageAction: lang => cmGoto({language: lang}),
    selector: state => ({
        siteKey: state.site,
        lang: state.language
    })
};
export default LanguageSwitcher;
