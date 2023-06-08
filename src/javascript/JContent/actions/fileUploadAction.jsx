import React, {useContext, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {batchActions} from 'redux-batched-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {ACTION_PERMISSIONS} from './actions.constants';

const Upload = React.memo(({actionKey, uploadType, uploadHandler}) => {
    const inputRef = useRef();
    return (
        <input ref={inputRef}
               id={'file-upload-input-' + actionKey}
               type="file"
               multiple={uploadType !== 'replaceWith'}
               style={{position: 'fixed', top: -3000, left: -3000}}
               onInput={e => {
                   if (uploadHandler) {
                       uploadHandler(e.target.files);
                   }

                   inputRef.current.value = '';
               }}
        />
    );
});

Upload.displayName = 'Upload';

Upload.propTypes = {
    actionKey: PropTypes.string.isRequired,
    uploadType: PropTypes.string,
    uploadHandler: PropTypes.func.isRequired
};

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
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:category'],
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
    const {id, path, uploadType, render: Render, loading: Loading} = props;
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
        const uploadHandler = files => {
            onFilesSelected({
                acceptedFiles: [...files].map(file => ({file, path})),
                dispatchBatch,
                type: uploadType
            });
        };

        componentRenderer.render('upload-' + id, Upload, {actionKey: id, uploadType, uploadHandler});
    }, [id, componentRenderer, uploadType, dispatchBatch, path]);

    if (res.loading) {
        return (Loading && <Loading {...props}/>) || false;
    }

    const handleClick = () => {
        document.getElementById('file-upload-input-' + id).click();
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
    id: PropTypes.string,

    path: PropTypes.string,

    uploadType: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
