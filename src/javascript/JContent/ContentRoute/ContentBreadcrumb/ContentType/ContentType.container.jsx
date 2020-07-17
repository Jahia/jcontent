import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

import ContentType from './ContentType';

const ContentTypeContainer = ({externalPath}) => {
    const {path, displayLanguage} = useSelector(state => ({
        path: state.jcontent.path,
        displayLanguage: state.uilang
    }));

    const {node} = useNodeInfo({path: externalPath || path, displayLanguage}, {getPrimaryNodeType: true});
    const nodeType = node?.primaryNodeType;

    return nodeType ? <ContentType name={nodeType.name} displayName={nodeType.displayName}/> : null;
};

ContentTypeContainer.defaultProps = {
    externalPath: ''
};

ContentTypeContainer.propTypes = {
    externalPath: PropTypes.string
};

export default ContentTypeContainer;
