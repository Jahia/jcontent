import React, {useContext} from 'react';
import Export from './Export';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {checkOptions} from '~/JContent/actions/bulkActions/bulkActionComponents';

export const ExportActionComponent = ({path, paths, contentType, exportColumns, exportFileName, defaultFormat, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks({path, paths}, checkOptions(others));

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={() => {
                componentRenderer.render('exportDialog', Export, {
                        isOpen: true,
                        path: paths ? undefined : res.node?.path,
                        paths,
                        contentType,
                        exportColumns,
                        exportFileName,
                        defaultFormat,
                        onClose: () => {
                            componentRenderer.setProperties('exportDialog', {isOpen: false});
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
    paths: PropTypes.arrayOf(PropTypes.string),
    contentType: PropTypes.string,
    exportColumns: PropTypes.arrayOf(PropTypes.string),
    exportFileName: PropTypes.string,
    defaultFormat: PropTypes.string,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
