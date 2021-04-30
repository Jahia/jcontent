import {useDispatch, useSelector} from 'react-redux';
import {useApolloClient} from '@apollo/react-hooks';
import {useNodeChecks} from '@jahia/data-helper';
import copyPasteConstants from './copyPaste.constants';
import {hasMixin} from '../../JContent.utils';
import {setLocalStorage} from './localStorageHandler';
import {copypasteCopy, copypasteCut} from './copyPaste.redux';
import PropTypes from 'prop-types';
import React from 'react';
import {
    PATH_CONTENTS_ITSELF,
    PATH_FILES_ITSELF
} from '../actions.constants';

export const CopyCutActionComponent = ({path, paths, copyCutType, render: Render, loading: Loading, ...others}) => {
    const {language, displayLanguage} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang
    }));
    const client = useApolloClient();
    const dispatch = useDispatch();

    const type = copyCutType || copyPasteConstants.COPY;

    const res = useNodeChecks(
        {path, paths, language, displayLanguage},
        {
            getPrimaryNodeType: true,
            getDisplayName: true,
            requiredPermission: type === copyPasteConstants.COPY ? ['jcr:read'] : ['jcr:removeNode'],
            requiredSitePermission: type === copyPasteConstants.COPY ? ['copyAction'] : ['cutAction'],
            getProperties: ['jcr:mixinTypes'],
            hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page', 'jnt:navMenuText'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.checksResult && (res.node ? !hasMixin(res.node, 'jmix:markedForDeletionRoot') : res.nodes.reduce((acc, node) => acc && !hasMixin(node, 'jmix:markedForDeletionRoot'), true));

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                let nodes = res.node ? [res.node] : res.nodes;
                setLocalStorage(type, nodes, client);
                dispatch(type === 'copy' ? copypasteCopy(nodes) : copypasteCut(nodes));
            }}
        />
    );
};

CopyCutActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    copyCutType: PropTypes.oneOf([copyPasteConstants.COPY, copyPasteConstants.CUT]),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
