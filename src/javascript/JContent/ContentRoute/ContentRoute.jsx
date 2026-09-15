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
import {JahiaRenderedModulesUtil} from '../JContent.utils';

// A visually editable node that is not its own displayable node has no page, hence no template to render the frame
// with: it goes through the content-template wrapper instead. Pages and main resources keep an empty template.
const getFrameTemplateState = (node, canShowEditFrame, template) => {
    const isWrapperTemplateNeeded = canShowEditFrame && node.displayableNode?.path !== node.path;
    return {isWrapperTemplateNeeded, isFrameTemplateReady: !isWrapperTemplateNeeded || template !== ''};
};

// The template lives in the URL (state.jcontent.template) so that a reload keeps it; cmGoto resets it on every
// navigation, so it is set again each time the Page Builder opens on such a node.
const useWrapperTemplate = (isPageBuilderView, isWrapperTemplateNeeded, template) => {
    const dispatch = useDispatch();
    useEffect(() => {
        if (isPageBuilderView && isWrapperTemplateNeeded && template === '') {
            dispatch(cmGoto({template: JContentConstants.contentTemplate}));
        }
    }, [dispatch, isPageBuilderView, isWrapperTemplateNeeded, template]);
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
    const {visuallyEditableNodeType} = JContentConstants;
    const res = useNodeInfo({path}, {getIsNodeTypes: [visuallyEditableNodeType], getDisplayableNodePath: true});
    const {FLAT, STRUCTURED, PAGE_BUILDER} = JContentConstants.tableView.viewMode;
    const accordionItem = registry.get('accordionItem', mode);
    const isPageBuilderView = viewMode === PAGE_BUILDER;
    const isOpenDialog = Boolean(params?.openDialog?.key);
    const canShowEditFrame = Boolean(res?.node) && Boolean(res.node[visuallyEditableNodeType]) && !isOpenDialog;
    const {isWrapperTemplateNeeded, isFrameTemplateReady} = getFrameTemplateState(res.node, canShowEditFrame, template);
    useWrapperTemplate(isPageBuilderView, isWrapperTemplateNeeded, template);

    useEffect(() => {
        if (!isOpenDialog && accordionItem.tableConfig?.availableModes?.indexOf?.(viewMode) === -1) {
            dispatch(setTableViewMode(accordionItem.tableConfig.defaultViewMode || FLAT));
        }
    }, [dispatch, mode, viewMode, FLAT, accordionItem, isOpenDialog]);

    // Captured area information is used to block delete/move/copy/cut actions on areas
    useEffect(() => {
        if (path && language && canShowEditFrame && isFrameTemplateReady) {
            JahiaRenderedModulesUtil.extractModuleInfoFromRenderedPage(path, language, template);
        }
    }, [path, language, template, canShowEditFrame, isFrameTemplateReady]);

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
