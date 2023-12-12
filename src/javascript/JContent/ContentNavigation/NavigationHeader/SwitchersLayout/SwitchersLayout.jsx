import React from 'react';
import SiteSwitcher from './SiteSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './SwitchersLayout.scss';
import PropTypes from 'prop-types';

const SwitchersLayout = ({isDisplaySiteSwitcher, isDisplayLanguageSwitcher, languageSelector, setLanguageAction}) => {
    return (
        <div className={styles.root}>
            {isDisplaySiteSwitcher && <SiteSwitcher/>}
            {isDisplayLanguageSwitcher && (
                <LanguageSwitcher
                    setLanguageAction={setLanguageAction}
                    selector={languageSelector}
                    isFullDropdown={!isDisplaySiteSwitcher}
                />)}
        </div>
    );
};

SwitchersLayout.propTypes = {
    isDisplaySiteSwitcher: PropTypes.bool,
    isDisplayLanguageSwitcher: PropTypes.bool,
    languageSelector: PropTypes.func,
    setLanguageAction: PropTypes.func
};

SwitchersLayout.defaultProps = {
    isDisplaySiteSwitcher: true,
    isDisplayLanguageSwitcher: true
};
export default SwitchersLayout;
