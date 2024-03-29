import React, {useImperativeHandle, useState} from 'react';
import {CloseConfirmationDialog} from '~/ContentEditor/CloseConfirmationDialog';
import {useFormikContext} from 'formik';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {isDirty} from '~/ContentEditor/utils';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';

export const OnCloseConfirmationDialog = React.forwardRef((props, ref) => {
    const [confirmationConfig, setConfirmationConfig] = useState(false);
    const formik = useFormikContext();
    const {updateEditorConfig} = useContentEditorConfigContext();
    const {i18nContext} = useContentEditorContext();
    const dirty = isDirty(formik, i18nContext);

    useImperativeHandle(ref, () => ({
        openDialog: () => {
            if (dirty) {
                formik.validateForm();
                setConfirmationConfig(true);
            } else {
                updateEditorConfig({closed: true});
            }
        }
    }));

    return confirmationConfig && (
        <CloseConfirmationDialog
            isOpen
            actionCallback={() => updateEditorConfig({closed: true})}
            onCloseDialog={() => setConfirmationConfig(false)}
        />
    );
});
