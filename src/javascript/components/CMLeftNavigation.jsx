import React from "react";
import {withStyles, Paper, IconButton, Drawer, Divider, List} from '@material-ui/core';

import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import classNames from "classnames";
import {Menu, ChevronLeft, ChevronRight} from '@material-ui/icons';
import Actions from "./Actions";
import CmLeftMenuItem from "./renderAction/CmLeftMenuItem";

const drawerWidth = 240;
// TODO this styles should be provided by the theme / new structure when available
const styles = theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 5,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 7,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
    },
});

class CMLeftNavigation extends React.Component {

    state = {
        openDrawer: true,
    };

    handleDrawerOpen = () => {
        this.setState({openDrawer: true});
    };

    handleDrawerClose = () => {
        this.setState({openDrawer: false});
    };

    render() {
        const {dxContext, classes} = this.props;

        return (
            <Paper elevation={0}>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.openDrawer && classes.drawerPaperClose),
                    }}
                    open={this.state.openDrawer}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.state.openDrawer ? this.handleDrawerClose : this.handleDrawerOpen}>
                            {this.state.openDrawer ? <ChevronLeft/> : <ChevronRight/>}
                        </IconButton>
                    </div>
                    <Divider/>
                    <List component="nav">
                        <Actions menuId="leftMenuActions" context={{
                            path: `/sites/${dxContext.siteKey}`,
                            siteKey: dxContext.siteKey,
                            lang: dxContext.lang
                        }}>
                            {(props) =>
                                <CmLeftMenuItem {...props} icon={<Menu/>}/>
                            }
                        </Actions>
                    </List>
                    <Divider/>
                </Drawer>
            </Paper>
        );
    }
}


CMLeftNavigation = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CMLeftNavigation);

export default CMLeftNavigation;