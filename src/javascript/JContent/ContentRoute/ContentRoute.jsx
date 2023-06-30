import React from 'react';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import {ErrorBoundary, Error404, LoaderSuspense} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

export const ContentRoute = () => {
    const {t} = useTranslation('jcontent');
    const {path, mode} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode
    }));
    const res = useNodeInfo({path});

    if (!res.loading && (res.node === undefined || res.error)) {
        if (mode === 'pages') {
            return <Error404/>;
        }

        return <Error404 label={t('jcontent:label.contentManager.error.missingFolder')}/>;
    }

    return (
        <MainLayout header={<ContentHeader/>}>
            <LoaderSuspense>
                <ErrorBoundary>
                    <ContentLayout/>
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
