import React from 'react';
import {translate} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import classNames from 'classnames';

const styles = () => ({
    menuButton: {
        background: 'url(' + contextJsParameters.contextPath + '/engines/jahia-anthracite/images/logos/dx_logo_solid-white.png) center/100% no-repeat',
        width: '60px',
        height: '60px',
        backgroundSize: '100%'
    },
    menuButtonBlue: {
        background: 'url(' + contextJsParameters.contextPath + '/engines/jahia-anthracite/images/dx_logo_solid.png) center/100% no-repeat'
    }
});

export class BurgerMenuButton extends React.Component {
    openMenu() {
        const clickEvent = window.top.document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        window.top.document.getElementsByClassName('editmode-managers-menu')[0].dispatchEvent(clickEvent);
    }

    render() {
        let {classes, isDrawerOpen} = this.props;
        return (
            <div className={classNames(classes.menuButton, isDrawerOpen && classes.menuButtonBlue)} data-cm-role="cm-burger-menu" onClick={() => this.openMenu()}/>
        );
    }
}

export default compose(translate(), withStyles(styles, {name: 'DxBurgerMenuButton'}))(BurgerMenuButton);
