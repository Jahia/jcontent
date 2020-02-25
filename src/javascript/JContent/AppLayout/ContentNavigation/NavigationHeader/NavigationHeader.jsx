import JContentLogo from './JContentLogo';
import SiteSwitcher from './SiteSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import React from 'react';
import {withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = () => ({
    logoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    switchersContainer: {
        display: 'flex'
    }
});

const NavigationHeader = ({classes}) => {
    return (
        <div className={classes.logoContainer}>
            <JContentLogo/>
            <div className={classes.switchersContainer}>
                <SiteSwitcher/>
                <LanguageSwitcher/>
            </div>
        </div>
    );
};

NavigationHeader.propTypes = {
    classes: PropTypes.object
};

export default withStyles(styles)(NavigationHeader);
