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

export class LeftDrawerListItems extends React.Component {
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
                                            &nbsp;
                                            <Typography color="textPrimary">
                                                {t(actionContext.buttonLabel)}
                                            </Typography>
                                        </ListItem>
                                        <List disablePadding classes={{root: classes.nested}}>
                                            {actionContext.menu && actionContext.open && <LeftDrawerListItems context={actionContext} actionPath={actionPath + '/' + actionContext.key} classes={classes} t={t}/>}
                                        </List>
                                    </React.Fragment>
                                );
                            }}/>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles),
)(LeftDrawerListItems);
