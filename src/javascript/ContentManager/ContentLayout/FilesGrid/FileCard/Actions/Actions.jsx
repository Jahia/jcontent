import React from 'react';
import {withStyles} from '@material-ui/core';
import {DisplayAction, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import * as _ from 'lodash';

const styles = () => ({
    actionButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        '& button': {
            padding: '8px'
        }
    }
});

export const Actions = ({classes, isHovered, node}) => {
    return isHovered &&
        <div className={classes.actionButtons}>
            <DisplayActions
                target="tableMenuActions"
                filter={value => {
                    return _.includes(['edit', 'preview'], value.key);
                }}
                context={{path: node.path}}
                render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
            />
            <DisplayAction
                actionKey="tableMenuActions"
                context={{path: node.path}}
                render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
            />
        </div>;
};

export default withStyles(styles)(Actions);
