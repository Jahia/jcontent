import {List, ListItem, Typography, withStyles} from '@material-ui/core';
import {ChevronRight, ExpandMore} from '@material-ui/icons';
import React from 'react';
import {lodash as _} from 'lodash';
import {translate} from 'react-i18next';
import {DisplayActions, toIconComponent} from '@jahia/react-material';
import {compose} from 'react-apollo';

const styles = theme => ({
    expand: {
        width: (theme.spacing.unit * 3) + 'px'
    },
    nested: {
        paddingLeft: theme.spacing.unit
    }
});

class CmLeftDrawerListItems extends React.Component {
    render() {
        let {context, actionPath, classes, t} = this.props;

        return (
            <DisplayActions target={context.menu}
                            context={{...context.originalContext, parent: context}}
                            render={actionProps => {
                let actionContext = actionProps.context;
                let icon = actionContext.buttonIcon;
                actionContext.actionPath = actionPath + '/' + actionContext.key;
                icon = toIconComponent(icon, {fontSize: 'small'});

                return (
                    <React.Fragment>
                        <ListItem button selected={_.includes(_.split(actionPath, '/'), actionContext.actionKey)} onClick={event => actionContext.onClick(actionContext, event)}>
                            <div className={classes.expand}>
                                {actionContext.hasChildren ?
                                    ((actionContext.open || actionContext.selected) ?
                                        <ExpandMore fontSize="small"/> :
                                        <ChevronRight fontSize="small"/>
                                    ) :
                                    null
                                }
                            </div>
                            {icon}
                            <Typography>
                                {t(actionContext.buttonLabel)}
                            </Typography>
                        </ListItem>
                        <List disablePadding classes={{root: classes.nested}}>
                            {actionContext.menu && actionContext.open && <CmLeftDrawerListItems context={actionContext} actionPath={actionPath + '/' + actionContext.key} classes={classes} t={t}/>}
                        </List>
                    </React.Fragment>
                );
            }}/>
        );
    }
}

class CmLeftDrawerContent extends React.Component {
    render() {
        return (
            <List>
                <CmLeftDrawerListItems {...this.props}/>
            </List>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles),
)(CmLeftDrawerContent);
