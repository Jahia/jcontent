import React, {useContext} from 'react';

/** The key of the action shown before each field of a FormBuilder, none by default. */
export const LeadingActionContext = React.createContext<string | null>(null);

export const useLeadingAction = () => useContext(LeadingActionContext);
