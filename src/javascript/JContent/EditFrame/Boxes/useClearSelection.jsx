import {cmClearSelection} from '~/JContent/redux/selection.redux';
import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

// Clear selection when clicking outside any module or if pressing escape key
const useClearSelection = ({currentDocument, setClickedElement}) => {
    const dispatch = useDispatch();
    const handleKeyboardNavigation = useCallback(event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            dispatch(cmClearSelection());
            setClickedElement(undefined);
        }
    }, [dispatch, setClickedElement]);

    const clearSelection = useCallback(event => {
        if (!event.defaultPrevented) {
            dispatch(cmClearSelection());
        }

        setClickedElement(undefined);
    }, [dispatch, setClickedElement]);

    useEffect(() => {
        currentDocument.addEventListener('click', clearSelection);
        currentDocument.addEventListener('keydown', handleKeyboardNavigation);
        return () => {
            currentDocument.removeEventListener('click', clearSelection);
            currentDocument.removeEventListener('keydown', handleKeyboardNavigation);
        };
    }, [dispatch, currentDocument, clearSelection, handleKeyboardNavigation]);
};

export default useClearSelection;
