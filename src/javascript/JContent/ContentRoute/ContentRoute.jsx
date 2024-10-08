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
import {isInSearchMode} from './ContentLayout/ContentLayout.utils';
import {JahiaAreasUtil} from '../JContent.utils';

export const ContentRoute = () => {
    const {t} = useTranslation('jcontent');
    const {path, mode, tableView, viewMode, template, language} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        tableView: state.jcontent.tableView,
        viewMode: state.jcontent.tableView.viewMode,
        template: state.jcontent.template
    }), shallowEqual);
    const dispatch = useDispatch();
    const nodeTypes = ['jnt:page', 'jmix:mainResource'];
    const res = useNodeInfo({path}, {getIsNodeTypes: nodeTypes});
    const {FLAT, STRUCTURED, PAGE_BUILDER} = JContentConstants.tableView.viewMode;
    const accordionItem = registry.get('accordionItem', mode);
    const isPageBuilderView = viewMode === PAGE_BUILDER;
    const canShowEditFrame = res?.node && nodeTypes.some(nt => res.node[nt]);

    useEffect(() => {
        if (accordionItem.tableConfig?.availableModes?.indexOf?.(viewMode) === -1) {
            dispatch(setTableViewMode(accordionItem.tableConfig.defaultViewMode || FLAT));
        }
    }, [dispatch, mode, viewMode, FLAT, accordionItem]);

    // Captured area information is used to block delete/move/copy/cut actions on areas
    useEffect(() => {
        if (path && language && canShowEditFrame) {
            loadPageAndCaptureJahiaAreas(path, language, template);
        }
    }, [path, language, template, canShowEditFrame]);

    const loadPageAndCaptureJahiaAreas = (path, language, template) => {
        const renderMode = 'editframe';
        const encodedPath = path.replace(/[^/]/g, encodeURIComponent) + (template === '' ? '' : `.${template}`);
        const url = `${window.contextJsParameters.contextPath}/cms/${renderMode}/default/${language}${encodedPath}.html?redirect=false`;

        fetch(url, {
            method: 'get'
        }).then(resp => {
            return resp.text();
        }).then(resp => {
            const dom = new DOMParser().parseFromString(resp, 'text/html');
            dom.querySelectorAll('[jahiatype]').forEach((element => {
                const jahiatype = element.getAttribute('jahiatype');
                const modulePath = element.getAttribute('path');
                const type = element.getAttribute('type');

                if (jahiatype === 'module' && modulePath !== '*' && modulePath !== path && (type === 'area' || type === 'absoluteArea')) {
                    JahiaAreasUtil.addArea(modulePath);
                }
            }));
        }).catch(e => {
            console.error('Failed to capture areas for page', e);
        });
    };

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
                    {(isPageBuilderView && canShowEditFrame) ? <EditFrame/> : <ContentLayout/>}
                </ErrorBoundary>
            </LoaderSuspense>
        </MainLayout>
    );
};

export default ContentRoute;
