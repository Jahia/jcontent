import React from 'react';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import * as _ from 'lodash';
import PropTypes from 'prop-types';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';

export const Actions = ({className, node}) => (
    <div className={className}>
        <DisplayActions
            target="contentActions"
            filter={value => _.includes(['edit', 'preview'], value.key)}
            path={node.path}
            render={ButtonRendererNoLabel}
            buttonProps={{variant: 'ghost', size: 'big'}}
        />
        <DisplayAction
            actionKey="contentMenu"
            path={node.path}
            menuFilter={value => !_.includes(['edit', 'preview'], value.key)}
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
