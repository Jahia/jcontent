import JContentLogo from './JContentLogo';
import React from 'react';
import SwitchersLayout from './SwitchersLayout';
import PropTypes from 'prop-types';
import {SecondaryNavHeader} from '@jahia/moonstone';

export const NavigationHeader = ({isDisplaySwitchers, logo, isDisplaySiteSwitcher, isDisplayLanguageSwitcher, languageSelector, setLanguageAction}) => {
    return (
        <>
            <SecondaryNavHeader>{logo}</SecondaryNavHeader>
            {isDisplaySwitchers && <SwitchersLayout isDisplaySiteSwitcher={isDisplaySiteSwitcher} isDisplayLanguageSwitcher={isDisplayLanguageSwitcher} languageSelector={languageSelector} setLanguageAction={setLanguageAction}/>}
        </>
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
