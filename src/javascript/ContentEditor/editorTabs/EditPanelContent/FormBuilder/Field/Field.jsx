import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {InputLabel} from '@material-ui/core';
import {Chip, Language, Typography} from '@jahia/moonstone';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import * as PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {MultipleField} from './MultipleField';
import {SingleField} from './SingleField';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {buildFlatFieldObject} from './field.utils';
import {DisplayAction, registry} from '@jahia/ui-extender';
import {contentEditorHelper} from './contentEditorHelper';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {useApolloClient} from '@apollo/client';
import {getButtonRenderer} from '~/ContentEditor/utils';
import {useFormikContext} from 'formik';
import styles from './Field.scss';
import {ReadOnlyBadge} from '~/ContentEditor/ContentEditor/EditPanel/HeaderBadges/ReadOnlyBadge';

const ButtonRenderer = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {variant: 'ghost'}});

export const showChipField = (is18nField, wipInfo, currentLanguage) => {
    return is18nField && wipInfo && wipInfo.status === Constants.wip.status.LANGUAGES && wipInfo.languages.indexOf(currentLanguage) > -1;
};

const renderField = (
    inputContext,
    field,
    isMultipleField,
    idInput,
    hasMandatoryError,
    t,
    wipInfo,
    editorContext,
    selectorType,
    onChange,
    onBlur,
    shouldDisplayErrors,
    errorName,
    errorArgs
// eslint-disable-next-line max-params
) => {
    return (
        <div className="flexFluid">
            {inputContext.displayLabels &&
            <div className={clsx(styles.inputLabelContainer, 'flexRow', 'alignCenter')}>
                <InputLabel id={`${field.name}-label`}
                            className={styles.inputLabel}
                            htmlFor={isMultipleField ? null : idInput}
                >
                    <Typography weight="bold">{field.displayName}</Typography>
                </InputLabel>
                {inputContext.displayBadges && (
                <>
                    {field.mandatory && (
                    <Chip
                                className={styles.badge}
                                data-sel-content-editor-field-mandatory={Boolean(hasMandatoryError)}
                                label={t('jcontent:label.contentEditor.edit.validation.required')}
                                color={hasMandatoryError ? 'warning' : 'accent'}
                            />
                        )}
                    {field.readOnly && (
                    <ReadOnlyBadge isReadOnly={field.readOnly}/>
                        )}
                    {showChipField(field.i18n, wipInfo, editorContext.lang) && (
                    <Chip
                                className={styles.badge}
                                data-sel-role="wip-info-chip-field"
                                label={t('jcontent:label.contentEditor.edit.action.workInProgress.chipLabelField')}
                                color="warning"
                            />
                        )}
                    {(!field.i18n && editorContext.siteInfo.languages.length > 1) &&
                    <Chip
                                className={styles.badge}
                                icon={<Language/>}
                                label={t('jcontent:label.contentEditor.edit.sharedLanguages')}
                                color="default"
                            />}
                </>
                )}
                <div className="flexFluid"/>
                <DisplayAction
                    actionKey="content-editor/field/3dots"
                    editorContext={editorContext}
                    field={field}
                    selectorType={selectorType}
                    render={ButtonRenderer}
                />
            </div>}
            {field.description && (
            <Typography className={styles.inputDescription} variant="caption">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{__html: field.description}}/>
            </Typography>
        )}
            <div className="flexRow_nowrap alignCenter">
                <div className="flexFluid">
                    {isMultipleField ?
                        <MultipleField inputContext={inputContext}
                                       editorContext={editorContext}
                                       field={field}
                                       onChange={onChange}
                                       onBlur={onBlur}
                    /> :
                        <SingleField inputContext={inputContext}
                                     editorContext={editorContext}
                                     field={field}
                                     onChange={onChange}
                                     onBlur={onBlur}
                    />}
                </div>
                {inputContext.displayActions && registry.get('action', selectorType.key + 'Menu') && (
                <div className={styles.actions}>
                    <DisplayAction actionKey={selectorType.key + 'Menu'}
                                   field={field}
                                   selectorType={selectorType}
                                   inputContext={inputContext}
                                   render={ButtonRenderer}
                    />
                </div>
            )}
                {inputContext.actionRender && (
                <div>
                    {inputContext.actionRender}
                </div>
            )}
            </div>
            {inputContext.displayErrors && shouldDisplayErrors && (
            <Typography className={styles.errorMessage}
                        data-sel-error={shouldDisplayErrors && errorName}
            >
                {shouldDisplayErrors ?
                    field.errorMessage ?
                        field.errorMessage :
                        t(`jcontent:label.contentEditor.edit.errors.${errorName}`, {...buildFlatFieldObject(field), ...errorArgs}) :
                    ''}&nbsp;
            </Typography>
        )}
        </div>
    );
};

