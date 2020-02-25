import JContentLogo from './JContentLogo';
import React from 'react';
import SwitchersLayout from './SwitchersLayout';
import styles from './NavigationHeader.scss';

const NavigationHeader = () => {
    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                <JContentLogo/>
            </div>
            <SwitchersLayout/>
        </div>
    );
};

export default NavigationHeader;
