import React, {useContext} from 'react';
import * as PropTypes from 'prop-types';

export const ContentEditorConfigContext = React.createContext<{
    uuid?: string;
    lang?: string;
    sideBySideContext?: {
        enabled?: boolean;
        lang?: string;
        readOnly?: boolean;
        translateLang?: string;
        hasWritePermission?: boolean;
        lockedAndCannotBeEdited?: boolean;
    };
}>({});
export const useContentEditorConfigContext = () => useContext(ContentEditorConfigContext);

export const ContentEditorConfigContextProvider = ({config, children}) => (
    <ContentEditorConfigContext.Provider value={config}>
        {children}
    </ContentEditorConfigContext.Provider>
);

ContentEditorConfigContextProvider.propTypes = {
    config: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
};
