import React from 'react';
import MainLayout from '../MainLayout';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import CategoriesLayoutContainer from './CategoriesLayout/CategoriesLayout.container';
import CategoriesHeader from '~/JContent/CategoriesRoute/CategoriesHeader';

export const CategoriesRoute = () => (
    <MainLayout header={<CategoriesHeader/>}>
        <LoaderSuspense>
            <ErrorBoundary>
                <CategoriesLayoutContainer/>
            </ErrorBoundary>
        </LoaderSuspense>
    </MainLayout>
);

export default CategoriesRoute;
