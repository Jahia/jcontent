import React from 'react';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';

export const ContentRoute = () => (
    <MainLayout header={<ContentHeader/>}>
        <LoaderSuspense>
            <ErrorBoundary>
                <ContentLayout/>
            </ErrorBoundary>
        </LoaderSuspense>
    </MainLayout>
);

export default ContentRoute;
