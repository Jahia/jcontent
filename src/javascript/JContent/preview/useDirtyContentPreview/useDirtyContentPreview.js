import {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation} from '@apollo/client';
import {DIRTY_CONTENT_PREVIEW_MUTATION} from './useDirtyContentPreview.gql-mutation';

/** Keystrokes per render: long enough to coalesce typing, short enough to still feel live. */
const DEFAULT_DEBOUNCE_MS = 400;

const buildVariables = (previewContext, dirtyPayload) => ({
    uuid: dirtyPayload.uuid,
    propertiesToSave: dirtyPayload.propertiesToSave,
    propertiesToDelete: dirtyPayload.propertiesToDelete,
    mixinsToAdd: dirtyPayload.mixinsToAdd,
    mixinsToDelete: dirtyPayload.mixinsToDelete,
    renderPath: previewContext.path,
    templateType: previewContext.templateType,
    view: previewContext.view,
    contextConfiguration: previewContext.contextConfiguration,
    language: previewContext.language,
    requestAttributes: previewContext.requestAttributes,
    mainResourcePath: previewContext.mainResourcePath
});

/**
 * Renders the edited node with the form's unsaved values, re-running as the values change.
 *
 * Shapes its result like useContentPreview's so the viewers consume both without knowing which
 * one produced the HTML: `{data: {nodeByPath}, loading, error}`.
 *
 * Two properties make it usable on every keystroke:
 *  - the render is debounced, so a burst of typing costs one render, not one per character;
 *  - the PREVIOUS output stays on screen while the next one is in flight, so the preview updates
 *    in place instead of collapsing to a loader between renders. `loading` therefore means
 *    "nothing to show yet", not "a request is running" (that is `isRefreshing`).
 *
 * A render that errors (half-typed mandatory field, constraint violation) keeps the last good
 * output rather than blanking the panel — the editor is mid-edit, errors are the normal case.
 *
 * @param {object} previewContext - as built by buildPreviewContexts; `path` is what gets rendered
 * @param {object} dirtyPayload - {uuid, propertiesToSave, propertiesToDelete, mixinsToAdd, mixinsToDelete}
 * @param {number} [debounceMs]
 */
export const useDirtyContentPreview = ({previewContext, dirtyPayload, debounceMs = DEFAULT_DEBOUNCE_MS, skip = false}) => {
    const [mutate] = useMutation(DIRTY_CONTENT_PREVIEW_MUTATION, {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
    });

    const [result, setResult] = useState({data: null, error: null, isRefreshing: true});

    // Monotonic request id. A response that is not the newest request is dropped, so a slow
    // render can never overwrite a fresher one that already came back.
    const requestId = useRef(0);

    // Variables are rebuilt on every render from fresh objects, so they are identified by their
    // serialized form: equal values mean no new render, whatever the object identity.
    const variablesKey = JSON.stringify(buildVariables(previewContext, dirtyPayload || {}));
    const variables = useMemo(() => JSON.parse(variablesKey), [variablesKey]);

    useEffect(() => {
        if (skip) {
            return;
        }

        const id = requestId.current + 1;
        requestId.current = id;
        setResult(previous => ({...previous, isRefreshing: true}));

        // A superseded response is not merely ignored: its request is aborted, so the server
        // stops rendering a page nobody will look at. Under sustained typing that is the
        // difference between one abandoned render and a queue of them.
        const controller = new AbortController();

        const timer = setTimeout(() => {
            mutate({variables, context: {fetchOptions: {signal: controller.signal}}})
                .then(({data, errors}) => {
                    if (id !== requestId.current) {
                        return;
                    }

                    const node = data?.jcr?.render?.node;
                    if (!node) {
                        // Keep whatever is on screen; errors are expected mid-edit.
                        setResult(previous => ({
                            ...previous,
                            error: errors?.[0] ?? new Error('No rendered content returned'),
                            isRefreshing: false
                        }));
                        return;
                    }

                    setResult({
                        data: {nodeByPath: {...node, isFile: false, lastModified: null}},
                        error: null,
                        isRefreshing: false
                    });
                })
                .catch(error => {
                    // An abort is this hook's own doing, not a failed render.
                    if (id === requestId.current && error?.name !== 'AbortError') {
                        setResult(previous => ({...previous, error, isRefreshing: false}));
                    }
                });
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [variables, mutate, debounceMs, skip]);

    return {
        data: result.data,
        error: result.error,
        // An error on top of an earlier render means the frame is showing something older than
        // what the form says. The editor has to be told, or they read a stale preview as live.
        isStale: Boolean(result.error && result.data),
        loading: result.data === null && result.error === null,
        isRefreshing: result.isRefreshing
    };
};
