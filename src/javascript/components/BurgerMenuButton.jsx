import React from "react";
import {translate} from "react-i18next";
import {withStyles, IconButton, SvgIcon} from '@material-ui/core';

const styles = theme => ({
    menuButton: {
        background: "url(" + contextJsParameters.contextPath + "/engines/jahia-anthracite/images/dx_logo_solid.png) center center no-repeat",
        marginLeft: -12,
        marginRight: 20,
        width: "3em",
        height: "3em",
        backgroundSize: "100%"
    }
});

class BurgerMenuButton extends React.Component {
    render() {
        let {classes} = this.props;

        return (
            <div className={classes.menuButton} color="inherit" aria-label="Menu"/>
        );
    }
}

BurgerMenuButton = withStyles(styles, {name:"DxBurgerMenuButton"})(BurgerMenuButton);

export default translate()(BurgerMenuButton);