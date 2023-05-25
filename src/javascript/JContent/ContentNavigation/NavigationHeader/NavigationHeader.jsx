import JContentLogo from './JContentLogo';
import React from 'react';
import SwitchersLayout from './SwitchersLayout';
import styles from './NavigationHeader.scss';
import PropTypes from 'prop-types';

const NavigationHeader = ({isDisplaySwitchers, logo, isDisplaySiteSwitcher, isDisplayLanguageSwitcher}) => {
    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                {logo}
            </div>
            {isDisplaySwitchers && <SwitchersLayout displaySiteSwitcher={isDisplaySiteSwitcher} displayLanguageSwitcher={isDisplayLanguageSwitcher}/>}
        </div>
    );
};

NavigationHeader.propTypes = {
    isDisplaySwitchers: PropTypes.bool,
    logo: PropTypes.element,
    isDisplaySiteSwitcher: PropTypes.bool,
    isDisplayLanguageSwitcher: PropTypes.bool
};

NavigationHeader.defaultProps = {
    isDisplaySwitchers: true,
    logo: <JContentLogo/>,
    isDisplaySiteSwitcher: true,
    isDisplayLanguageSwitcher: true
};

export default NavigationHeader;
