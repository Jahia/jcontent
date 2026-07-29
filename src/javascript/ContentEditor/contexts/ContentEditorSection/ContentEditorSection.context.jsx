import React, {useContext, useRef, useState} from 'react';
import * as PropTypes from 'prop-types';

export const ContentEditorSectionContext = React.createContext({});

export const useContentEditorSectionContext = () => useContext(ContentEditorSectionContext);
export const ContentEditorSectionContextProvider = ({formSections, children}) => {
    const sections = useRef(formSections);

    // Keep sections.current in sync when formSections changes (e.g. language switch that doesn't
    // remount this provider). The parent memoizes the clone so this only fires on genuine reloads,
    // not on every render — preserving in-place mutations from dependentProperties / ChoiceList.
    if (sections.current !== formSections) {
        sections.current = formSections;
    }

    const [, setChangeCount] = useState(0);

    const onSectionsUpdate = () => {
        setChangeCount(i => i + 1);
    };

    const getSections = () => {
        return sections.current;
    };

    const setSections = () => {
        console.warn('Sections update is deprecated');
        onSectionsUpdate();
    };

    return (
        <ContentEditorSectionContext.Provider value={{sections: sections.current, getSections, onSectionsUpdate, setSections}}>
            {children}
        </ContentEditorSectionContext.Provider>
    );
};

ContentEditorSectionContextProvider.propTypes = {
    formSections: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired
};
