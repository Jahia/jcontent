import React from "react";
import { withStyles, IconButton, Drawer, Divider, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';

import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import classNames from "classnames";
import {Menu, ChevronLeft, ChevronRight} from '@material-ui/icons';
import Actions from "./Actions";

const drawerWidth = 240;

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
        open: true,
    };

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    render() {
        const { dxContext, classes, baseRoutePath, t } = this.props;

        return (
                <div className={classes.root}>
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                        }}
                        open={this.state.open}
                    >
                        <div className={classes.toolbar}>
                            <IconButton onClick={this.state.open ? this.handleDrawerClose : this.handleDrawerOpen}>
                                {this.state.open ? <ChevronLeft/> : <ChevronRight/> }
                            </IconButton>
                        </div>
                        <Divider/>
                        <List component="nav">
                            <Actions menuId="leftMenuActions" context={{path:'', siteKey: dxContext.siteKey, lang : dxContext.lang}}>
                                {(props) =>
                                    <ListItem button onClick={props.onClick}>
                                        <ListItemIcon>
                                            <Menu/>
                                        </ListItemIcon>
                                        <ListItemText inset primary={t(props.labelKey)}/>
                                    </ListItem>
                                }
                            </Actions>
                        </List>
                        <Divider/>
                    </Drawer>
                </div>
        );
    }
}


CMLeftNavigation = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CMLeftNavigation);

export default CMLeftNavigation;