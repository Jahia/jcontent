import React, {useContext, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {batchActions} from 'redux-batched-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {ACTION_PERMISSIONS} from './actions.constants';
import {isDefinitelyHidden} from './utils/nodeVisibilityUtils';

const Upload = React.memo(() => (
    <input id="file-upload-input"
           type="file"
           style={{position: 'fixed', top: -3000, left: -3000}}
    />
));

Upload.displayName = 'Upload';

const constraintsByType = {
    upload: {
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes'
    },
    replaceWith: {
        showOnNodeTypes: ['jnt:file'],
        requiredPermission: ['jcr:write'],
        requiredSitePermission: [ACTION_PERMISSIONS.replaceWithAction]
    },
    import: {
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:category', 'jnt:page', 'jnt:area', 'jmix:list', 'jnt:navMenuText', 'jmix:droppableContent'],
        hideOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes',
        requiredSitePermission: [ACTION_PERMISSIONS.importAction],
        getChildNodeTypes: true
    },
    fileUpload: {
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: ['jcr:addChildNodes'],
        requiredSitePermission: [ACTION_PERMISSIONS.uploadFilesAction]
    }
};

export const FileUploadActionComponent = props => {
    const {path, uploadType, node: prefetchedNode, render: Render, loading: Loading} = props;
    const componentRenderer = useContext(ComponentRendererContext);
    const dispatch = useDispatch();
    const dispatchBatch = actions => dispatch(batchActions(actions));

    const constraints = constraintsByType[uploadType || 'upload'];
    // Skip for upload/fileUpload/replaceWith (jnt:folder, jnt:file are leaf types — safe for exact match)
    // Do not skip for 'import' (showOnNodeTypes includes jnt:page, jnt:contentFolder which have subtypes)
    const skip = uploadType !== 'import' && isDefinitelyHidden(prefetchedNode, {
        showOnNodeTypes: constraints.showOnNodeTypes,
        hideOnNodeTypes: constraints.hideOnNodeTypes
    });

    const res = useNodeChecks(
        {path},
        {
            skip,
            ...constraints,
            getLockInfo: true
        }
    );

    useEffect(() => {
        if (!document.getElementById('file-upload-input')) {
            componentRenderer.render('upload', Upload);
        }
    }, [componentRenderer]);

    if (res.loading) {
        return (Loading && <Loading {...props}/>) || false;
    }

    if (skip) {
        return false;
    }

    const handleClick = () => {
        const elementById = document.getElementById('file-upload-input');

        if (uploadType === 'replaceWith') {
            elementById.removeAttribute('multiple');
        } else {
            elementById.setAttribute('multiple', 'true');
        }

        elementById.oninput = e => {
            onFilesSelected({
                acceptedFiles: [...e.target.files].map(file => ({file, path})),
                dispatchBatch,
                type: uploadType
            });
            elementById.value = '';
        };

        elementById.click();
    };

    // Import targets a container: in addition to the permission/type checks, the node must actually
    // accept child content. This excludes droppable *leaf* content (jmix:droppableContent without
    // allowed child node types), mirroring the container check used by the paste action.
    const acceptsChildren = res.node?.allowedChildNodeTypes?.length > 0;
    const isVisible = res.checksResult && (uploadType !== 'import' || acceptsChildren);

    return (
        <Render
            {...props}
            isVisible={isVisible}
            enabled={isVisible && !res.node?.lockOwner}
            onClick={handleClick}
        />
    );
};

FileUploadActionComponent.propTypes = {
    path: PropTypes.string,

    uploadType: PropTypes.string,

    node: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
