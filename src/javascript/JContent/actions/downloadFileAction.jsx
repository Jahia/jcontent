import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';

export const DownloadFileActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks({path}, {showOnNodeTypes: ['jnt:file']});

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                let a = document.createElement('a');
                a.setAttribute('title', 'download');
                a.setAttribute('href', window.contextJsParameters.contextPath + '/files/' + window.contextJsParameters.workspace + path);
                a.setAttribute('download', path.split('/').pop());
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }}
        />
    );
};

DownloadFileActionComponent.propTypes = {
    path: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
