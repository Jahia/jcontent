import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';

export const EditContent = ({
    path,
    isFullscreen,
    editCallback,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    const api = useContentEditorApiContext();
    const language = useSelector(state => state.language);
    const res = useNodeChecks({path, language}, otherProps);

    if (Loading && res.loading) {
        return <Loading {...otherProps}/>;
    }

    // For side-by-side, pick a source language that is active and different from the current language, if any
    const languages = res.node?.site?.languages?.filter(l => l.activeInEdit) || [];
    const sourceLang = languages.find(l => l.language !== language) || languages[0];

    return (
        <Render
            {...otherProps}
            isVisible={res.checksResult}
            onClick={() =>
                api.edit({
                    uuid: res.node.uuid,
                    lang: language,
                    isFullscreen,
                    editCallback,
                    sideBySideContext: {lang: sourceLang.language},
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
    isFullscreen: PropTypes.bool,
    editCallback: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentAction = {
    component: EditContent
};
