import React from "react";
import {translate} from "react-i18next";
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    burgerMenuButton : {
        position: "absolute",
        top: "39px",
        left: "39px",
        background: "url(/images/dx_logo_solid.png) center center no-repeat",
        width: "3rem",
        height: "3rem",
        backgroundSize: "100%",
        textIndent: "-50000px"
    }
});

class BurgerMenuButton extends React.Component {
    render() {
        let {classes} = this.props;

        return (<button type="button" className={classes.burgerMenuButton} id="hamburger_menu_button">Menu</button>);
    }
}

BurgerMenuButton = withStyles(styles, {name:"DxBurgerMenuButton"})(BurgerMenuButton);

export default translate()(BurgerMenuButton);