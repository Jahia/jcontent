import React, {useContext} from 'react';
import Export from './Export';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const ExportActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path},
        {showOnNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:content']}
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
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
            }}
        />
    );
};

ExportActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
