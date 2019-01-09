import React from 'react';
import {withStyles} from '@material-ui/core';
import {DisplayActions, iconButtonRenderer} from '@jahia/react-material';

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
            <DisplayActions target="tableActions"
                            context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}/>
        </div>;
};

export default withStyles(styles)(Actions);
