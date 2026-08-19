import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {ButtonRendererNoLabel} from '~/ContentEditor/utils';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';

// Extension point: other modules (AI-assisted translation, glossary lookup, ...) register an action
// on this target to add a button next to the copy icon of every language row.
export const ROW_ACTIONS_TARGET = 'content-editor/field/all-languages/row-actions';

// The row only has room for one extra button, so as soon as a second action is registered on the
// target they all collapse behind this 3-dots menu instead of widening the row - same pattern as
// the field's own 'content-editor/field/3dots' menu.
export const ROW_ACTIONS_MENU = 'content-editor/field/all-languages/row-3dots';

export const findRowActions = () => registry.find({type: 'action', target: ROW_ACTIONS_TARGET});

// The label-less renderer from getButtonRenderer drops the label entirely, which would leave the icon
// button without an accessible name - put it back as title/aria-label, like the copy button.
const RowActionButtonRenderer = props => {
    // eslint-disable-next-line react/prop-types -- forwarded verbatim to ButtonRendererNoLabel, typed by ButtonRendererProps
    const {buttonLabel, buttonLabelNamespace, buttonLabelParams, buttonProps} = props;
    const {t} = useTranslation(buttonLabelNamespace);
    const label = buttonLabel ? t(buttonLabel, buttonLabelParams) : undefined;

    return <ButtonRendererNoLabel {...props} buttonProps={{title: label, 'aria-label': label, ...buttonProps}}/>;
};

/**
 * Renders the actions other modules contributed for one language row of the "edit in all languages"
 * modal. Everything an action needs is passed as props (see propTypes): the slot sits outside the
 * row's own Formik provider, so an action cannot read or write the value through useFormikContext.
 */
export const LanguageRowActions = props => {
    const actions = findRowActions();

    if (actions.length === 0) {
        return null;
    }

    return actions.length === 1 ?
        <DisplayActions target={ROW_ACTIONS_TARGET} render={RowActionButtonRenderer} {...props}/> :
        <DisplayAction actionKey={ROW_ACTIONS_MENU} render={RowActionButtonRenderer} {...props}/>;
};

LanguageRowActions.propTypes = {
    /** The field being edited, as defined by the content editor form */
    field: FieldPropTypes.isRequired,
    /** Language code of the row the action is rendered on */
    language: PropTypes.string.isRequired,
    /** Language code of the source row (the first one, the language the editor was opened in) */
    sourceLanguage: PropTypes.string.isRequired,
    /** Whether this row is the source row */
    isSourceLanguage: PropTypes.bool,
    /** Whether this row cannot be edited (locked node, or no write permission in that language) */
    isReadOnly: PropTypes.bool,
    /** Whether the source row currently holds a value - reactive, safe to use in isVisible/enabled */
    hasSourceValue: PropTypes.bool,
    /** UUID of the edited node */
    nodeUuid: PropTypes.string.isRequired,
    /** The content editor context of the underlying editor */
    editorContext: PropTypes.object.isRequired,
    /** Reads this row's current value. A getter, not a prop, so typing in a row doesn't re-render every other row */
    getValue: PropTypes.func.isRequired,
    /** Reads the source row's current value */
    getSourceValue: PropTypes.func.isRequired,
    /** Writes a value into this row. The modal saves it with the others when the user hits Save */
    onSetValue: PropTypes.func.isRequired
};
