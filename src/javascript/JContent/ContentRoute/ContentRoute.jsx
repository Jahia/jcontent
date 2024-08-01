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
    const {path, mode, tableView, viewMode} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        tableView: state.jcontent.tableView,
        viewMode: state.jcontent.tableView.viewMode
    }), shallowEqual);
    const dispatch = useDispatch();
    const nodeTypes = ['jnt:page', 'jmix:mainResource'];
    const res = useNodeInfo({path}, {getIsNodeTypes: nodeTypes});
    const {FLAT, STRUCTURED, PAGE_BUILDER, PREVIEW} = JContentConstants.tableView.viewMode;
    const accordionItem = registry.get('accordionItem', mode);

    useEffect(() => {
        if (accordionItem.tableConfig?.availableModes?.indexOf?.(viewMode) === -1) {
            dispatch(setTableViewMode(accordionItem.tableConfig.defaultViewMode || FLAT));
        }
    }, [dispatch, mode, viewMode, FLAT, accordionItem]);

    if (res.loading) {
        return <LoaderOverlay/>;
    }

    if (res.node === undefined || res.error) {
        if (mode === 'pages') {
            return <Error404/>;
        }

        return <Error404 label={t('jcontent:label.contentManager.error.missingFolder')}/>;
    }

    const isPageBuilderView = [PAGE_BUILDER, PREVIEW].includes(viewMode);
    const canShowEditFrame = nodeTypes.some(nt => res.node[nt]);

    // Update viewMode if page builder is selected but content cannot be displayed
    if (isPageBuilderView && !canShowEditFrame) {
        const {queryHandler, availableModes} = accordionItem?.tableConfig || {};
        const isStructured = Boolean(tableView && queryHandler?.isStructured && queryHandler?.isStructured({tableView}));
        const viewMode = (isStructured && availableModes.includes(STRUCTURED)) ? STRUCTURED : FLAT;
        dispatch(setTableViewMode(viewMode));
    }

    return (
        <MainLayout header={<ContentHeader/>}>
            <LoaderSuspense>
                <ErrorBoundary>
                    { (isPageBuilderView && canShowEditFrame ? (<EditFrame isPreview={JContentConstants.tableView.viewMode.PREVIEW === viewMode}/>) : <ContentLayout/>) }
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
