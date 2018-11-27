import React from 'react';
import {Drawer, List, ListItem, Typography, withStyles} from '@material-ui/core';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import SiteSwitcher from '../siteSwitcher/SiteSwitcher';
import {translate} from 'react-i18next';
import classNames from 'classnames';
import BurgerMenuButton from '../BurgerMenuButton';
import {connect} from 'react-redux';
import {DisplayActions} from '@jahia/react-material';
import CmLeftMenuItem from './CmLeftMenuItem';
import {compose} from 'react-apollo';

export const drawerWidth = 289;
const styles = theme => ({
    root: {
        zIndex: 1,
        paddingLeft: '38px',
        background: theme.palette.background.paper,
        minWidth: '105px',
        overflow: 'visible !important', // Safari compatibility
        '-webkit-transform-style': 'preserve-3d', // Safari compatibility
        height: '100%',
        display: 'flex'
    },
    root1: {
        zIndex: 0,
        minWidth: '105px',
        paddingLeft: '38px',
        background: theme.palette.layout.dark,
        overflow: 'hidden',
        height: '100%',
        display: 'flex'
    },
    side: {zIndex: 1, position: 'relative'},
    childItem: {
        background: theme.palette.primary.main,
        color: theme.palette.text.contrastText,
        fontFamily: 'Nunito sans, sans-serif',
        padding: '1px 10px 4px 5px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        textAlign: 'left',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '0.828rem'
    },
    childOff: {
        color: theme.palette.text.secondary,
        fontFamily: 'Nunito sans, sans-serif',
        fontWeight: 500,
        padding: '1px 10px 4px 5px',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '0.828rem'
    },
    childIcon: {
        fontSize: '18px',
        color: theme.palette.text.secondary
    },
    childIconLight: {
        fontSize: '18px',
        color: theme.palette.background.default
    },
    menuBurger: {
        paddingRight: '0px !important',
        paddingTop: '34px !important',
        paddingLeft: '20px !important',
        paddingBottom: '22px !important',
        boxShadow: 'none !important'
    },
    drawerPaper: {
        background: theme.palette.background.paper,
        position: 'absolute',
        boxShadow: '2px 0 1px -2px rgba(0, 0, 21, 0.29)',
        zIndex: 1,
        left: 105,
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerPaperPersistent: {
        background: theme.palette.background.paper,
        position: 'relative',
        boxShadow: '2px 0 1px -2px rgba(0, 0, 21, 0.29)',
        zIndex: 1,
        left: 105,
        width: drawerWidth,
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
    iconDark: {
        color: theme.palette.text.secondary,
        fontSize: '1.7em'
    },
    iconLight: {
        color: theme.palette.text.contrastText,
        fontSize: '1.7em'
    },
    typographyIcon: {
        display: 'block',
        color: theme.palette.text.secondary,
        fontSize: '9px',
        textAlign: 'center',
        fontFamily: 'Nunito Sans, sans-serif',
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typographyIconLight: {
        display: 'block',
        color: theme.palette.text.contrastText,
        fontSize: '9px',
        textAlign: 'center',
        fontFamily: 'Nunito Sans, sans-serif',
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typoTitle: {
        fontSize: '25px',
        fontFamily: 'Nunito sans, sans-serif',
        lineHeight: '32px',
        fontWeight: '100',
        color: theme.palette.text.secondary,
        width: '260px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        marginTop: '-3px',
        marginLeft: '5px'
    },
    backgroundBurger: {
    },
    margin: {
        margin: theme.spacing.unit * 2
    },
    blockMenu: {
        marginTop: 24
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`
    },
    switcher: {
        marginBottom: '-100px !important'
    },
    badge: {
        background: theme.palette.error.light,
        fontWeight: 600,
        fontSize: '11px',
        color: theme.palette.text.contrastText
    },
    list: {
        paddingTop: '0 !important',
        height: '100vh'
    },
    listItem: {
        display: 'block',
        padding: '0 !important',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        width: '48px !important',
        paddingBottom: '10px !important'
    },
    drawerTree: {
        marginTop: '18px'
    },
    siteSwitcher: {
        marginBottom: '-10px',
        marginLeft: 0
    },
    languageSwitcher: {
        marginTop: '-10px',
        marginLeft: 0
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
            <div className={this.state.openDrawer ? classes.root : classes.root1}>
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
                        <div className={classes.siteSwitcher}>
                            <SiteSwitcher dark/>
                        </div>
                        <Typography className={classes.typoTitle}>
                            {this.state.drawerContent &&
                            t(this.state.drawerContent.title)
                            }
                        </Typography>
                        <div className={classes.languageSwitcher}>
                            <LanguageSwitcher dark/>
                        </div>
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