export const Field = ({inputContext, idInput, selectorType, field}) => {
    const {t} = useTranslation('jcontent');
    const formik = useFormikContext();
    const editorContext = useContentEditorContext();
    const {count} = useContentEditorConfigContext();
    const sectionsContext = useContentEditorSectionContext();
    const client = useApolloClient();

    const {errors, values, setFieldValue, setFieldTouched} = formik;
    const onChangeValue = useRef(undefined);

    const isMultipleField = field.multiple && !selectorType.supportMultiple;
    const seleniumFieldType = isMultipleField ? `GenericMultipleField${selectorType.key}` : (field.multiple ? `Multiple${selectorType.key}` : selectorType.key);
    const shouldDisplayErrors = errors[field.name];
    const splitError = shouldDisplayErrors && errors[field.name].split('_');
    const errorName = splitError && splitError.length > 0 && splitError[0];
    const errorArgs = splitError && splitError.length > 1 ? splitError.splice(1) : [];
    const hasMandatoryError = shouldDisplayErrors && errors[field.name] === 'required';
    const wipInfo = values[Constants.wip.fieldName];
    const pickerType = selectorType.pickerConfig?.key;

    // Lookup for registered on changes for given field selector type
    const registeredOnChanges = useMemo(() => [...registry.find({
        type: 'selectorType.onChange',
        target: selectorType.key
    }), ...registry.find({type: 'selectorType.onChange', target: '*'})], [selectorType.key]);

    const onChangeContext = useRef({});
    useEffect(() => {
        onChangeContext.current = {...editorContext, ...sectionsContext, formik, client};
    }, [editorContext, sectionsContext, formik, client]);

    const registeredOnChange = useCallback(_currentValue => {
        if (registeredOnChanges && registeredOnChanges.length > 0 && onChangeValue.current !== _currentValue) {
            registeredOnChanges.forEach(currentOnChange => {
                if (currentOnChange.onChange) {
                    try {
                        currentOnChange.onChange(onChangeValue.current, _currentValue, field, onChangeContext.current, selectorType, contentEditorHelper);
                    } catch (error) {
                        console.error(error);
                    }
                }
            });
        }

        onChangeValue.current = _currentValue;
    }, [field, registeredOnChanges, selectorType]);

    /**
     * Handles field value changes in the form.
     *
     * @param {string|{index, value}} _currentValue - The new value for the field. Can be:
     *   - An object with `index` and `value` properties for updating a specific item in a multi-value field
     *   - Any other value type for single-value fields or replacing the entire multi-value array
     * @param {boolean} [forceTouch=false] - If true, marks the field as touched immediately to trigger validation.
     *   By default, fields are not touched on change for performance (bulk validation is used instead).
     *
     * @description
     * The function performs the following steps:
     * 1. If an index is provided, updates only that specific item in the array
     * 2. Otherwise, replaces the entire field value
     * 3. Optionally marks the field as touched to trigger validation
     * 4. Notifies all registered onChange handlers with the new value
     */
    const onChange = useCallback((_currentValue, forceTouch) => {
        const {index, value} = _currentValue || {};

        let newValues;
        if (typeof index === 'number' && index >= 0 && value) {
            setFieldValue(field.name, prevValues => {
                const currentValues = [...prevValues];
                currentValues[index] = value;
                newValues = currentValues;
                return currentValues;
            });
        } else {
            // Update formik
            setFieldValue(field.name, _currentValue);
        }

        // We do not usually want to trigger touch field on change so we do bulk validation for performance.
        // use forceTouch if needed to force validation.
        if (forceTouch) {
            // https://github.com/jaredpalmer/formik/issues/2059
            setTimeout(() => setFieldTouched(field.name, true));
        }

        // Trigger on changes
        registeredOnChange(newValues || _currentValue);
    }, [field.name, registeredOnChange, setFieldValue, setFieldTouched]);

    const onBlur = useCallback(() => {
        setFieldTouched(field.name);
    }, [field.name, setFieldTouched]);

    const registeredOnChangeRef = useRef(registeredOnChange);
    useEffect(() => {
        registeredOnChangeRef.current = registeredOnChange;
    }, [registeredOnChange]);

    const initialValue = useRef(values[field.name]);

    const currentValue = values[field.name];

    useEffect(() => {
        if (initialValue.current !== null && initialValue.current !== undefined) {
            // Init
            registeredOnChangeRef.current(initialValue.current);
        }

        // Unmount
        return () => {
            registeredOnChangeRef.current(undefined);
        };
    }, [count]);

    useEffect(() => {
        registeredOnChangeRef.current(currentValue);
    }, [currentValue]);

    const firstField = sectionsContext.sections ? sectionsContext.sections[0]?.fieldSets[0]?.fields[0] === field : false;

    return (
        <div
            className={clsx(styles.formControl, {[styles.formControlError]: Boolean(shouldDisplayErrors)}, inputContext.selectorType?.containerStyle)}
            data-first-field={firstField}
            data-sel-content-editor-field={field.name}
            data-sel-content-editor-field-type={seleniumFieldType}
            data-sel-content-editor-field-picker-type={pickerType}
            data-sel-content-editor-field-readonly={field.readOnly}
            data-sel-content-editor-field-isMultiple={isMultipleField}
            data-sel-i18n={field.i18n}
        >
            {renderField(inputContext, field, isMultipleField, idInput, hasMandatoryError, t, wipInfo, editorContext, selectorType, onChange, onBlur, shouldDisplayErrors, errorName, errorArgs)}
        </div>
    );
};

Field.propTypes = {
    inputContext: PropTypes.object.isRequired,
    idInput: PropTypes.string.isRequired,
    selectorType: PropTypes.shape({
        key: PropTypes.string,
        supportMultiple: PropTypes.bool,
        pickerConfig: PropTypes.object
    }).isRequired,
    field: FieldPropTypes.isRequired
};
