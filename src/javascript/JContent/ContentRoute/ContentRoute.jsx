import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from './ContentHeader';
import JContentConstants from '../JContent.constants';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {EditFrame} from './ContentLayout/EditFrame/EditFrame';

const ContentRoute = () => {
    const {mode, viewMode} = useSelector(state => ({
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode
    }), shallowEqual);

    const inEditMode = JContentConstants.mode.PAGES === mode && (JContentConstants.tableView.viewType.VIEW === viewMode || JContentConstants.tableView.viewType.VIEW_DEVICE === viewMode);
    return (
        <MainLayout
            header={<ContentHeader/>}
        >
            <LoaderSuspense>
                <ErrorBoundary>
                    { mode.length > 0 && inEditMode ? <EditFrame isDeviceView={JContentConstants.tableView.viewType.VIEW_DEVICE === viewMode}/> : <ContentLayout/> }
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
