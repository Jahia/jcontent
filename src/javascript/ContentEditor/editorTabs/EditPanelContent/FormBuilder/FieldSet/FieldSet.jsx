import React, {useState} from 'react';
import {Toggle} from '@jahia/design-system-kit';
import {Button, Edit, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {FieldSetPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {FieldContainer} from '../Field/Field.container';
import {useFormikContext} from 'formik';
import styles from './FieldSet.scss';

const hasValue = value => {
    if (Array.isArray(value)) {
        return value.some(entry => entry !== null && entry !== undefined && entry !== '');
    }

    return value !== null && value !== undefined && value !== '';
};

export const FieldSet = ({fieldset}) => {
    const {t} = useTranslation('jcontent');
    const {values, handleChange} = useFormikContext();
    const [showEmptyFields, setShowEmptyFields] = useState(false);
    const activatedFieldSet = !fieldset.dynamic || (values && values[fieldset.name]);
    // Read out of the uploaded binary rather than authored: show only the filled fields, with a
    // button to reveal the rest for editing.
    const isSparse = Constants.fileMetadataFieldSets.includes(fieldset.name);

    if (!fieldset.hasEnableSwitch && fieldset.fields.filter(f => f.visible).length === 0) {
        return false;
    }

    const visibleFields = fieldset.fields.filter(f => f.visible);
    const filteredFields = isSparse && !showEmptyFields ?
        visibleFields.filter(f => hasValue(values?.[f.name])) :
        visibleFields;
    return (
        <article className={activatedFieldSet && filteredFields.length > 0 ? styles.fieldSetOpen : styles.fieldSet}>
            {!fieldset.hideHeader && (
                <div className={styles.fieldSetTitleContainer}>
                    <div className="flexRow_nowrap">
                        {fieldset.dynamic && fieldset.hasEnableSwitch && (
                            <Toggle
                                classes={{
                                    root: styles.toggle
                                }}
                                data-sel-role-dynamic-fieldset={fieldset.name}
                                id={fieldset.name}
                                checked={activatedFieldSet}
                                readOnly={fieldset.readOnly}
                                onChange={handleChange}
                            />
                        )}
                        <div className="flexCol">
                            <div className={styles.fieldSetTitleRow}>
                                <Typography component="label"
                                            htmlFor={fieldset.name}
                                            className={styles.fieldSetTitle}
                                            variant="subheading"
                                            weight="bold"
                                >
                                    {fieldset.displayName}
                                </Typography>
                                {isSparse && (
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        icon={<Edit/>}
                                        data-sel-role={`fieldset-show-empty-${fieldset.name}`}
                                        aria-label={t(showEmptyFields ?
                                            'jcontent:label.contentEditor.edit.fieldSet.hideEmptyFields' :
                                            'jcontent:label.contentEditor.edit.fieldSet.showEmptyFields')}
                                        title={t(showEmptyFields ?
                                            'jcontent:label.contentEditor.edit.fieldSet.hideEmptyFields' :
                                            'jcontent:label.contentEditor.edit.fieldSet.showEmptyFields')}
                                        onClick={() => setShowEmptyFields(previous => !previous)}
                                    />
                                )}
                            </div>
                            {fieldset.description && (
                                <Typography component="label" className={styles.fieldSetDescription} variant="caption">
                                    {/* eslint-disable-next-line react/no-danger */}
                                    <span dangerouslySetInnerHTML={{__html: fieldset.description}}/>
                                </Typography>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.fields}>
                {activatedFieldSet && filteredFields.map(field => <FieldContainer key={field.name} field={field}/>)}
            </div>
        </article>
    );
};

FieldSet.propTypes = {
    fieldset: FieldSetPropTypes.isRequired
};
