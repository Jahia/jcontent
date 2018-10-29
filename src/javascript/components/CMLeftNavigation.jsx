import React from "react";
import {List, ListItem, withStyles, Typography, Drawer} from '@material-ui/core';
import LanguageSwitcher from "./languageSwitcher/LanguageSwitcher";
import SiteSwitcher from "./siteSwitcher/SiteSwitcher";
import {translate} from 'react-i18next';
import classNames from "classnames";
import BurgerMenuButton from "./BurgerMenuButton";
import {Description, VerifiedUser} from '@material-ui/icons';
import Actions from "./Actions";
import CmLeftMenuItem from "./renderAction/CmLeftMenuItem";
import {connect} from "react-redux";
import * as _ from 'lodash';
import actionsRegistry from "./actionsRegistry";
import CmLeftDrawerContent from "./CmLeftDrawerContent";
import Icon from "./icons/Icon";

export const drawerWidth = 289;
// TODO this styles should be provided by the theme / new structure when available

const styles = theme => ({
    root: {
        zIndex: 1,
        paddingLeft: '38px',
        background: '#f7f7f7',
        fontFamily: "Nunito sans, sans-serif",
        minWidth: '105px',
        overflow: 'visible!important',//Safari compatibility
        "-webkit-transform-style": 'preserve-3d',//Safari compatibility
        height: '100%',
        display: 'flex',
    },
    root1: {
        zIndex: 0,
        minWidth: '105px',
        paddingLeft: '38px',
        background: theme.palette.background.default,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
    },
    side: {zIndex: 1, position: "relative"},
    childItem: {
        background: '#007cb0',
        color: '#ffffff',
        fontFamily: "Nunito sans, sans-serif",
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
        background: 'transparent',
        color: '#504e4d',
        fontFamily: "Nunito sans, sans-serif",
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
        color: '#504e4d'
    },
    childIconLight: {
        fontSize: '18px',
        color: '#d1d1d2'
    },
    menuBurger: {
        backgroundColor: 'transparent!important',
        paddingRight: '0px!important',
        paddingTop: '34px!important',
        paddingLeft: '20px!important',
        paddingBottom: '22px!important',
        boxShadow: 'none!important',
    },
    drawerPaper: {
        background: '#f7f7f7',
        position: 'absolute',
        boxShadow: '2px 0 1px -2px rgba(0, 0, 21, 0.29)',
        zIndex: 1,
        left: 105,
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperPersistent: {
        background: '#ffffff',
        position: 'relative',
        boxShadow: '2px 0 1px -2px rgba(0, 0, 21, 0.29)',
        zIndex: 1,
        left: 105,
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        width: 0,
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    iconDark: {
        color: '#504e4d',
        fontSize: '1.7em',
    },
    iconLight: {
        color: '#F5F5F5',
        fontSize: '1.7em',
    },
    typographyIcon: {
        display: 'block',
        color: '#504e4d',
        fontSize: '9px',
        textAlign: 'center',
        fontFamily: "Nunito Sans, sans-serif",
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typographyIconLight: {
        display: 'block',
        color: '#F5F5F5',
        fontSize: '9px',
        textAlign: 'center',
        fontFamily: "Nunito Sans, sans-serif",
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typoTitle: {
        fontSize: '25px',
        fontFamily: "Nunito sans, sans-serif",
        lineHeight: '32px',
        fontWeight: '100',
        color: '#504e4d',
        width: '260px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        marginTop: '-3px',
        marginLeft: '5px'
    },
    margin: {
        margin: theme.spacing.unit * 2,
    },
    blockMenu: {
        marginTop: 24,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
    switcher: {
        marginBottom: '-100px!important'
    },
    badge: {
        background: '#e40000',
        fontWeight: 600,
        fontSize: '11px',
        color: '#fafafa',
    },
    list: {
        paddingTop: '0!important',
        height: '100vh'
    },
    listItem: {
        display: 'block',
        padding: '0!important',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        width: '48px!important',
        paddingBottom: '10px!important',
    },
    drawerTree: {
        marginTop: '18px'
    },
    siteSwitcher: {
        marginBottom: '-10px',
        marginLeft: 0,
    },
    languageSwitcher: {
        marginTop: '-10px',
        marginLeft: 0,
    }
});

class CMLeftNavigation extends React.Component {

    constructor(props) {

        super(props);

        if (props.mode === "apps") {
            let actionPath = this.props.path.split("/");
            let menuActionKey = actionPath ? actionPath.shift() : "";
            const menuId = actionsRegistry[menuActionKey].menuId;
            let actionContext = {
                path: `/sites/${this.props.siteKey}`,
                siteKey: this.props.siteKey,
                lang: this.props.lang,
                actionPath: "/" + menuActionKey
            };
            this.state = {
                openDrawerMenuId: menuId,
                openDrawer: true,
                drawerContent: {
                    content: <CmLeftDrawerContent context={actionContext} menuId={menuId} handleDrawerClose={this.handleDrawerClose}/>,
                    title: this.props.t(actionsRegistry[menuActionKey].labelKey)
                }
            }
        } else {
            this.state = {
                openDrawer: false,
                drawerContent: {
                    content: null,
                    title: null
                }
            };
        }
    }

    handleDrawerOpen = (drawerContent, menuId) => {
        this.setState({
            openDrawerMenuId: menuId,
            openDrawer: true,
            drawerContent: drawerContent
        });
    };

    handleDrawerClose = () => {
        this.setState({
            openDrawerMenuId: null,
            openDrawer: false,
            drawerContent: null
        });
    };

    render() {

        const {siteKey, lang, t, classes, mode, contextPath} = this.props;

        let actionContext = {
            path: `/sites/${siteKey}${mode === 'browse-files' ? '/files' : ''}`,
            siteKey: siteKey,
            lang: lang
        };

        return (
            <div className={this.state.openDrawer ? classes.root : classes.root1}>
                <div className={classes.side}>
                    <List className={classes.list} component="nav">
                        <ListItem button className={classes.menuBurger}>
                            <BurgerMenuButton contextPath={contextPath} isDrawerOpen={this.state.openDrawer}/>
                        </ListItem>
                        <Actions
                            menuId={"leftMenuActions"}
                            context={actionContext}
                            openDrawerMenuId={this.state.openDrawerMenuId}
                            drawerOpen={this.state.openDrawer}
                            handleDrawerClose={this.handleDrawerClose.bind(this)}
                            handleDrawer={this.state.openDrawer && mode !== "apps" ? this.handleDrawerClose.bind(this) : this.handleDrawerOpen.bind(this)}
                        >
                            {(props) =>
                                <CmLeftMenuItem
                                    {...props}
                                    drawer={this.state.openDrawer}
                                    icon={props.customIcon ? <Icon name={props.customIcon.name} viewBox={props.customIcon.viewBox} fill={this.state.openDrawer ? '#504e4d' : '#F5F5F5'}/> : <Description className={this.state.openDrawer ? classes.iconDark : classes.iconLight}/>}
                                />
                            }
                        </Actions>
                    </List>
                    <Actions
                        menuId="leftMenuBottomAction"
                        context={actionContext}
                        handleDrawer={this.state.openDrawer ? this.handleDrawerClose.bind(this) : this.handleDrawerOpen.bind(this)}
                    >
                        {(props) =>
                            <CmLeftMenuItem
                                {...props}
                                bottom={true}
                                badge={props.badge}
                                drawer={this.state.openDrawer}
                                icon={props.customIcon ? <Icon name={props.customIcon.name} viewBox={props.customIcon.viewBox} fill={this.state.openDrawer ? '#504e4d' : '#F5F5F5'}/> : <Description className={this.state.openDrawer ? classes.iconDark : classes.iconLight}/>}
                            />
                        }
                    </Actions>
                </div>
                <Drawer
                    variant="persistent"
                    classes={{
                        paper: classNames(this.state.openDrawer && classes.drawerPaper, !this.state.openDrawer && classes.drawerPaperClose),
                    }}
                    open={this.state.openDrawer}
                >
                    <div className={classes.blockMenu}>
                        <div className={classes.siteSwitcher}>
                            <SiteSwitcher dark={true}/>
                        </div>
                        <Typography className={classes.typoTitle}>
                            {this.state.drawerContent &&
                                t(this.state.drawerContent.title)
                            }
                        </Typography>
                        <div className={classes.languageSwitcher}>
                            <LanguageSwitcher dark={true}/>
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

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language,
    mode: state.mode,
    path: state.path
});

const mapDispatchToProps = (dispatch, ownProps) => ({
});

CMLeftNavigation = _.flowRight(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(CMLeftNavigation);

export default CMLeftNavigation;