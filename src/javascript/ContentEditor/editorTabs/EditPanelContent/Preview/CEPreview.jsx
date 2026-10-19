import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '@jahia/design-system-kit';
import {useSidePanelContext} from '~/JContent/SidePanel';
import {invalidateRefetch, setPreviewRefetcher} from '~/ContentEditor/ContentEditor/EditPanel/EditPanel.refetches';
import {Preview} from '~/JContent/preview/Preview';
import {UpdateOnSaveBadge} from '~/ContentEditor/editorTabs/EditPanelContent/Preview/UpdateOnSaveBadge';
import {useSelector} from 'react-redux';
import {buildPreviewContexts} from '~/JContent/preview/previewContext.utils';
import {useEmptyListComponent} from '~/JContent/ContentRoute/ContentLayout/PreviewDrawer/Preview/EmptyListComponent/EmptyListComponent';
import {useFormikContext} from 'formik';
import {useContentEditorSectionContext} from '~/ContentEditor/contexts/ContentEditorSection';
import {getDataToMutate} from '~/ContentEditor/utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

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
};

/**
 * The form's unsaved values, in the shape the preview mutation wants — or null when there is
 * nothing unsaved, which leaves the preview on the ordinary stored-content query.
 *
 * Three things are deliberately left out of the payload:
 *   - create mode, where the node does not exist yet and there is nothing to mutate;
 *   - the system name, since renaming would move the node out from under the render mid-keystroke;
 *   - work-in-progress, which is editor state rather than a rendered property.
 */
const useDirtyPayload = ({nodeData, lang, i18nContext, editorMode}) => {
    const formik = useFormikContext();
    const {sections} = useContentEditorSectionContext();

    const isDirty = Boolean(formik?.dirty);
    const values = formik?.values;

    return useMemo(() => {
        if (!isDirty || !values || !sections || !nodeData?.uuid ||
            editorMode === Constants.routes.baseCreateRoute) {
            return null;
        }

        const {propsToSave, propsToDelete, mixinsToAdd, mixinsToDelete} = getDataToMutate({
            nodeData,
            formValues: values,
            i18nContext: i18nContext || {},
            sections,
            lang
        });

        return {
            uuid: nodeData.uuid,
            propertiesToSave: propsToSave.filter(p => p.name !== Constants.systemName.propertyName),
            propertiesToDelete: propsToDelete,
            mixinsToAdd,
            mixinsToDelete
        };
    }, [isDirty, values, sections, nodeData, lang, i18nContext, editorMode]);
};

export const CEPreview = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, lang, i18nContext, mode: editorMode} = useSidePanelContext();
    const mode = useSelector(state => state.jcontent?.mode);
    const dirtyPayload = useDirtyPayload({nodeData, lang, i18nContext, editorMode});

    // The view a node renders with is itself an editable property, so an unsaved j:view has to
    // reach the preview context — otherwise changing the view is the one edit the live preview
    // cannot show, and it is a change the editor is most likely to want to see.
    const previewNodeData = useMemo(() => {
        const dirtyView = dirtyPayload?.propertiesToSave?.find(p => p.name === Constants.jView.propertyName);
        if (!dirtyView) {
            return nodeData || {};
        }

        return {...nodeData, jView: {value: dirtyView.value}};
    }, [nodeData, dirtyPayload]);

    const {primary: previewContext, fallback: fallbackPreviewContext} = usePreviewContexts(previewNodeData, lang, mode);
    const {loading: emptyListLoading, component: emptyListComponent} = useEmptyListComponent(nodeData, mode);

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
            <UpdateOnSaveBadge/>
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
            isLive
            dirtyPayload={dirtyPayload}
            header={header}
            nodeData={nodeData}
            previewContext={previewContext}
            fallbackPreviewContext={fallbackPreviewContext}
            onRefetchInvalidated={onRefetchInvalidated}
            onRefetchReady={onRefetchReady}
        />
    );
};
