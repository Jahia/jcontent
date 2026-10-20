import {createContext, useCallback, useContext, useSyncExternalStore} from 'react';

/**
 * The interaction state of the page builder: what the pointer is over and which module was clicked.
 *
 * It changes on every pointer move, so it lives outside React state: a box subscribes to the one
 * value it derives (is *my* path hovered?) and re-renders only when that value flips.
 */
export const createPageBuilderStore = () => {
    let state = {hoveredPath: null, clickedElement: undefined};
    const listeners = new Set();

    const setState = patch => {
        const next = {...state, ...(typeof patch === 'function' ? patch(state) : patch)};
        if (next.hoveredPath === state.hoveredPath && next.clickedElement === state.clickedElement) {
            return;
        }

        state = next;
        listeners.forEach(listener => listener());
    };

    return {
        getState: () => state,
        subscribe: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        setHoveredPath: hoveredPath => setState({hoveredPath}),
        setClickedElement: clickedElement => setState(prev => ({
            clickedElement: typeof clickedElement === 'function' ? clickedElement(prev.clickedElement) : clickedElement
        }))
    };
};

export const PageBuilderStoreContext = createContext(null);

export const usePageBuilderStore = () => useContext(PageBuilderStoreContext);

export const usePageBuilderState = selector => {
    const store = usePageBuilderStore();
    const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
    return useSyncExternalStore(store.subscribe, getSnapshot);
};

// The copy and cut actions run outside the page builder tree and clear the clicked element through
// getClickedElementHook(), which predates the store. The mounted page builder registers its store here.
let activeStore = null;

export const setActiveStore = store => {
    activeStore = store;
};

export const getClickedElementHook = () => clickedElement => activeStore?.setClickedElement(clickedElement);
