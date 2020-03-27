import React from 'react';
import {useSelector} from 'react-redux';
import {FullWidthContent} from '@jahia/design-system-kit';
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

const ContentRoute = () => {
    const {mode} = useSelector(state => ({
        mode: state.jcontent.mode
    }));

    const inSearchMode = JContentConstants.mode.SEARCH === mode || JContentConstants.mode.SQL2SEARCH === mode;

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
            <FullWidthContent>
                { mode.length > 0 && <ContentLayout/> }
            </FullWidthContent>
        </MainLayout>
    );
};

export default ContentRoute;
