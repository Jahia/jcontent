import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
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
import {cmGoto, setTableViewMode} from '~/JContent/redux/JContent.redux';
import {isInSearchMode} from './ContentLayout/ContentLayout.utils';
import {
    getFrameTemplate,
    getPageBuilderContentViewMode,
    isPageBuilderContent,
    isPageBuilderEnabled,
    isPageBuilderNode,
    JahiaRenderedModulesUtil,
    pageBuilderNodeInfoOptions
} from '../JContent.utils';

// An item that opens in the Page Builder without being a page takes its view when it is reached, once per item, so
// the editor can still switch views on it
const useContentViewMode = ({node, path, mode, canShowEditFrame}) => {
    const dispatch = useDispatch();
    const reachedPath = (canShowEditFrame && node.path === path && !isInSearchMode(mode) && isPageBuilderContent(node)) ? path : null;

    useEffect(() => {
        if (reachedPath) {
            dispatch(setTableViewMode(getPageBuilderContentViewMode()));
        }
    }, [dispatch, reachedPath]);
};

// The template lives in the URL (state.jcontent.template) so that a reload keeps it; cmGoto resets it on every
// navigation, so it is set again each time the Page Builder opens on such a node. It replaces the history entry:
// Back would otherwise return to the bare URL and be sent forward again.
const useFrameTemplate = ({node, template, isOpenDialog, isPageBuilderView}) => {
    const dispatch = useDispatch();
    const isRenderedAsPage = isPageBuilderNode(node) && !isOpenDialog;
    const canShowEditFrame = isRenderedAsPage && isPageBuilderEnabled();
    const frameTemplate = isRenderedAsPage ? getFrameTemplate(node, template) : template;
    const isFrameTemplateReady = frameTemplate === template;
    const isTemplateToSet = isPageBuilderView && canShowEditFrame && !isFrameTemplateReady;

    useEffect(() => {
        if (isTemplateToSet) {
            dispatch(cmGoto({template: frameTemplate}, {replace: true}));
        }
    }, [dispatch, isTemplateToSet, frameTemplate]);

    return {isRenderedAsPage, canShowEditFrame, frameTemplate, isFrameTemplateReady};
};

// The frame waits for its template: loading the bare node URL first would show the error page for a moment
const PageBuilderFrame = ({isReady}) => (isReady ? <EditFrame/> : <LoaderOverlay/>);

PageBuilderFrame.propTypes = {
    isReady: PropTypes.bool.isRequired
};

export const ContentRoute = () => {
    const {t} = useTranslation('jcontent');
    const {path, mode, tableView, viewMode, template, language, params} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        tableView: state.jcontent.tableView,
        viewMode: state.jcontent.tableView.viewMode,
        template: state.jcontent.template,
        params: state.jcontent.params
    }), shallowEqual);
    const dispatch = useDispatch();
    const res = useNodeInfo({path}, pageBuilderNodeInfoOptions);
    const {FLAT, STRUCTURED, PAGE_BUILDER} = JContentConstants.tableView.viewMode;
    const accordionItem = registry.get('accordionItem', mode);
    const isPageBuilderView = viewMode === PAGE_BUILDER;
    const isOpenDialog = Boolean(params?.openDialog?.key);
    const {isRenderedAsPage, canShowEditFrame, frameTemplate, isFrameTemplateReady} = useFrameTemplate({node: res?.node, template, isOpenDialog, isPageBuilderView});
    useContentViewMode({node: res?.node, path, mode, canShowEditFrame});

    useEffect(() => {
        if (!isOpenDialog && accordionItem.tableConfig?.availableModes?.indexOf?.(viewMode) === -1) {
            dispatch(setTableViewMode(accordionItem.tableConfig.defaultViewMode || FLAT));
        }
    }, [dispatch, mode, viewMode, FLAT, accordionItem, isOpenDialog]);

    // Captured area information is used to block delete/move/copy/cut actions on areas, in every view mode
    useEffect(() => {
        if (path && language && isRenderedAsPage) {
            JahiaRenderedModulesUtil.extractModuleInfoFromRenderedPage(path, language, frameTemplate);
        }
    }, [path, language, frameTemplate, isRenderedAsPage]);

    if (isOpenDialog) {
        return null;
    }

    if (res.loading) {
        return <LoaderOverlay/>;
    }

    if (res.node === undefined || res.error) {
        if (mode === 'pages') {
            return <Error404/>;
        }

        return <Error404 label={t('jcontent:label.contentManager.error.missingFolder')}/>;
    }

    // Update viewMode if page builder is selected but content cannot be displayed
    if (!isInSearchMode(mode) && (res.node.path === path) && isPageBuilderView && !canShowEditFrame) {
        const {queryHandler, availableModes} = accordionItem?.tableConfig || {};
        const isStructured = Boolean(tableView && queryHandler?.isStructured && queryHandler?.isStructured({tableView}));
        const viewMode = (isStructured && availableModes.includes(STRUCTURED)) ? STRUCTURED : FLAT;
        dispatch(setTableViewMode(viewMode));
    }

    return (
        <MainLayout header={<ContentHeader/>}>
            <LoaderSuspense>
                <ErrorBoundary>
                    {(isPageBuilderView && canShowEditFrame) ? <PageBuilderFrame isReady={isFrameTemplateReady}/> : <ContentLayout/>}
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
