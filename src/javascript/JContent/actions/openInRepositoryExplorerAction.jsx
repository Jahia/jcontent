import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';

export const OpenInRepositoryExplorerActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks({path}, {
        showOnNodeTypes: ['nt:base'],
        requiredPermission: 'repositoryExplorer'
    });
    if (res.loading && Loading) {
        return <Loading {...others}/>;
    }

    if (!res.node) {
        return (<Render {...others} isVisible={false}/>);
    }

    const encodedPath = encodeURIComponent(path);
    const url = `${window.contextJsParameters.contextPath}/jahia/repository-explorer?site=${res.node?.site?.uuid}&selectedPaths=${encodedPath}`;

    return (
        <Render {...others}
                isVisible={res.checksResult}
                enabled={res.checksResult}
                onClick={() => {
                    window.open(url);
                }}
        />
    );
};

OpenInRepositoryExplorerActionComponent.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
