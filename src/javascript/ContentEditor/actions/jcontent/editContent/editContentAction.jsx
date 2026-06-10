import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {isDefinitelyHidden} from '~/JContent/actions/utils/nodeVisibilityUtils';

export const EditContent = ({
    path,
    node: prefetchedNode,
    isFullscreen,
    editCallback,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    useTranslation('jcontent');
    const api = useContentEditorApiContext();
    const language = useSelector(state => state.language);

    // Only use hideOnNodeTypes for pre-gate — showOnNodeTypes is skipped (subtype risk)
    const skip = isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes: otherProps.hideOnNodeTypes});

    const res = useNodeChecks(
        {path: path, language: language},
        {skip, ...otherProps}
    );

    if (Loading && res.loading) {
        return <Loading {...otherProps}/>;
    }

    if (skip) {
        return false;
    }

    return (
        <Render {...otherProps}
                isVisible={res.checksResult}
                onClick={() => api.edit({
                    uuid: res.node.uuid,
                    lang: language,
                    isFullscreen,
                    editCallback,
                    ...otherProps.editConfig
                })}
        />
    );
};

EditContent.defaultProps = {
    loading: undefined,
    isFullscreen: false,
    editCallback: undefined
};

EditContent.propTypes = {
    path: PropTypes.string.isRequired,
    node: PropTypes.object,
    isFullscreen: PropTypes.bool,
    editCallback: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentAction = {
    component: EditContent
};
