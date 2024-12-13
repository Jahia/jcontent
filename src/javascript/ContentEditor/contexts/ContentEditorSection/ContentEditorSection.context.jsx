import React, {useContext, useRef, useState} from 'react';
import * as PropTypes from 'prop-types';

export const ContentEditorSectionContext = React.createContext({});

export const useContentEditorSectionContext = () => useContext(ContentEditorSectionContext);
export const ContentEditorSectionContextProvider = ({formSections, children}) => {
    const sections = useRef(formSections);

    const [, setChangeCount] = useState(0);

    const onSectionsUpdate = () => {
        //sections.current = JSON.parse(JSON.stringify(sections.current));
        setChangeCount(i => i + 1);
    };

    const getSections = () => {
        return sections.current;
    };

    const setSections = () => {
        console.warn('Sections update is deprecated');
        onSectionsUpdate();
    };

    console.log('sec ctx');
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
