import {createContext, useContext} from 'react';

const SidePanelContext = createContext({});

export const SidePanelContextProvider = SidePanelContext.Provider;

export const useSidePanelContext = () => useContext(SidePanelContext);
