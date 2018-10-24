import React from "react";
import {translate} from "react-i18next";
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    menuButton: {
        marginLeft: -12,
        marginRight: 6,
        width: "3.5em",
        height: "3.5em",
        backgroundSize: "100%"
    }
});

class BurgerMenuButton extends React.Component {

    openMenu = () => {
        const clickEvent = window.top.document.createEvent("MouseEvents");
        clickEvent.initEvent("click", true, true);
        window.top.document.getElementsByClassName("editmode-managers-menu")[0].dispatchEvent(clickEvent);
    };

    render() {
        let {classes, contextPath, isDrawerOpen} = this.props;
        let backgroundImageURL = contextPath + "/engines/jahia-anthracite/images/logos/" + (isDrawerOpen ? "dx_logo_solid-black.png" :  "dx_logo_solid-white.png");
        return (
            <div className={classes.menuButton}
                 style={{backgroundImage: `url(${backgroundImageURL})`, backgroundPosition: 'center', backgroundSize: 'center', backgroundRepeat: 'noRepeat'}}
                 onClick={() => this.openMenu()}
                 data-cm-role="cm-burger-menu"/>
        );
    }
}

BurgerMenuButton = withStyles(styles, {name:"DxBurgerMenuButton"})(BurgerMenuButton);

export default translate()(BurgerMenuButton);