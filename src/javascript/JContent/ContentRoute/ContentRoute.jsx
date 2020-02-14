import React from 'react';
import {FullWidthContent} from '@jahia/design-system-kit';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from './ContentHeader';
import SearchBar from './SearchBar';
import ToolBar from './ToolBar';
import Breadcrumb from './Breadcrumb';
import ContentTitle from './ContentTitle';

const ContentRoute = () => {
    return (
        <MainLayout
            header={
                <ContentHeader
                    title={<ContentTitle/>}
                    mainAction={<SearchBar/>}
                    breadcrumb={<Breadcrumb/>}
                    toolbar={<ToolBar/>}
                />
            }
        >
            <FullWidthContent>
                <ContentLayout/>
            </FullWidthContent>
        </MainLayout>
    );
};

export default ContentRoute;
