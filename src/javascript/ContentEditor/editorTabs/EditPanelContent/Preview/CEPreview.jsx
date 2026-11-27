import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '@jahia/design-system-kit';
import {useSidePanelContext} from '~/JContent/SidePanel';
import {invalidateRefetch, setPreviewRefetcher} from '~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches';
import {Preview} from '~/JContent/preview/Preview';
import {UpdateOnSaveBadge} from '~/ContentEditor/editorTabs/EditPanelContent/Preview/UpdateOnSaveBadge';
import {useSelector} from 'react-redux';
import {buildPreviewContexts} from '~/JContent/preview/previewContext.utils';
import {useEmptyListComponent} from '~/JContent/ContentRoute/ContentLayout/PreviewDrawer/Preview/EmptyListComponent/EmptyListComponent';
import {useUnsavedValues} from './useUnsavedValues';

const parseQueryString = queryString => {
    if (!queryString) {
        return [];
    }

    const qs = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    return qs.split('&').map(entry => {
        const [name, value = ''] = entry.split('=');
        return {name, value: decodeURIComponent(value)};
    });
};

const usePreviewContexts = (nodeData, language, mode) => {
    const pageComposerCurrentPage = useSelector(state => state.pagecomposer?.currentPage);
    const pageComposerActive = useSelector(state => state.pagecomposer?.active);

    // The form renders this component at each keystroke, and the same contexts keep the memo of the preview fetcher.
    return useMemo(() => {
        let closestPage = null;
        let requestParameters = [];

        if (pageComposerActive && pageComposerCurrentPage && !nodeData.isPage) {
            closestPage = {
                path: decodeURIComponent(pageComposerCurrentPage.path),
                view: pageComposerCurrentPage.template
            };
            requestParameters = parseQueryString(pageComposerCurrentPage.queryString);
        } else if (mode === 'pages' && !nodeData.isPage) {
            const pageAncestor = nodeData.pageAncestors?.at(-1);
            if (pageAncestor) {
                closestPage = {path: pageAncestor.path};
            }
        }

        return buildPreviewContexts(nodeData, language, {closestPage, isCEPreview: true, requestParameters});
    }, [nodeData, language, mode, pageComposerActive, pageComposerCurrentPage]);
};

export const CEPreview = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, lang} = useSidePanelContext();
    const mode = useSelector(state => state.jcontent?.mode);

    const {primary, fallback} = usePreviewContexts(nodeData || {}, lang, mode);
    const {loading: emptyListLoading, component: emptyListComponent} = useEmptyListComponent(nodeData, mode);
    const {isSupported: isUnsavedValuesSupported, unsavedValues, isPartial} = useUnsavedValues();
    const [isRefused, setRefused] = useState(false);
    const showsUpdateOnSave = !isUnsavedValuesSupported || isPartial || (isRefused && Boolean(unsavedValues));
    // The preview shows the values that the editor typed, on the node of the form only.
    const previewContext = useMemo(() => (unsavedValues ? {...primary, unsavedValues} : primary), [primary, unsavedValues]);
    const fallbackPreviewContext = useMemo(() => (unsavedValues && fallback ? {...fallback, unsavedValues} : fallback), [fallback, unsavedValues]);

    const onRefetchReady = useCallback(refetch => {
        setPreviewRefetcher({
            queryParams: {language: lang, path: previewContext.path},
            refetch
        });
    }, [lang, previewContext.path]);

    const onRefetchInvalidated = useCallback(() => {
        invalidateRefetch({language: lang, path: previewContext.path});
    }, [lang, previewContext.path]);

    if (emptyListLoading) {
        return null;
    }

    if (emptyListComponent) {
        return emptyListComponent;
    }

    const header = (
        <>
            {showsUpdateOnSave && <UpdateOnSaveBadge/>}
            {nodeData.isFolder && (
                <div>
                    <Badge
                        badgeContent={t('jcontent:label.contentEditor.preview.noPreview')}
                        color="warning"
                        variant="normal"
                    />
                </div>
            )}
        </>
    );

    return (
        <Preview
            header={header}
            nodeData={nodeData}
            previewContext={previewContext}
            fallbackPreviewContext={fallbackPreviewContext}
            onRefetchInvalidated={onRefetchInvalidated}
            onRefetchReady={onRefetchReady}
            onUnsavedValuesRefused={setRefused}
        />
    );
};
