import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {cmGoto, cmOpenPaths, setTableViewMode} from '~/JContent/redux/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {batchActions} from 'redux-batched-actions';
import {expandTree} from '~/JContent/JContent.utils';
import {useApolloClient} from '@apollo/client';
import {isDefinitelyHidden} from './utils/nodeVisibilityUtils';
export const OpenInPageBuilderActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {mode, viewMode} = useSelector(state => ({mode: state.jcontent.mode, viewMode: state.jcontent.tableView.viewMode}), shallowEqual);
    const isSearch = (mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH);
    const isPageBuilderMode = (viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER);

    const showOnNodeTypes = ['jmix:mainResource'];
    const skip = !isPageBuilderMode && isDefinitelyHidden(prefetchedNode, {showOnNodeTypes});

    const res = useNodeChecks(isPageBuilderMode ? {} : {path}, {
        skip,
        showOnNodeTypes
    });
    if (res.loading && Loading) {
        return <Loading {...others}/>;
    }

    if (skip || !res.node) {
        return (<Render {...others} isVisible={false}/>);
    }

    return (
        <Render {...others}
                isVisible={res.checksResult}
                enabled={res.checksResult}
                onClick={() => {
                    if (isSearch) {
                        expandTree({path}, client).then(({mode, ancestorPaths, site}) => {
                            dispatch(batchActions([
                                cmGoto({mode: mode, path, site}),
                                setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER),
                                cmOpenPaths(ancestorPaths)
                            ]));
                        });
                    } else {
                        dispatch(batchActions([
                            cmGoto({path}),
                            setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER)
                        ]));
                    }
                }}
        />
    );
};

OpenInPageBuilderActionComponent.propTypes = {
    path: PropTypes.string.isRequired,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
