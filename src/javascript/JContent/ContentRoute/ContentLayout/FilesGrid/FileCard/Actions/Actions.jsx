import React from 'react';
import {iconButtonRenderer} from '@jahia/react-material';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export const Actions = ({className, node}) => (
    <div className={className}>
        <DisplayActions
            target="contentActions"
            filter={value => _.includes(['edit', 'preview'], value.key)}
            path={node.path}
            render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
        />
        <DisplayAction
            actionKey="contentMenu"
            path={node.path}
            menuFilter={value => !_.includes(['edit', 'preview'], value.key)}
            render={iconButtonRenderer({disableRipple: true}, {fontSize: 'small'}, true)}
        />
    </div>
);

Actions.propTypes = {
    className: PropTypes.string,

    node: PropTypes.object.isRequired
};

export default Actions;
