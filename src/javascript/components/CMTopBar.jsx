import React from "react";
import {withStyles, Toolbar, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import {LanguageSwitcher} from '@jahia/react-material';
import SiteSelector from './SiteSelector';
import BurgerMenuButton from './BurgerMenuButton';
import Sql2SearchInputForm from './Sql2SearchInputForm';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";
import {DxContext} from "./DxContext";
import {CmSearchBar} from "./CmSearchBar";

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    head: {
        display: "inline-block",
        verticalAlign: "top"
    },
    search: {
        margin: theme.spacing.unit
    },
    Iam: {
        margin: theme.spacing.unit
    }
});

class CMTopBar extends React.Component {

    render() {

        const { dxContext, classes, t } = this.props;

        return (
            <div className={classes.root}>
                <Toolbar color={'secondary'}>
                    <BurgerMenuButton/>
                    <div className={classes.head}>
                        <SiteSelector/>
                        <Typography variant="display1" color="inherit">{t('label.contentManager.title')}</Typography>
                        <LanguageSwitcher/>
                    </div>
                    <div className={classes.search}>
                        <CmRouter render={({params}) => (
                            <CmSearchBar dxContext={dxContext} sql2SearchFrom={params.sql2SearchFrom} sql2SearchWhere={params.sql2SearchWhere}/>
                        )}/>
                    </div>
                    {/*ToDo: To be removed before release: use to display the logged user name while working on BACKLOG-8179*/}
                    <div className={classes.Iam}>
                        <DxContext.Consumer>
                            { dxContext => (
                                <Typography variant="display1" color="inherit" align="right">{t('label.contentManager.Iam', {userName: dxContext.userName})}</Typography>
                            )}
                        </DxContext.Consumer>
                    </div>
                </Toolbar>
            </div>
        );
    }
}

CMTopBar = compose(
    translate(),
    withStyles(styles)
)(CMTopBar);

export default CMTopBar;