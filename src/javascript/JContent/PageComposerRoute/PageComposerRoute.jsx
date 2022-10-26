import React from 'react';
import {useSelector} from 'react-redux';
import ContentRoute from '../ContentRoute';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import JContentConstants from '../JContent.constants';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {EditFrame} from './EditFrame';

export const PageComposerRoute = () => {
    const viewMode = useSelector(state => state.jcontent.tableView.viewMode);

    if (JContentConstants.tableView.viewMode.PAGE_COMPOSER === viewMode || JContentConstants.tableView.viewMode.PREVIEW === viewMode) {
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
