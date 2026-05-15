import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {
    useContentEditorConfigContext,
    useContentEditorContext,
    useContentEditorSectionContext
} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';
import {
    EditVisibilityRulesDialog
} from './Visibility/EditVisibilityRulesDialog';

export const EditVisibilityRulesActionComponent = ({render: Render, ...otherProps}) => {
    const {render, destroy} = useContext(ComponentRendererContext);
    const contentEditorConfigContext = useContentEditorConfigContext();
    const contentEditorContext = useContentEditorContext();
    const formik = useFormikContext();
    const {sections} = useContentEditorSectionContext();

    return (
        <Render {...otherProps}
                enabled={contentEditorContext.mode !== 'create'}
                isVisible={contentEditorContext.nodeData.hasWritePermission && !contentEditorContext.nodeData.lockedAndCannotBeEdited}
                onClick={() => {
                    render('EditVisibilityRulesDialog', EditVisibilityRulesDialog, {
                        isOpen: true,
                        contentEditorContext,
                        contentEditorConfigContext,
                        formik,
                        sections,
                        onCloseDialog: () => destroy('EditVisibilityRulesDialog')
                    });
                }}/>
    );
};

EditVisibilityRulesActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};

export const editVisibilityRulesAction = {
    component: EditVisibilityRulesActionComponent
};
