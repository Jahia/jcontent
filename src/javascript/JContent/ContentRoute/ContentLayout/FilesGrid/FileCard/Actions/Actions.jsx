import React from 'react';
import {withStyles} from '@material-ui/core';
import {iconButtonRenderer} from '@jahia/react-material';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

const styles = () => ({
    actionButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        '& button': {
            padding: '8px',
            margin: '0px'
        }
    }
});

export const Actions = ({classes, isHovered, node}) => {
    return isHovered &&
        <div className={classes.actionButtons}>
            <DisplayActions
                target="contentActions"
                filter={value => {
                    return _.includes(['edit', 'preview'], value.key);
                }}
                context={{path: node.path}}
                render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
            />
            <DisplayAction
                actionKey="contentMenu"
                context={{
                    path: node.path,
                    menuFilter: value => {
                        return !_.includes(['edit', 'preview'], value.key);
                    }
                }}
                render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
            />
        </div>;
};

Actions.propTypes = {
    classes: PropTypes.object.isRequired,

    isHovered: PropTypes.bool.isRequired,

    node: PropTypes.object.isRequired
};

export default withStyles(styles)(Actions);
