import React from 'react';
import * as PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';
import {Field} from './Field';
import styles from './styles.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererNoLabel} from '~/ContentEditor/utils';
import {useFormikContext} from 'formik';
import {useLeadingAction} from '../LeadingAction.context';

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
    const leadingAction = useLeadingAction();

    return (
        <div className={styles.fieldContainer}>
            {context.displayActions && leadingAction && (
                <div className={styles.leadingActions}>
                    <DisplayAction
                        actionKey={leadingAction}
                        render={ButtonRendererNoLabel}
                        field={field}
                        value={values[field.name]}
                    />
                </div>
            )}
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
