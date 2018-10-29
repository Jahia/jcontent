import React from "react";
import {withStyles, Typography, Grid} from "@material-ui/core";
import {translate} from "react-i18next";
import LanguageSwitcher from "./languageSwitcher/LanguageSwitcher";
import SiteSwitcher from "./siteSwitcher/SiteSwitcher";
import {compose} from "react-apollo/index";
import {DxContext} from "./DxContext";
import {CmSearchBar} from "./CmSearchBar";

const styles = theme => ({
    root: {
        minHeight: '100px',
        maxHeight: '100px',
        display: 'flex',
        marginTop: '12px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: theme.spacing.unit
    },
    typoTitle: {
        fontSize: '25px',
        fontFamily: "Nunito sans, sans-serif",
        lineHeight: '32px',
        fontWeight: '100',
        color: theme.palette.background.paper,
        width: '260px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        marginTop: -10,
        marginLeft: '5px'
    },
    siteSwitcher: {
    },
    languageSwitcher: {
        marginTop: '-10px'
    },
    head: {
        display: "inline-block",
        verticalAlign: "top",
        marginRight: "auto"
    },
    search: {
        marginLeft: "auto",
        width: "80%"
    },
    topBarwidth: {
        width: 'min-content',
    },
    topBarGrid: {
        marginTop: '-24px',
        marginLeft: '-22px'
    }
});

class CMTopBar extends React.Component {
    render() {

        const {classes, mode, t} = this.props;
        let modeTitle = t("label.contentManager.title." + (mode || "browse"));
        return (
            <div className={classes.root} data-cm-role={'cm-top-bar'}>
                <Grid container spacing={24}>
                    <Grid item xs={2} className={classes.topBarGrid}>
                        <div className={classes.siteSwitcher}>
                            <SiteSwitcher dark={false}/>
                        </div>
                        <Typography className={classes.typoTitle} data-cm-role={'cm-mode-title'}>{modeTitle}</Typography>
                        <div className={classes.languageSwitcher}>
                            <LanguageSwitcher dark={false}/>
                        </div>
                    </Grid>
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={9} className={classes.topBarwidth}>
                        <CmSearchBar/>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

CMTopBar = compose(
    translate(),
    withStyles(styles)
)(CMTopBar);

export default CMTopBar;