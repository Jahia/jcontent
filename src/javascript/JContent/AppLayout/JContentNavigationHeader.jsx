import JContentReversedLogo from './JContentLogo';
import SiteSwitcher from '../SiteSwitcher';
import SiteLanguageSwitcher from '../SiteLanguageSwitcher';
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
        display: 'flex',
        margin: '20px'
    }
});

export class JContentNavigationHeader extends React.Component {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.logoContainer}>
                <JContentReversedLogo/>
                <div className={classes.switchersContainer}>
                    <SiteSwitcher/>
                    <SiteLanguageSwitcher/>
                </div>
            </div>
        );
    }
}

JContentNavigationHeader.propTypes = {
    classes: PropTypes.object
};

export default withStyles(styles)(JContentNavigationHeader);
