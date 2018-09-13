import React from "react";
import {Divider, Drawer, IconButton, List, Paper, withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import classNames from "classnames";
import {ChevronLeft, ChevronRight, Menu} from '@material-ui/icons';
import Actions from "./Actions";
import CmLeftMenuItem from "./renderAction/CmLeftMenuItem";
import {connect} from "react-redux";
import * as _ from 'lodash';

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
        const { siteKey, lang, classes } = this.props;

        return (
            <Paper elevation={0} data-cm-role={'left-navigation'}>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.openDrawer && classes.drawerPaperClose),
                    }}
                    open={this.state.openDrawer}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.state.openDrawer ? this.handleDrawerClose : this.handleDrawerOpen} data-cm-role={'left-navigation-toggle'}>
                            {this.state.openDrawer ? <ChevronLeft/> : <ChevronRight/>}
                        </IconButton>
                    </div>
                    <Divider/>
                    <List component="nav" data-cm-role={'left-navigation-menu'}>
                        <Actions menuId="leftMenuActions" context={{
                            path: `/sites/${siteKey}`,
                            siteKey: siteKey,
                            lang: lang
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

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    //
})

CMLeftNavigation = _.flowRight(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(CMLeftNavigation);

export default CMLeftNavigation;