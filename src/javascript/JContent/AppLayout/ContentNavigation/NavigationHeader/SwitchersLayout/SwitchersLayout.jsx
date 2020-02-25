import React from 'react';
import SiteSwitcher from './SiteSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './SwitchersLayout.scss';

const SwitchersLayout = () => {
    return (
        <div className={styles.root}>
            <SiteSwitcher/>
            <LanguageSwitcher/>
        </div>
    );
};

export default SwitchersLayout;
