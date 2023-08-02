import React, {useContext, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {batchActions} from 'redux-batched-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {ACTION_PERMISSIONS} from './actions.constants';

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
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:category', 'jnt:page', 'jnt:area', 'jmix:list'],
        hideOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes',
        requiredSitePermission: [ACTION_PERMISSIONS.importAction]
    },
    fileUpload: {
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: ['jcr:addChildNodes'],
        requiredSitePermission: [ACTION_PERMISSIONS.uploadFilesAction]
    }
};

export const FileUploadActionComponent = props => {
    const {path, uploadType, render: Render, loading: Loading} = props;
    const componentRenderer = useContext(ComponentRendererContext);
    const dispatch = useDispatch();
    const dispatchBatch = actions => dispatch(batchActions(actions));

    const res = useNodeChecks(
        {path},
        {
            ...constraintsByType[uploadType || 'upload'],
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

    const isVisible = res.checksResult;

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

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
