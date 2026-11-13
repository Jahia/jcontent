import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';

export const Actions = ({className, node, action}) => (
    // Stop propagation so that opening the menu does not toggle the card selection (same as table rows)
    <div className={className} onClick={e => e.stopPropagation()}>
        <DisplayAction
            actionKey={action}
            path={node.path}
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
