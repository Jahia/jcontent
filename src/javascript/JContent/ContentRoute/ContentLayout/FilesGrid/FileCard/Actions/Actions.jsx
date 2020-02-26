import React from 'react';
import {iconButtonRenderer} from '@jahia/react-material';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export const Actions = ({className, node}) => (
    <div className={className}>
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
    </div>
);

Actions.propTypes = {
    className: PropTypes.string,

    node: PropTypes.object.isRequired
};

export default Actions;
