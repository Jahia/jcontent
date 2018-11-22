import {List, ListItem, withStyles, withTheme} from '@material-ui/core';
import {ChevronRight, ExpandMore} from '@material-ui/icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {lodash as _} from 'lodash';
import {translate} from 'react-i18next';
import {DisplayActions} from '@jahia/react-material';
import {compose} from 'react-apollo';

const styles = theme => ({
    root: {
        marginTop: '0px',
        marginLeft: '6px'
    },
    listRoot: {
        paddingTop: '0'
    },
    iconDrawer: {
        color: '#504e4d'
    },
    overList: {
        paddingTop: '4px',
        paddingBottom: '4px'
    },
    clearList: {
        boxShadow: 'none !important',
        textOverflow: 'ellipsis',
        opacity: '0.8',
        fontSize: '0.828rem',
        fontFamily: 'Nunito sans, sans-serif',
        fontWeight: '400',
        background: 'transparent',
        padding: '5px 10px',
        color: theme.palette.background.default

    },
    selectedList: {
        boxShadow: 'none !important',
        fontSize: '0.872rem',
        textAlign: 'center',
        fontFamily: 'Nunito sans, sans-serif',
        fontWeight: '400',
        padding: '5px 10px',
        background: theme.palette.primary.main,
        color: theme.palette.common.white
    },
    triangle: {
        width: 0,
        height: 0,
        padding: 0,
        marginRight: 10,
        borderStyle: 'solid',
        borderWidth: '4px 0 4px 6.5px',
        borderColor: 'transparent transparent transparent #5c6164'
    },
    triangle_bottom: {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '6.5px 4px 0 4px',
        borderColor: '#5c6164 transparent transparent transparent'
    },
    iconTree: {
        fontSize: '15px'
    },
    textPadding: {
        paddingLeft: theme.spacing.unit,
        textAlign: 'left'
    },
    expand: {
        width: '15px'
    }
});

class CmLeftDrawerListItems extends React.Component {
    render() {
        let {context, actionPath, classes, theme, t} = this.props;

        return (
            <DisplayActions target={context.menu} context={{...context.originalContext, parent: context}} render={actionProps => {
                let actionContext = actionProps.context;
                actionContext.actionPath = actionPath + '/' + actionContext.key;
                return (
                    <React.Fragment>
                        <ListItem button
                            className={classes.clearList}
                            classes={{root: classes.overList}}
                            selected={_.includes(_.split(actionPath, '/'), actionContext.actionKey)}
                            style={{
                                paddingLeft: (_.split(actionPath, '/').length) * theme.spacing.unit
                            }}
                            onClick={event => actionContext.onClick(actionContext, event)}
                            >
                            <div className={classes.expand}>
                                {actionContext.hasChildren ?
                                    ((actionContext.open || actionContext.selected) ?
                                        <ExpandMore classes={{root: classes.iconTree}}/> :
                                        <ChevronRight classes={{root: classes.iconTree}}/>
                                    ) :
                                    null
                                }
                            </div>
                            {actionContext.externalIconPath ?
                                <img src={actionContext.externalIconPath}/> :
                                <FontAwesomeIcon className={classes.iconDrawer} icon={actionContext.icon !== null ? actionContext.icon : ['far', 'file']}/>
                            }
                            <div className={classes.textPadding}>
                                {t(actionContext.buttonLabel)}
                            </div>
                        </ListItem>
                        {actionContext.menu && actionContext.open && <CmLeftDrawerListItems context={actionContext} actionPath={actionPath + '/' + actionContext.key} classes={classes} theme={theme} t={t}/>}
                    </React.Fragment>
                );
            }}/>
        );
    }
}

class CmLeftDrawerContent extends React.Component {
    render() {
        let {classes} = this.props;

        return (
            <List className={classes.root} classes={{root: classes.listRoot}}>
                <CmLeftDrawerListItems {...this.props}/>
            </List>
        );
    }
}

export default compose(
    translate(),
    withTheme(),
    withStyles(styles),
)(CmLeftDrawerContent);
