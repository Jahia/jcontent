import React, {useState} from 'react';
import {useFormikContext} from 'formik';
import {openEngineTab} from './engineTabs.utils';
import {CloseConfirmationDialog} from '~/ContentEditor/CloseConfirmationDialog';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {isDirty} from '~/ContentEditor/utils';

/**
 * Provides the logic to open GWT engine tabs with an unsaved changes check: if the form is
 * dirty, a confirmation dialog (continue editing/discard/save) is shown before opening the engine.
 *
 * @param defaultTabs array of GWT engine tab ids to open when none are specified at call time
 * @returns {{openTabs: function, confirmationDialog: JSX.Element}} openTabs triggers the flow;
 *          confirmationDialog must be rendered by the caller. openTabs accepts an optional
 *          array of tab ids to override the default.
 */
export const useOpenEngineTabsWithConfirmation = defaultTabs => {
    const [open, setOpen] = useState(false);
    const [pendingTabs, setPendingTabs] = useState(defaultTabs);
    const formik = useFormikContext();
    const {nodeData, i18nContext, resetI18nContext} = useContentEditorContext();

    const dirty = isDirty(formik, i18nContext);

    const openTabs = (tabIds = defaultTabs) => {
        if (dirty) {
            setPendingTabs(tabIds);
            setOpen(true);
        } else {
            openEngineTab(nodeData, tabIds);
        }
    };

    const confirmationDialog = (
        <CloseConfirmationDialog
            isOpen={open}
            actionCallback={({discard}) => {
                if (discard) {
                    resetI18nContext();
                    formik.resetForm();
                }

                openEngineTab(nodeData, pendingTabs);
            }}
            onCloseDialog={() => setOpen(false)}
        />
    );

    return {openTabs, confirmationDialog};
};
