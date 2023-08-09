import React from 'react';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {UsagesTable} from '~/UsagesTable';

export const Usages = () => {
    const {nodeData} = useContentEditorContext();
    const {lang} = useContentEditorConfigContext();

    return <UsagesTable path={nodeData.path} language={lang}/>;
};
