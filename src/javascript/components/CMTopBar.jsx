import React from "react";
import {Toolbar, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import {LanguageSwitcher, SearchBar} from '@jahia/react-material';
import SiteSelector from './SiteSelector';
import BurgerMenuButton from './BurgerMenuButton';
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    topBar : {
        height : "9.5rem"
    },
    headerMenu : {
        position: "absolute",
        left: "7rem",
        top: "25px"
    },
    dropDown : {
        position: "relative"
    },
    pageTitle : {
        fontSize: "2.5rem",
        lineHeight: "31px",
        fontWeight: "100",
        color: "#dad8d8"
    },
    searchContainer : {
        position: "fixed",
        top: "2.85rem",
        background: "red",
        right: "40px",
        width: "calc(100% - 400px)",
        zIndex: "99999999"
    }
});

class CMTopBar extends React.Component {


    render() {
        let {classes} = this.props;

        return (
            <Toolbar className={classes.topBar}>
                <BurgerMenuButton/>
                <div className={classes.headerMenu}>
                    <SiteSelector className={classes.dropdown}/>
                    <h1 className={classes.pageTitle}>All Content</h1>
                    <LanguageSwitcher className={classes.dropdown}/>
                </div>
                <div className={classes.searchContainer}>
                </div>
            </Toolbar>
        )
    }
}

CMTopBar = withStyles(styles, {name:"DxCmTopBar"})(CMTopBar);

export default translate()(CMTopBar);