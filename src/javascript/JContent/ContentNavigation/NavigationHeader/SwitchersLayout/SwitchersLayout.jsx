import React from 'react';
import SiteSwitcher from './SiteSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './SwitchersLayout.scss';
import {Separator} from '@jahia/moonstone';

const SwitchersLayout = () => {
    return (
        <div className={styles.root}>
            <SiteSwitcher/>
            <Separator variant="vertical"/>
            <LanguageSwitcher/>
        </div>
    );
};

export default SwitchersLayout;
