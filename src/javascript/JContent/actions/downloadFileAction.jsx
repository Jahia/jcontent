import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';

export const DownloadActionComponent = ({context, render: Render, loading: Loading}) => {
    const res = useNodeChecks({path: context.path}, context);

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    if (!res.node && !res.nodes) {
        return false;
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

DownloadActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

const downloadAction = {
    component: DownloadActionComponent
};

export default downloadAction;
