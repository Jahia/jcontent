import React from 'react';
import {useSelector} from 'react-redux';
import {FullWidthContent} from '@jahia/design-system-kit';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from './ContentHeader';
import SearchBar from './SearchBar';
import ToolBar from './ToolBar';
import Breadcrumb from './Breadcrumb';
import ContentTitle from './ContentTitle';

const ContentRoute = () => {
    const mode = useSelector(state => state.jcontent.mode);

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
                { mode.length > 0 && <ContentLayout/> }
            </FullWidthContent>
        </MainLayout>
    );
};

export default ContentRoute;
