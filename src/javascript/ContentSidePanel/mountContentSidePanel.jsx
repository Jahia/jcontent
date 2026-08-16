import React from 'react';
import {createRoot} from 'react-dom/client';
import {ContentSidePanel} from './ContentSidePanel';

/**
 * Imperative mount helper for hosts that are not React apps (or that render outside the
 * app shell's React tree, e.g. a plain JSP page or a browser console check).
 *
 * React hosts should render `<ContentSidePanel/>` directly instead — mounting a separate
 * root cuts the panel off from the host's providers, which is exactly the case
 * `ContentSidePanelProviders` has to paper over.
 *
 * @param {HTMLElement} element  Host element — must have a size, the panel fills it.
 * @param {object}      props    ContentSidePanel props.
 * @returns {Function}  Unmount callback.
 */
export const mountContentSidePanel = (element, props) => {
    const root = createRoot(element);
    root.render(<ContentSidePanel {...props}/>);
    return () => root.unmount();
};
