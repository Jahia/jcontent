import {useState, useEffect, useRef} from 'react';
import {registry} from '@jahia/ui-extender';
import {useApolloClient} from '@apollo/client';

export const useOnBeforeContextHooks = editorContext => {
    const client = useApolloClient();
    const [contextAvailableHooksHandled, setContextAvailableHooksHandled] = useState(false);
    const loading = useRef(false);

    useEffect(() => {
        if (!loading.current && editorContext && !contextAvailableHooksHandled && client) {
            loading.current = true;
            const promises = registry.find({type: 'jcontent-editor-onbefore-context-hook'}).map(hook => hook.hook(editorContext, client));
            Promise.allSettled(promises).then(() => {
                loading.current = false;
                setContextAvailableHooksHandled(true);
            });
        }
    }, [editorContext, contextAvailableHooksHandled, client]);

    return contextAvailableHooksHandled;
};
