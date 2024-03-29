import React, {useEffect} from 'react';
import ContentLayout from './ContentLayout';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import {LoaderOverlay, ErrorBoundary, Error404, LoaderSuspense} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {EditFrame} from '../EditFrame';
import {registry} from '@jahia/ui-extender';
import {setTableViewMode} from '~/JContent/redux/JContent.redux';

export const ContentRoute = () => {
    const {t} = useTranslation('jcontent');
    const {path, mode, viewMode} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode
    }), shallowEqual);
    const dispatch = useDispatch();
    const nodeTypes = ['jnt:page', 'jmix:mainResource'];
    const res = useNodeInfo({path}, {getIsNodeTypes: nodeTypes});

    useEffect(() => {
        const accordionItem = registry.get('accordionItem', mode);
        if (accordionItem.tableConfig?.availableModes?.indexOf?.(viewMode) === -1) {
            dispatch(setTableViewMode(accordionItem.tableConfig.defaultViewMode || 'flatList'));
        }
    }, [dispatch, mode, viewMode]);

    if (res.loading) {
        return <LoaderOverlay/>;
    }

    if (res.node === undefined || res.error) {
        if (mode === 'pages') {
            return <Error404/>;
        }

        return <Error404 label={t('jcontent:label.contentManager.error.missingFolder')}/>;
    }

    const pageBuilder = (JContentConstants.tableView.viewMode.PAGE_BUILDER === viewMode || JContentConstants.tableView.viewMode.PREVIEW === viewMode);
    const canShowEditFrame = nodeTypes.some(nt => res.node[nt]);

    return (
        <MainLayout header={<ContentHeader/>}>
            <LoaderSuspense>
                <ErrorBoundary>
                    { (pageBuilder && canShowEditFrame ? (<EditFrame isPreview={JContentConstants.tableView.viewMode.PREVIEW === viewMode}/>) : <ContentLayout/>) }
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
