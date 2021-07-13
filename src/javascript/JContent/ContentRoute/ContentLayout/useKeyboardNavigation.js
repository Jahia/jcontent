import {useRef, useState} from 'react';

export const useKeyboardNavigation = ({listLength, onSelectionChange}) => {
    const mainPanelRef = useRef(null);

    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

    const handleKeyboardNavigation = event => {
        // Right arrow code: 39, Down arrow code: 40
        if (selectedItemIndex !== listLength - 1 && (event.keyCode === 39 || event.keyCode === 40)) {
            setSelectedItemIndex(selectedItemIndex + 1);
            onSelectionChange(selectedItemIndex + 1);
            // Left arrow code: 37, Up arrow code: 38
        } else if (selectedItemIndex !== 0 && (event.keyCode === 37 || event.keyCode === 38)) {
            setSelectedItemIndex(selectedItemIndex - 1);
            onSelectionChange(selectedItemIndex - 1);
        }
    };

    const setFocusOnMainContainer = () => {
        console.log(mainPanelRef);
        mainPanelRef.current.focus();
    };

    return {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    };
};
