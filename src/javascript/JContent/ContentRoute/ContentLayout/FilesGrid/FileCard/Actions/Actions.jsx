import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';

export const Actions = ({className, node, action}) => (
    <div className={className}>
        <DisplayAction
            actionKey={action}
            path={node.path}
            uuid={node.uuid}
            render={ButtonRendererNoLabel}
            buttonProps={{variant: 'ghost', size: 'big'}}
        />
    </div>
);

Actions.propTypes = {
    className: PropTypes.string,
    node: PropTypes.object.isRequired,
    action: PropTypes.string.isRequired
};

export default Actions;
