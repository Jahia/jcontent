import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';

export const OpenInJContentActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);
    const res = useNodeChecks(
        {path},
        {
            requiredPermission: ['jContentAccess']
        }
    );

    if (res.loading && Loading) {
        return <Loading {...others}/>;
    }

    if (!res.node) {
        return false;
    }

    const matchArray = path.match(/\/sites\/([^/]+)\/(.*)/);
    if (!matchArray) {
        return false;
    }

    return (
        <Render {...others}
                isVisible={res.checksResult}
                enabled={res.checksResult}
                onClick={() => {
                    const params = {folderNode: res.node};
                    const acc = registry.find({type: 'accordionItem', target: 'jcontent'}).find(acc => acc.canDisplayItem && acc.canDisplayItem(params));
                    const mode = acc.key;
                    window.open(`${window.contextJsParameters.contextPath}/jahia/jcontent/${matchArray[1]}/${language}/${mode}/${matchArray[2]}`, '_blank');
                }}
        />
    );
};

OpenInJContentActionComponent.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
