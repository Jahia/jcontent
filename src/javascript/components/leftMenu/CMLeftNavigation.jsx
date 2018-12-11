import React from 'react';
import {Drawer, Grid, List, ListItem, Typography, withStyles} from '@material-ui/core';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import SiteSwitcher from '../siteSwitcher/SiteSwitcher';
import {translate} from 'react-i18next';
import classNames from 'classnames';
import BurgerMenuButton from '../BurgerMenuButton';
import {connect} from 'react-redux';
import {DisplayActions} from '@jahia/react-material';
import CmLeftMenuItem from './CmLeftMenuItem';
import {compose} from 'react-apollo';

const styles = theme => ({
    root: {
        minWidth: (theme.contentManager.screenMargin + theme.contentManager.leftNavigationWidth) + 'px',
        paddingLeft: theme.spacing.unit * 4,
        height: '100%',
        display: 'flex'
    },
    rootOpenDrawer: {
        zIndex: theme.zIndex.modal,
        background: theme.palette.background.paper,
        overflow: 'visible !important', // Safari compatibility
        '-webkit-transform-style': 'preserve-3d' // Safari compatibility
    },
    rootClosedDrawer: {
        background: theme.palette.layout.dark,
        overflow: 'hidden'
    },
    side: {
        position: 'relative'
    },
    menuBurger: {
        paddingRight: '0px !important',
        paddingTop: '34px !important',
        paddingLeft: '20px !important',
        paddingBottom: '22px !important',
        boxShadow: 'none !important',
        background: 'none!important',
        transition: 'none'
    },
    drawerPaper: {
        background: theme.palette.background.paper,
        position: 'absolute',
        boxShadow: '2px 0 1px -2px rgba(0, 0, 21, 0.29)',
        left: (theme.contentManager.screenMargin + theme.contentManager.leftNavigationWidth),
        width: theme.contentManager.leftNavigationDrawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerPaperClose: {
        width: 0,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    typoTitle: {
        color: theme.palette.text.secondary,
        width: '260px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    blockMenu: {
        marginTop: 21
    },
    list: {
        paddingTop: '0 !important',
        height: '100vh'
    },
    drawerTree: {
        marginTop: '18px'
    },
    siteSwitcher: {
        marginLeft: 0,
        '& button': {
            margin: '2px 0'
        }
    },
    languageSwitcher: {
        marginLeft: 0,
        '& button': {
            margin: '2px 0'
        }
    }

});

class CMLeftNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openDrawer: false,
            drawerContent: {
                content: null,
                title: null
            }
        };
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
    }

    handleDrawerOpen(drawerContent, menu) {
        this.setState({
            openDrawerMenu: menu,
            openDrawer: true,
            drawerContent: drawerContent
        });
    }

    handleDrawerClose() {
        this.setState({
            openDrawerMenu: null,
            openDrawer: false
        });
    }

    render() {
        const {siteKey, t, classes, mode, contextPath} = this.props;

        let actionContext = {
            path: `/sites/${siteKey}${mode === 'browse-files' ? '/files' : ''}`,
            drawer: {
                openDrawerMenu: this.state.openDrawerMenu,
                drawerOpen: this.state.openDrawer,
                handleDrawerClose: this.handleDrawerClose.bind(this),
                handleDrawerOpen: this.handleDrawerOpen.bind(this),
                site: this.state.drawerContent && this.state.drawerContent.site ? this.state.drawerContent.site : undefined
            }
        };

        return (
            <div className={classNames(classes.root, {[classes.rootOpenDrawer]: this.state.openDrawer, [classes.rootClosedDrawer]: !this.state.openDrawer})}>
                <div className={classes.side}>
                    <List className={classes.list} component="nav">
                        <ListItem button className={classes.menuBurger}>
                            <BurgerMenuButton contextPath={contextPath} isDrawerOpen={this.state.openDrawer}/>
                        </ListItem>
                        <DisplayActions target="leftMenuActions"
                                        context={actionContext}
                                        render={({context}) => (
                                            <CmLeftMenuItem context={context} drawer={this.state.openDrawer}/>
                                        )}/>

                    </List>

                    <DisplayActions target="leftMenuBottomActions"
                                    context={actionContext}
                                    render={({context}) => (
                                        <CmLeftMenuItem bottom context={context} drawer={this.state.openDrawer}/>
                                    )}
                    />
                </div>
                <Drawer
                    variant="persistent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.openDrawer && classes.drawerPaperClose)
                    }}
                    open={this.state.openDrawer}
                >
                    <div className={classes.blockMenu}>
                        <Grid container spacing={0} alignItems="center">
                            <Grid item xs={2}>
                                <div className={classes.siteSwitcher}>
                                    <SiteSwitcher dark/>
                                </div>
                                <Typography variant="h5" color="inherit" className={classes.typoTitle}>
                                    {this.state.drawerContent &&
                            t(this.state.drawerContent.title)
                            }
                                </Typography>
                                <div className={classes.languageSwitcher}>
                                    <LanguageSwitcher dark/>
                                </div>
                            </Grid>
                        </Grid>
                    </div>

                    <div className={classes.drawerTree}>
                        {this.state.drawerContent &&
                        this.state.drawerContent.content
                        }
                    </div>
                </Drawer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    mode: state.mode
});

export default compose(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(CMLeftNavigation);
