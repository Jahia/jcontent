import React from 'react';
import {useSelector} from 'react-redux';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from './ContentHeader';
import ToolBar from './ToolBar';
import ContentBreadcrumb from './ContentBreadcrumb';
import ContentTitle from './ContentTitle';
import ContentSearchTitle from './ContentSearchTitle';
import ContentStatuses from './ContentStatuses';
import {MainActionBar} from './MainActionBar';
import JContentConstants from '../JContent.constants';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {EditFrame} from './ContentLayout/EditFrame/EditFrame';

const ContentRoute = () => {
    const {mode, pagesMode} = useSelector(state => ({
        mode: state.jcontent.mode,
        pagesMode: state.jcontent.pagesMode
    }));

    const inSearchMode = JContentConstants.mode.SEARCH === mode || JContentConstants.mode.SQL2SEARCH === mode;
    const inEditMode = JContentConstants.mode.PAGES === mode && JContentConstants.pagesMode.VIEW === pagesMode;
    return (
        <MainLayout
            header={
                <ContentHeader
                    title={inSearchMode ? <ContentSearchTitle/> : <ContentTitle/>}
                    mainAction={!inSearchMode && <MainActionBar/>}
                    breadcrumb={!inSearchMode && <ContentBreadcrumb/>}
                    information={!inSearchMode && <ContentStatuses/>}
                    toolbar={<ToolBar/>}
                />
            }
        >
            <LoaderSuspense>
                <ErrorBoundary>
                    { mode.length > 0 && inEditMode ? <EditFrame/> : <ContentLayout/> }
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
