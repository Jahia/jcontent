import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';

export const DownloadFileActionComponent = ({context, render: Render, loading: Loading}) => {
    const res = useNodeChecks({path: context.path}, {showOnNodeTypes: ['jnt:file']});

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult;

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                let a = document.createElement('a');
                a.setAttribute('title', 'download');
                a.setAttribute('href', window.contextJsParameters.contextPath + '/files/' + (context.previewMode === 'edit' ? 'default' : 'live') + context.originalContext.path);
                a.setAttribute('download', context.originalContext.path.split('/').pop());
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }}/>
    );
};

DownloadFileActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
