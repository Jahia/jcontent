import React from 'react';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';
import {Field} from './Field';
import styles from './styles.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererNoLabel, propertyHasChanged} from '~/ContentEditor/utils';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';
import {useTranslation} from 'react-i18next';

export const FieldContainer = React.memo(({field, inputContext}) => {
    const selectorType = resolveSelectorType(field);
    const context = React.useMemo(() => ({
        displayLabels: true,
        displayBadges: true,
        displayActions: true,
        displayErrors: true,
        selectorType,
        ...inputContext
    }), [inputContext, selectorType]);
    const {values} = useFormikContext();
    const {sideBySideContext} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');

    // Side-by-side diff mode (opt-in via sideBySideContext.showDiff): flag fields whose value in this
    // read-only compare column differs from the compared live node (sideBySideContext.targetNodeData),
    // so the column shows a diff bar and the restore arrow appears only where there is something to
    // restore. Off in the main edit form and in side-by-side without showDiff -> renders as before.
    const diffMode = Boolean(sideBySideContext?.enabled && sideBySideContext?.showDiff);
    const hasDiff = Boolean(diffMode && sideBySideContext.targetNodeData &&
        propertyHasChanged(values[field.name], field, sideBySideContext.targetNodeData));

    // WCAG 1.4.1: the blue bar alone signals "changed" by colour. Add a non-colour cue (a title/tooltip
    // surfaced to assistive tech) so the difference is perceivable on fields with no arrow (non-i18n).
    const diffTitle = (diffMode && hasDiff) ? t('label.contentEditor.edit.action.translate.fieldDiff') : undefined;

    return (
        <div
            className={clsx(styles.fieldContainer, diffMode && hasDiff && styles.fieldContainerDiff)}
            title={diffTitle}
        >
            {context.displayActions && <DisplayAction
                actionKey="translateField"
                render={ButtonRendererNoLabel}
                field={field}
                value={values[field.name]}
                hasDiff={hasDiff}
            />}
            <Field
                idInput={field.name}
                inputContext={context}
                selectorType={selectorType}
                field={field}/>
        </div>

    );
});

FieldContainer.defaultProps = {
    inputContext: {}
};

FieldContainer.propTypes = {
    field: FieldPropTypes.isRequired,
    inputContext: PropTypes.object
};

FieldContainer.displayName = 'FieldContainer';
