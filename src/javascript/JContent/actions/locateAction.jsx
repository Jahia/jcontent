import {cmGoto, cmOpenPaths} from '../JContent.redux';
import {expandTree} from './expandTree';
import {cmSetPreviewSelection} from '../preview.redux';
import JContentConstants from '../JContent.constants';
import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {useApolloClient} from '@apollo/react-hooks';
import {useDispatch, useSelector} from 'react-redux';

export const LocateActionComponent = ({context, render: Render, loading: Loading}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const mode = useSelector(state => state.jcontent.mode);

    const res = useNodeChecks({path: context.path}, context);

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult && (mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH);

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                expandTree(context.path, client).then(({mode, ancestorPaths}) => {
                    dispatch(cmGoto({mode: mode, path: ancestorPaths[ancestorPaths.length - 1]}));
                    dispatch(cmOpenPaths(ancestorPaths));
                    dispatch(cmSetPreviewSelection(context.path));
                });
            }
        }}/>
    );
};

LocateActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
