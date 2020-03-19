import React from 'react';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

import ContentType from './ContentType';

const ContentTypeContainer = () => {
    const {path, displayLanguage} = useSelector(state => ({
        path: state.jcontent.path,
        displayLanguage: state.uilang
    }));

    const {node} = useNodeInfo({path, displayLanguage}, {getPrimaryNodeType: true});
    const nodeType = node?.primaryNodeType || {};

    return <ContentType name={nodeType.name} displayName={nodeType.displayName}/>;
};

export default ContentTypeContainer;
