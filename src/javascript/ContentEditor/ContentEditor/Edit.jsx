import React, {useCallback, useEffect, useRef} from 'react';
import {useNotifications} from '@jahia/react-material';
import {Formik} from 'formik';
import {EditPanel} from './EditPanel/EditPanel';
import {
    PublicationInfoContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext,
    useContentEditorSectionContext
} from '~/ContentEditor/contexts';
import {validate} from '~/ContentEditor/validation';
import {updateNode} from './updateNode';
import {LockManager} from './LockManager';
import {useTranslation} from 'react-i18next';
import {useApolloClient} from '@apollo/client';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import '../contentEditor.scss';

export const Edit = () => {
    const notificationContext = useNotifications();
    const client = useApolloClient();
    const {t} = useTranslation('jcontent');
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {onClosedCallback, editCallback} = contentEditorConfigContext;
    const {lang, nodeData, initialValues, title, i18nContext} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();

    useEffect(() => {
        return () => {
            // If nodeData.lockedAndCannotBeEdited, rely on callback after lock released
            if (nodeData.lockedAndCannotBeEdited) {
                onClosedCallback();
            }
        };
    }, [onClosedCallback, nodeData.lockedAndCannotBeEdited]);

    const handleSubmit = useCallback((values, actions) => {
        return updateNode({
            client,
            t,
            notificationContext,
            actions,
            data: {
                nodeData,
                sections,
                values,
                language: lang,
                i18nContext
            },
            editCallback: info => {
                const {originalNode, updatedNode} = info;

                editCallback(info, contentEditorConfigContext);
                // Hard reFetch to be able to enable publication menu from jContent menu displayed in header
                // Note that node cache is flushed in save.request.js, we should probably replace this operation with
                // Something less invasive as this one reloads ALL queries.
                if (originalNode.path === updatedNode.path) {
                    client.reFetchObservableQueries();
                    triggerRefetchAll();
                }
            }
        });
    }, [client, t, notificationContext, editCallback, contentEditorConfigContext, lang, nodeData, sections, i18nContext]);

    // Formik reinitializes whenever the initialValues REFERENCE changes, and the adapter recomputes
    // it (same content, new identity) on incidental re-renders — which would reset in-progress
    // edits. Only hand Formik a new reference on a genuine language or node change.
    const stableInitialValuesRef = useRef({lang, uuid: nodeData.uuid, initialValues});
    if (stableInitialValuesRef.current.lang !== lang || stableInitialValuesRef.current.uuid !== nodeData.uuid) {
        stableInitialValuesRef.current = {lang, uuid: nodeData.uuid, initialValues};
    }

    return (
        <>
            <PublicationInfoContextProvider uuid={nodeData.uuid} lang={lang}>
                <Formik
                    enableReinitialize
                    validateOnMount
                    validateOnChange={false}
                    initialValues={stableInitialValuesRef.current.initialValues}
                    validate={validate(sections)}
                    onSubmit={handleSubmit}
                >
                    {() => <EditPanel title={title}/>}
                </Formik>
            </PublicationInfoContextProvider>
            {!nodeData.lockedAndCannotBeEdited && <LockManager uuid={nodeData.uuid} onLockReleased={onClosedCallback}/>}
        </>
    );
};
