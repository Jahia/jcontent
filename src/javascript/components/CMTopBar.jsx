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
        fontSize: '1.7rem',
        fontFamily: "Nunito sans, sans-serif",
        lineHeight: '32px',
        fontWeight: '100',
        color: '#f5f5f5',
        width: '260px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        marginTop: -10,
        marginBottom: -10,
    },
    block: {
        marginTop: -24,
        marginLeft: -21,
        marginRight: 20,
    },
    siteSwitcher: {
        marginLeft: '-8px'

    },
    languageSwitcher: {
        marginLeft: '-8px'
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
        maxWidth: '100%',
    }
});

class CMTopBar extends React.Component {
    render() {

        const {classes, mode, t} = this.props;
        let modeTitle = t("label.contentManager.title." + (mode || "browse"));
        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={2} style={{marginTop: '-22px', marginLeft: '-22px', display: 'inline-grid'}}>
                        <div style={{marginBottom: '-8px', marginLeft: '-6px'}}>
                            <SiteSwitcher dark={false}/>
                        </div>
                        <Typography className={classes.typoTitle} data-cm-role={'cm-mode-title'}>{modeTitle}</Typography>
                        <div style={{marginTop: '-8px', marginLeft: '-6px'}}>
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