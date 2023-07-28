import React, {useEffect} from 'react';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor/index';
import {useApolloClient} from '@apollo/client';

export const ApolloCacheFlushOnGWTSave = () => {
    const client = useApolloClient();
    const {refetchFormData} = useContentEditorContext();
    useEffect(() => {
        // Register flush on GWT save
        window.contentModificationEventHandlers = window.contentModificationEventHandlers || [];
        let handler = nodeUuid => {
            client.cache.flushNodeEntryById(nodeUuid);
            refetchFormData();
        };

        window.contentModificationEventHandlers.push(handler);

        // Unregister flush on GWT save at unload
        return () => {
            window.contentModificationEventHandlers.splice(window.contentModificationEventHandlers.indexOf(handler), 1);
        };
    });

    /* eslint-disable react/jsx-no-useless-fragment */
    return <></>;
};
