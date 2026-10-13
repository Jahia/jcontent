import {useCallback} from 'react';
import {validate} from '~/ContentEditor/validation';
import {getDynamicFieldSets, getFields, isSameValue} from '~/ContentEditor/utils/index';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {useFormikContext} from 'formik';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

function fillValues({newValues, previousValues, fieldsObj, i18nValues, nonI18nValues, dynamicFieldSets}) {
    Object.keys(newValues)
        .filter(key => (newValues[key] !== previousValues[key]))
        .forEach(key => {
            if (fieldsObj[key]) {
                if (fieldsObj[key].i18n) {
                    i18nValues.values[key] = newValues[key];
                } else {
                    nonI18nValues.values[key] = newValues[key];
                }
            } else if (typeof dynamicFieldSets[key] === 'boolean') {
                nonI18nValues.values[key] = newValues[key];
            }
        });
}

// Sibling mixins each hold their own copy of a property they inherit from a shared supertype (see
// adaptSections.ts). An edit sits in the copy of the mixin active at the time, so the bucket of the
// language left stores every copy, with the value of the copy the reader sees: a mixin switched on
// later then shows the edit in that language, and the save writes it. Only a group with a copy in the
// bucket changed, and a group the reader sees with its stored value leaves the bucket, as fillValues
// keeps only changed values. Without an active copy, after a switch to a mixin that has none, the
// copies hold the value a switch carried, and any of them serves.
export function fillSiblingCopies({fields, dynamicFieldSets, values, initialValues, i18nValues}) {
    const groups = new Map();
    fields
        .filter(field => field.i18n && field.declaringNodeType && Object.hasOwn(dynamicFieldSets, field.nodeType))
        .forEach(field => {
            const key = `${field.declaringNodeType}|${field.propertyName}`;
            if (groups.has(key)) {
                groups.get(key).push(field);
            } else {
                groups.set(key, [field]);
            }
        });

    [...groups.values()]
        .filter(group => group.length > 1)
        .forEach(group => {
            const inBucket = group.find(field => Object.hasOwn(i18nValues.values, field.name));
            if (!inBucket) {
                return;
            }

            const seen = group.find(field => values[field.nodeType] === true);
            const value = seen ? values[seen.name] : i18nValues.values[inBucket.name];
            if (value === undefined) {
                return;
            }

            const unchanged = isSameValue(value, initialValues[(seen || inBucket).name]);
            group.forEach(field => {
                if (unchanged) {
                    delete i18nValues.values[field.name];
                } else {
                    i18nValues.values[field.name] = Array.isArray(value) ? [...value] : value;
                }
            });
        });
}

function fillErrors(validation, fieldsObj, i18nValues) {
    Object.keys(validation).forEach(key => {
        if (fieldsObj[key]) {
            if (fieldsObj[key].i18n) {
                i18nValues.validation[key] = validation[key];
            }
        }
    });
}

export const useSwitchLanguage = () => {
    const formik = useFormikContext();
    const {setI18nContext} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    const {lang: previousLanguage, updateEditorConfig, sideBySideContext, setSideBySideContext} = useContentEditorConfigContext();

    return useCallback(newLanguage => {
        const fields = sections && getFields(sections).filter(field => !field.readOnly);
        const dynamicFieldSets = getDynamicFieldSets(sections);

        const fieldsObj = fields.reduce((r, f) => Object.assign(r, {[f.name]: f}), {});
        // Add WIP to filtered names as it is not part of any section
        fieldsObj[Constants.wip.fieldName] = {i18n: false};

        setI18nContext(prev => {
            const previousValues = {
                ...formik.initialValues,
                ...prev.shared?.values,
                ...prev[previousLanguage]?.values
            };

            const i18nValues = {
                values: {...prev[previousLanguage]?.values},
                validation: {}
            };
            const nonI18nValues = {
                values: {...prev.shared?.values},
                validation: {}
            };

            fillValues({newValues: formik.values, previousValues, fieldsObj, i18nValues, nonI18nValues, dynamicFieldSets});
            fillSiblingCopies({fields, dynamicFieldSets, values: formik.values, initialValues: formik.initialValues, i18nValues});

            if (Object.keys(i18nValues.values).length > 0 && Object.keys(nonI18nValues.values).length === 0) {
                const systemName = Object.keys(formik.values).find(fieldname => fieldname.endsWith('systemName'));
                nonI18nValues.values[systemName] = formik.values[systemName];
            }

            const newValues = Object.keys(nonI18nValues.values).length > 0 ? {shared: nonI18nValues} : {};

            if (Object.keys(i18nValues.values).length > 0) {
                const validation = validate(sections)(formik.values);
                fillErrors(validation, fieldsObj, i18nValues);
                newValues[previousLanguage] = i18nValues;
            }

            if (prev.memo?.systemNameLang === undefined && newValues?.shared?.values && Object.keys(newValues.shared.values).includes(Constants.systemName.name)) {
                newValues.memo = {
                    ...prev.memo,
                    systemNameLang: previousLanguage
                };
            }

            return {
                ...prev,
                ...newValues
            };
        });

        if (sideBySideContext.enabled) {
            setSideBySideContext(prev => ({...prev, lang: newLanguage}));
        } else {
            updateEditorConfig({
                lang: newLanguage
            });
        }
    }, [updateEditorConfig, formik, sections, setI18nContext, previousLanguage, sideBySideContext.enabled, setSideBySideContext]);
};
