import React, {useContext} from 'react';
import Export from './Export';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const ExportActionComponent = ({context, render: Render, loading: Loading}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path: context.path},
        {showOnNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:content']}
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    return (
        <Render context={{
            ...context,
            isVisible: res.checksResult,
            onClick: () => {
                componentRenderer.render('exportDialog', Export, {
                        open: true,
                        path: res.node.path,
                        onClose: () => {
                            componentRenderer.setProperties('exportDialog', {open: false});
                        },
                        onExited: () => {
                            componentRenderer.destroy('exportDialog');
                        }
                    }
                );
            }
        }}/>
    );
};

ExportActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
