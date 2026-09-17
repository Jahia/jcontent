import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {hasMixin} from '~/JContent/JContent.utils';
import PropTypes from 'prop-types';
import React from 'react';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';

export const DownloadAsZipActionComponent = ({path, paths, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const {language, displayLanguage} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang
    }), shallowEqual);

    const showOnNodeTypes = ['jnt:file', 'jnt:folder'];
    const skip = !paths && isDefinitelyHidden(prefetchedNode, {
        showOnNodeTypes,
        hideMixins: ['jmix:markedForDeletionRoot']
    });

    const res = useNodeChecks(
        {path, paths, language, displayLanguage},
        {
            skip,
            getPrimaryNodeType: true,
            getDisplayName: true,
            getParent: true,
            getProperties: ['jcr:mixinTypes'],
            showOnNodeTypes
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isNodeMarkedForDeletionFn = node => hasMixin(node, 'jmix:markedForDeletionRoot');
    const isVisible = res.checksResult &&
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

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
