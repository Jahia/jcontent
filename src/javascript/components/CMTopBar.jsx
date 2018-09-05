import React from "react";
import {withStyles, Toolbar, Typography} from "@material-ui/core";
import {translate} from "react-i18next";
import LanguageSwitcher from "./languageSwitcher/LanguageSwitcher";
import SiteSwitcher from "./siteSwitcher/SiteSwitcher";
import BurgerMenuButton from "./BurgerMenuButton";
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";
import {DxContext} from "./DxContext";
import {CmSearchBar} from "./CmSearchBar";
import {Routes} from "./Routes";
import {withNotifications} from "@jahia/react-material";

const styles = theme => ({
    root: {
        flexGrow: 1,
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit
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
});

class CMTopBar extends React.Component {

    render() {

        const {dxContext, baseRoutePath, classes, mode, t} = this.props;
        let modeTitle = t("label.contentManager.title." + (mode || "browse"));

        return (
            <Toolbar color={"secondary"} classes={{root: classes.root}}>
                <BurgerMenuButton/>
                <div className={classes.head}>
                    <SiteSwitcher key={"siteSwitcher_" + dxContext.siteKey + "_" + dxContext.lang} dxContext={dxContext}/>
                    <Typography variant="display1" color="inherit">{modeTitle}</Typography>
                    <LanguageSwitcher key={"languageSwitcher_" + dxContext.siteKey + "_" + dxContext.lang} dxContext={dxContext}/>
                </div>

                {/*ToDo: To be removed before release: use to display the logged user name while working on BACKLOG-8179*/}
                <div>
                    <DxContext.Consumer>
                        { dxContext => (
                            <Typography variant="subheading" color="inherit">
                                I am {dxContext.userName}
                            </Typography>
                        )}
                    </DxContext.Consumer>
                </div>

                <div className={classes.search}>
                    <CmRouter render={({params}) => {

                        let searchBar = <CmSearchBar dxContext={dxContext} urlParams={params}/>

                        return (
                            <Routes
                                basePath={baseRoutePath}
                                browseRender={props =>
                                    searchBar
                                }
                                browseFilesRender={props =>
                                    searchBar
                                }
                                searchRender={props =>
                                    searchBar
                                }
                                sql2SearchRender={props =>
                                    searchBar
                                }
                            />
                        );
                    }}/>
                </div>
            </Toolbar>
        );
    }
}

CMTopBar = compose(
    translate(),
    withStyles(styles)
)(CMTopBar);

export default CMTopBar;