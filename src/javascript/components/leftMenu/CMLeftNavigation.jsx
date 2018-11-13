import React from "react";
import {Drawer, List, ListItem, Typography, withStyles} from '@material-ui/core';
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import SiteSwitcher from "../siteSwitcher/SiteSwitcher";
import {translate} from 'react-i18next';
import classNames from "classnames";
import BurgerMenuButton from "../BurgerMenuButton";
import {Description} from '@material-ui/icons';
import {connect} from "react-redux";
import * as _ from 'lodash';
import Icon from "../icons/Icon";
import {actionsRegistry, DisplayActions} from "@jahia/react-material";
import CmLeftMenuItem from "./CmLeftMenuItem";

export const drawerWidth = 289;

// TODO this styles should be provided by the theme / new structure when available
const styles = theme => ({
    root: {
        zIndex: 1,
        paddingLeft: '38px',
        background: '#f7f7f7',
        fontFamily: "Nunito sans, sans-serif",
        minWidth: '105px',
        overflow: 'visible !important', //Safari compatibility
        "-webkit-transform-style": 'preserve-3d', //Safari compatibility
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
        backgroundColor: 'transparent !important',
        paddingRight: '0px !important',
        paddingTop: '34px !important',
        paddingLeft: '20px !important',
        paddingBottom: '22px !important',
        boxShadow: 'none !important',
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
        marginBottom: '-100px !important'
    },
    badge: {
        background: '#e40000',
        fontWeight: 600,
        fontSize: '11px',
        color: '#fafafa',
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
        paddingBottom: '10px !important',
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
        this.state = {
            openDrawer: false,
            drawerContent: {
                content: null,
                title: null
            }
        };
    }

    handleDrawerOpen = (drawerContent, menu) => {
        this.setState({
            openDrawerMenu: menu,
            openDrawer: true,
            drawerContent: drawerContent
        });
    };

    handleDrawerClose = () => {
        this.setState({
            openDrawerMenu: null,
            openDrawer: false,
        });
    };


    render() {

        const {siteKey, t, classes, mode, contextPath} = this.props;

        let getIcon = (props)=> {
            let icon = <Description className={this.state.openDrawer ? classes.iconDark : classes.iconLight}/>;
            if (props.customIcon) {
                icon = <Icon name={props.customIcon.name} viewBox={props.customIcon.viewBox} fill={this.state.openDrawer ? '#504e4d' : '#F5F5F5'}/>
            } else if (props.externalIconPathSelected && this.state.openDrawer) {
                icon = <img src={props.externalIconPathSelected}/>
            } else if (props.externalIconPath) {
                icon = <img src={props.externalIconPath}/>
            }
            return icon;
        };

        let actionContext = {
            path: `/sites/${siteKey}${mode === 'browse-files' ? '/files' : ''}`,
            drawer: {
                openDrawerMenu: this.state.openDrawerMenu,
                drawerOpen: this.state.openDrawer,
                handleDrawerClose: this.handleDrawerClose.bind(this),
                handleDrawerOpen: this.handleDrawerOpen.bind(this),
            }
        };

        return (
            <div className={this.state.openDrawer ? classes.root : classes.root1}>
                <div className={classes.side}>
                    <List className={classes.list} component="nav">
                        <ListItem button className={classes.menuBurger}>
                            <BurgerMenuButton contextPath={contextPath} isDrawerOpen={this.state.openDrawer}/>
                        </ListItem>
                        <DisplayActions target={"leftMenuActions"} context={actionContext} render={({context})=> <CmLeftMenuItem context={context}
                                                                                                                                 drawer={this.state.openDrawer}
                                                                                                                                 icon={getIcon(context)} />} />

                    </List>

                    <DisplayActions target={"leftMenuBottomActions"} context={actionContext} render={({context})=> <CmLeftMenuItem context={context}
                                                                                                                                  bottom={true}
                                                                                                                                  badge={context.badge}
                                                                                                                                  drawer={this.state.openDrawer}
                                                                                                                                  icon={getIcon(context)} />}
                    />

                        {/*/!*handleDrawer={this.state.openDrawer ? this.handleDrawerClose.bind(this) : this.handleDrawerOpen.bind(this)}*!/*/}
                </div>
                <Drawer
                    variant="persistent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.openDrawer && classes.drawerPaperClose),
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
    mode: state.mode,
});

CMLeftNavigation = _.flowRight(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(CMLeftNavigation);

export default CMLeftNavigation;