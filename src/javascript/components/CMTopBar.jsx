import React from "react";
import {withStyles, Toolbar, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import {LanguageSwitcher} from '@jahia/react-material';
import SiteSelector from './SiteSelector';
import BurgerMenuButton from './BurgerMenuButton';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";
import {DxContext} from "./DxContext";
import {CmSearchBar} from "./CmSearchBar";

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

        const { dxContext, classes, t } = this.props;

        return (
            <Toolbar color={'secondary'} classes={{root: classes.root}}>
                <BurgerMenuButton/>
                <div className={classes.head}>
                    <SiteSelector/>
                    <Typography variant="display1" color="inherit">{t('label.contentManager.title')}</Typography>
                    <LanguageSwitcher/>
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
                    <CmRouter render={({params}) => (
                        <CmSearchBar dxContext={dxContext} searchTerms={params.searchTerms} sql2SearchFrom={params.sql2SearchFrom} sql2SearchWhere={params.sql2SearchWhere}/>
                    )}/>
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