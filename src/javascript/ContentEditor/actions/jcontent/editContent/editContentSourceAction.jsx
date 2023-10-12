import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useContentEditorApiContext} from '~/ContentEditor/contexts';

export const EditContentSource = ({
    path,
    isFullscreen,
    editCallback,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    useTranslation('jcontent');
    const api = useContentEditorApiContext();
    const language = useSelector(state => state.language);
    const res = useNodeChecks(
        {path: path, language: language},
        {getProperties: ['j:node'], ...otherProps, showOnNodeTypes: ['jmix:nodeReference'], hideOnNodeTypes: []}
    );

    const refUuid = res.node && res.node.properties.find(p => p.name === 'j:node')?.value;

    const res2 = useNodeChecks(
        {uuid: refUuid, language: language},
        {...otherProps},
        {skip: !refUuid}
    );

    if (Loading && (res.loading || res2.loading)) {
        return <Loading {...otherProps}/>;
    }

    if (!refUuid) {
        return false;
    }

    return (
        <Render {...otherProps}
                isVisible={res.checksResult && res2.checksResult}
                onClick={() => api.edit({
                    uuid: refUuid,
                    lang: language,
                    isFullscreen,
                    editCallback,
                    ...otherProps.editConfig
                })}
        />
    );
};

EditContentSource.defaultProps = {
    loading: undefined,
    isFullscreen: false,
    editCallback: undefined
};

EditContentSource.propTypes = {
    path: PropTypes.string.isRequired,
    isFullscreen: PropTypes.bool,
    editCallback: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentSourceAction = {
    component: EditContentSource
};
