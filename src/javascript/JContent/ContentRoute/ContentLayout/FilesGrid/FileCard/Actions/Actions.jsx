import React from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';

export const Actions = ({className, node}) => (
    <div className={className}>
        <DisplayAction
            actionKey="contentMenu"
            path={node.path}
            render={ButtonRendererNoLabel}
            buttonProps={{variant: 'ghost', size: 'big'}}
        />
    </div>
);

Actions.propTypes = {
    className: PropTypes.string,
    node: PropTypes.object.isRequired
};

export default Actions;
