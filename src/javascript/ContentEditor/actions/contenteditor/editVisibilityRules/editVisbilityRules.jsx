import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {
    useContentEditorConfigContext,
    useContentEditorContext,
    useContentEditorSectionContext
} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';
import {EditVisibilityRulesDialog} from './Visibility/EditVisibilityRulesDialog';
import {useNodeChecks} from '@jahia/data-helper';

export const EditVisibilityRulesActionComponent = ({path, render: Render, ...otherProps}) => {
    const {render, destroy} = useContext(ComponentRendererContext);
    const contentEditorConfigContext = useContentEditorConfigContext();
    const contentEditorContext = useContentEditorContext();
    const formik = useFormikContext();
    const {sections} = useContentEditorSectionContext();
    const res = useNodeChecks(
        {path: path},
        {...otherProps}
    );
    return (res.loading) ? null : (
        <Render {...otherProps}
                enabled={contentEditorContext.mode !== 'create'}
                isVisible={res.checksResult && contentEditorContext.nodeData.hasWritePermission && !contentEditorContext.nodeData.lockedAndCannotBeEdited}
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
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
};

export const editVisibilityRulesAction = {
    component: EditVisibilityRulesActionComponent
};
