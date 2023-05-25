import React from 'react';
import SiteSwitcher from './SiteSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './SwitchersLayout.scss';
import {Separator} from '@jahia/moonstone';
import PropTypes from 'prop-types';

const SwitchersLayout = ({isDisplaySiteSwitcher, isDisplayLanguageSwitcher}) => {
    return (
        <div className={styles.root}>
            {isDisplaySiteSwitcher && <SiteSwitcher/>}
            {isDisplaySiteSwitcher && isDisplayLanguageSwitcher && <Separator variant="vertical"/>}
            {isDisplayLanguageSwitcher && <LanguageSwitcher/>}
        </div>
    );
};

SwitchersLayout.propTypes = {
    isDisplaySiteSwitcher: PropTypes.bool,
    isDisplayLanguageSwitcher: PropTypes.bool
};

SwitchersLayout.defaultProps = {
    isDisplaySiteSwitcher: true,
    isDisplayLanguageSwitcher: true
};
export default SwitchersLayout;
