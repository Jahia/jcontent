import React from 'react';
import * as PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';
import {Field} from './Field';
import styles from './styles.scss';
import {DisplayActions} from '@jahia/ui-extender';
import {ButtonRendererNoLabel} from '~/ContentEditor/utils';
import {useFormikContext} from 'formik';

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

    return (
        <div className={styles.fieldContainer}>
            {context.displayActions && (
                <div className={styles.leadingActions}>
                    <DisplayActions
                        target="content-editor/field/leading-actions"
                        render={ButtonRendererNoLabel}
                        field={field}
                        value={values[field.name]}
                        selectorType={selectorType}
                        inputContext={context}
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
