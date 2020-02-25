import JContentLogo from './JContentLogo';
import React from 'react';
import {withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import SwitchersLayout from './SwitchersLayout';
import styles from './NavigationHeader.scss';

const style = () => ({
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    }
});

const NavigationHeader = ({classes}) => {
    return (
        <div className={classes.header}>
            <div className={styles.logo}>
                <JContentLogo/>
            </div>
            <SwitchersLayout/>
        </div>
    );
};

NavigationHeader.propTypes = {
    classes: PropTypes.object
};

export default withStyles(style)(NavigationHeader);
