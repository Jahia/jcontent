import React from 'react';
import {useSelector} from 'react-redux';
import ContentRoute from '../ContentRoute';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import JContentConstants from '../JContent.constants';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {EditFrame} from './EditFrame';
import {useNodeInfo} from '@jahia/data-helper';

export const PageComposerRoute = () => {
    const viewMode = useSelector(state => state.jcontent.tableView.viewMode);

    const path = useSelector(state => state.jcontent.path);
    const nodeTypes = ['jnt:page', 'jmix:mainResource'];
    const res = useNodeInfo({path}, {getIsNodeTypes: nodeTypes});

    if (res.loading) {
        return false;
    }

    const pageComposer = nodeTypes.some(nt => res.node[nt]) &&
        (JContentConstants.tableView.viewMode.PAGE_COMPOSER === viewMode || JContentConstants.tableView.viewMode.PREVIEW === viewMode);

    if (pageComposer) {
        return (
            <MainLayout header={<ContentHeader/>}>
                <LoaderSuspense>
                    <ErrorBoundary>
                        <EditFrame isPreview={JContentConstants.tableView.viewMode.PREVIEW === viewMode}/>
                    </ErrorBoundary>
                </LoaderSuspense>
            </MainLayout>
        );
    }

    return <ContentRoute/>;
};

export default PageComposerRoute;
