import React, {useContext, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {batchActions} from 'redux-batched-actions';
import {onFilesSelected} from '../ContentRoute/ContentLayout/Upload/Upload.utils';
import {ComponentRendererContext} from '@jahia/ui-extender';

const Upload = ({context, inputRef}) => {
    const dispatch = useDispatch();
    const dispatchBatch = actions => dispatch(batchActions(actions));

    const onChange = e => {
        const path = inputRef.current.getAttribute('context-path');
        onFilesSelected(
            [...e.target.files],
            dispatchBatch,
            {path},
            context.uploadType
        );
    };

    return (
        <input ref={inputRef}
               id={'file-upload-input-' + context.key}
               type="file"
               multiple={context.uploadType !== 'replaceWith'}
               context-path={context.path}
               style={{position: 'fixed', top: -3000, left: -3000}}
               onChange={onChange}
        />
    );
};

Upload.propTypes = {
    inputRef: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired
};

export const FileUploadActionComponent = ({context, render: Render, loading: Loading}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const inputRef = useRef();

    const res = useNodeChecks(
        {path: context.path},
        context
    );

    useEffect(() => {
        componentRenderer.render('upload-' + context.key, Upload, {context, inputRef});
    });

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult;

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                inputRef.current.click();
            }
        }}/>
    );
};

FileUploadActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
