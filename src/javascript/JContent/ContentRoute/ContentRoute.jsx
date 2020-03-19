import React from 'react';
import {useSelector} from 'react-redux';
import {FullWidthContent} from '@jahia/design-system-kit';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from './ContentHeader';
import ToolBar from './ToolBar';
import Breadcrumb from './ContentBreadcrumb';
import ContentTitle from './ContentTitle';
import ContentStatuses from './ContentStatuses';
import {MainActionBar} from './MainActionBar';

const ContentRoute = () => {
    const mode = useSelector(state => state.jcontent.mode);

    return (
        <MainLayout
            header={
                <ContentHeader
                    title={<ContentTitle/>}
                    mainAction={<MainActionBar/>}
                    breadcrumb={<Breadcrumb/>}
                    toolbar={<ToolBar/>}
                    information={<ContentStatuses/>}
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
