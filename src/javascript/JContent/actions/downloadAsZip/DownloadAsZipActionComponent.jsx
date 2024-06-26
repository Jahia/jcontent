import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {hasMixin} from '~/JContent/JContent.utils';
import PropTypes from 'prop-types';
import React from 'react';
import {compareVersions} from 'compare-versions';

export const DownloadAsZipActionComponent = ({path, paths, render: Render, loading: Loading, ...others}) => {
    const {language, displayLanguage} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang
    }), shallowEqual);
    const res = useNodeChecks(
        {path, paths, language, displayLanguage},
        {
            getPrimaryNodeType: true,
            getDisplayName: true,
            getParent: true,
            getProperties: ['jcr:mixinTypes'],
            showOnNodeTypes: ['jnt:file', 'jnt:folder']
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    // This action is only available for Jahia 8.1.3.0 or higher.
    // Currently parent version is 8.0.2.0, please remove that check once the requirement higher than 8.1.3.0
    const isNodeMarkedForDeletionFn = node => hasMixin(node, 'jmix:markedForDeletionRoot');
    const isVisible = compareVersions(window.contextJsParameters.dxVersion, '8.1.3.0') >= 0 &&
        res.checksResult &&
        (res.node ? !isNodeMarkedForDeletionFn(res.node) : !res.nodes?.some(isNodeMarkedForDeletionFn));
    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                const nodes = res.node ? [res.node] : res.nodes;
                const filesToZip = `${btoa(unescape(encodeURIComponent(JSON.stringify(nodes.map(node => node.path)))))}`;
                const zipPath = `${res.node ? res.node.path : res.nodes[0].parent.path}.zip`;
                window.open(`${window.contextJsParameters.contextPath}/cms/export/default${zipPath}?filesToZip=${nodes.length === 1 ? '' : filesToZip}`);
            }}
        />
    );
};

DownloadAsZipActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
