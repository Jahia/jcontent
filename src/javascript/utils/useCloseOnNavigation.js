import {useEffect, useRef} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Closes a dialog as soon as the application navigates away from the page it was opened on.
 *
 * Dialogs opened through the component renderer are mounted next to the router rather than
 * inside it, so a route change unmounts nothing: without this they stay on screen on top of
 * the page the user has just navigated to, browser back and forward buttons included.
 *
 * The location comes from the store instead of the router hooks precisely because of where
 * those dialogs are mounted: the router context is not guaranteed to reach them, while the
 * store provider wraps the whole application.
 *
 * @param onClose called once the application has navigated, to close the dialog the same way
 * its own cancel button would
 */
export const useCloseOnNavigation = onClose => {
    const {location, action} = useSelector(state => ({
        location: state.router?.location,
        action: state.router?.action
    }), shallowEqual);

    const openedAt = useRef(location);

    // Held in a ref so that a caller passing an inline closure does not re-run the effect,
    // which would call onClose again on every render following the navigation.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        // Every navigation produces a new location object, so comparing the object itself
        // tells a real navigation apart from a re-render, whatever part of the url moved.
        if (location === openedAt.current) {
            return;
        }

        // POP is the browser's own back and forward buttons: whatever part of the url they
        // change, they take the user off the page the dialog belongs to. A push or a replace
        // keeping the same pathname is left alone, because that is how the current page
        // records its state in the url - jContent puts the selected node in the query string,
        // Content Editor puts its open editors in the hash - and none of it is a page change.
        if (action === 'POP' || location?.pathname !== openedAt.current?.pathname) {
            onCloseRef.current?.();
        }
    }, [location, action]);
};

/**
 * Renderless counterpart of useCloseOnNavigation, for the dialogs still written as class
 * components. Render it anywhere inside the dialog.
 */
export const CloseOnNavigation = ({onClose}) => {
    useCloseOnNavigation(onClose);
    return null;
};

CloseOnNavigation.propTypes = {
    onClose: PropTypes.func.isRequired
};
