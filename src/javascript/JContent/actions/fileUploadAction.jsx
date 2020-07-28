import React, {useContext, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {batchActions} from 'redux-batched-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';

let currentUploadHandler = null;

const Upload = React.memo(({actionKey, uploadType}) => (
    <input id={'file-upload-input-' + actionKey}
           type="file"
           multiple={uploadType !== 'replaceWith'}
           style={{position: 'fixed', top: -3000, left: -3000}}
           onChange={e => currentUploadHandler && currentUploadHandler(e.target.files)}
    />
));

Upload.displayName = 'Upload';

Upload.propTypes = {
    actionKey: PropTypes.string.isRequired,
    uploadType: PropTypes.string
};

const constraintsByType = {
    upload: {
        showOnNodeTypes: ['jnt:folder'],
        requiredPermission: 'jcr:addChildNodes'
    },
    replaceWith: {
        showOnNodeTypes: ['jnt:file'],
        requiredPermission: 'jcr:write'
    },
    import: {
        showOnNodeTypes: ['jnt:contentFolder'],
        requiredPermission: 'jcr:addChildNodes'
    }
};

export const FileUploadActionComponent = ({key, path, uploadType, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const dispatch = useDispatch();
    const dispatchBatch = actions => dispatch(batchActions(actions));

    const res = useNodeChecks(
        {path},
        {
            ...constraintsByType[uploadType || 'upload']
        }
    );

    useEffect(() => {
        componentRenderer.render('upload-' + key, Upload, {actionKey: key, uploadType});
    }, [key, componentRenderer]);

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const handleClick = () => {
        currentUploadHandler = files => {
            onFilesSelected(
                [...files],
                dispatchBatch,
                {path},
                uploadType
            );
        };

        document.getElementById('file-upload-input-' + key).click();
    };

    const isVisible = res.checksResult;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={handleClick}
        />
    );
};

FileUploadActionComponent.propTypes = {
    key: PropTypes.string,

    path: PropTypes.string,

    uploadType: PropTypes.string,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
