import React from 'react';
import {translate} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';

const styles = () => ({
    menuButton: {
        background: 'url(' + contextJsParameters.contextPath + '/engines/jahia-anthracite/images/logos/dx_logo_solid-white.png) center center no-repeat',
        marginLeft: -12,
        marginRight: 6,
        width: '3.5em',
        height: '3.5em',
        backgroundSize: '100%'
    },
    menuButtonBlue: {
        background: 'url(' + contextJsParameters.contextPath + '/engines/jahia-anthracite/images/dx_logo_solid.png) center center no-repeat',
        marginLeft: -12,
        marginRight: 6,
        width: '3.5em',
        height: '3.5em',
        backgroundSize: '100%'
    }
});

class BurgerMenuButton extends React.Component {
    openMenu() {
        const clickEvent = window.top.document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        window.top.document.getElementsByClassName('editmode-managers-menu')[0].dispatchEvent(clickEvent);
    }

    render() {
        let {classes, isDrawerOpen} = this.props;
        return (
            <div>
                { isDrawerOpen ?
                    <div className={classes.menuButtonBlue} data-cm-role="cm-burger-menu" onClick={() => this.openMenu()}/> :
                    <div className={classes.menuButton} data-cm-role="cm-burger-menu" onClick={() => this.openMenu()}/>
                }
            </div>
        );
    }
}

export default compose(translate(), withStyles(styles, {name: 'DxBurgerMenuButton'}))(BurgerMenuButton);
