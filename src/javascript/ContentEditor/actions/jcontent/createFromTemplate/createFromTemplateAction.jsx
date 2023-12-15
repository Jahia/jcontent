import {useContentEditorApiContext} from '~/ContentEditor/contexts';
import {useSelector} from 'react-redux';
import React from 'react';
import * as PropTypes from 'prop-types';

export const CreateFromTemplate = ({content, render: Render, ...props}) => {
    const api = useContentEditorApiContext();
    const mainPath = useSelector(state => state.jcontent.path);
    const language = useSelector(state => state.language);

    const path = content.parent.startsWith('/') ? content.parent : (mainPath + '/' + content.parent);

    const create = {
        path,
        name: content.name,
        lang: language,
        nodeTypes: [content.nodeType],
        includeSubTypes: false,
        defaultValues: {...content.properties, ...content.i18nProperties?.[language]}
    };

    return (
        <Render
            {...props}
            onClick={() => {
                api.create(create);
            }}
        />
    );
};

CreateFromTemplate.propTypes = {
    content: PropTypes.object,
    render: PropTypes.func.isRequired
};

export const createFromTemplateAction = {
    component: CreateFromTemplate
};
