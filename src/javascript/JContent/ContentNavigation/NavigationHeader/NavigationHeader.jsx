import JContentLogo from './JContentLogo';
import React from 'react';
import SwitchersLayout from './SwitchersLayout';
import styles from './NavigationHeader.scss';
import PropTypes from 'prop-types';

export const NavigationHeader = ({isDisplaySwitchers, logo, isDisplaySiteSwitcher, isDisplayLanguageSwitcher, languageSelector, setLanguageAction}) => {
    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                {logo}
            </div>
            {isDisplaySwitchers && <SwitchersLayout isDisplaySiteSwitcher={isDisplaySiteSwitcher} isDisplayLanguageSwitcher={isDisplayLanguageSwitcher} languageSelector={languageSelector} setLanguageAction={setLanguageAction}/>}
        </div>
    );
};

NavigationHeader.propTypes = {
    isDisplaySwitchers: PropTypes.bool,
    logo: PropTypes.element,
    isDisplaySiteSwitcher: PropTypes.bool,
    isDisplayLanguageSwitcher: PropTypes.bool,
    languageSelector: PropTypes.func,
    setLanguageAction: PropTypes.func
};

NavigationHeader.defaultProps = {
    isDisplaySwitchers: true,
    logo: <JContentLogo/>,
    isDisplaySiteSwitcher: true,
    isDisplayLanguageSwitcher: true
};
