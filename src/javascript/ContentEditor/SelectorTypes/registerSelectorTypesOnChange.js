import {getFields} from '~/ContentEditor/utils/fields.utils';
import {FieldConstraints} from './registerSelectorTypesOnChange.gql-queries';

function arrayEquals(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => {
        if (isObject(value)) {
            return JSON.stringify(value) === JSON.stringify(arr2[index]);
        }

        if (isArray(value)) {
            return arrayEquals(value, arr2[index]);
        }

        return value === arr2[index];
    });
}

const isObject = object => {
    return object !== null && typeof object === 'object';
};

const isArray = array => {
    return Array.isArray(array);
};

/**
 * Replace every fieldSet and field with a shallow copy, so that components memoizing on a field
 * reference see the change. A field mutated in place is invisible to them on its own.
 *
 * @param {Array} sections - the form sections, modified in place
 */
export function recreateSections(sections) {
    sections.forEach(section => {
        section.fieldSets = section.fieldSets.map(fieldSet => ({
            ...fieldSet,
            fields: fieldSet.fields.map(f => ({
                ...f
            }))
        }));
    });
}

// Latest FieldConstraints request id per dependent field, per sections generation. Concurrent
// requests for the same field (e.g. the value transitions around a language switch) can resolve
// out of order; only the last-issued one may apply.
const constraintsTickets = new WeakMap();

const takeTicket = (sections, fieldName) => {
    let byField = constraintsTickets.get(sections);
    if (!byField) {
        byField = new Map();
        constraintsTickets.set(sections, byField);
    }

    const ticket = (byField.get(fieldName) || 0) + 1;
    byField.set(fieldName, ticket);
    return ticket;
};

const isLatestTicket = (sections, fieldName, ticket) => constraintsTickets.get(sections)?.get(fieldName) === ticket;

const applyFieldConstraints = (results, sections) => {
    let updated = false;
    results.forEach(({data, dependentPropertiesField, ticket}) => {
        if (data?.forms?.fieldConstraints && isLatestTicket(sections, dependentPropertiesField.name, ticket)) {
            const fieldToUpdate = getFields(sections).find(f => f.name === dependentPropertiesField.name);
            if (fieldToUpdate && !arrayEquals(fieldToUpdate.valueConstraints, data.forms.fieldConstraints)) {
                // Update field in place (for those who keep a constant ref on sectionsContext)
                fieldToUpdate.valueConstraints = data.forms.fieldConstraints;
                // And recreate the full sections object to make change detection work
                recreateSections(sections);
                updated = true;
            }
        }
    });
    return updated;
};

export const registerSelectorTypesOnChange = registry => {
    registry.add('selectorType.onChange', 'dependentProperties', {
        targets: ['*'],
        onChange: (previousValue, currentValue, field, onChangeContext) => {
            const sections = onChangeContext.sections;
            const fields = getFields(sections);
            // Not dynamic, or dynamic and activated: a value read from these comes from what the reader
            // is editing rather than from an inactive sibling still holding its default.
            const activeFields = getFields(sections, undefined, fieldset => !fieldset.dynamic || fieldset.activated);
            const dependentPropertiesFields = fields
                .filter(f => f.selectorOptions
                    .find(s => s.name === 'dependentProperties' && s.value.includes(field.propertyName))
                );

            Promise.all(dependentPropertiesFields.map(dependentPropertiesField => {
                const dependentProperties = dependentPropertiesField.selectorOptions.find(f => f.name === 'dependentProperties').value.split(',');
                if (dependentProperties.length > 0) {
                    const context = buildContext(dependentProperties, {
                        field,
                        currentValue,
                        fields,
                        activeFields,
                        formik: onChangeContext.formik
                    });

                    const ticket = takeTicket(sections, dependentPropertiesField.name);

                    return onChangeContext.client.query({
                        query: FieldConstraints,
                        variables: {
                            uuid: onChangeContext.mode === 'create' ? null : onChangeContext.nodeData.uuid,
                            parentUuid: onChangeContext.mode === 'create' ? onChangeContext.nodeData.uuid : onChangeContext.nodeData.parent.uuid,
                            primaryNodeType: onChangeContext.mode === 'create' ? onChangeContext.nodeTypeName : onChangeContext.nodeData.primaryNodeType.name,
                            nodeType: dependentPropertiesField.nodeType,
                            fieldName: dependentPropertiesField.propertyName,
                            context: context,
                            uilang: onChangeContext.uilang || onChangeContext.lang,
                            language: onChangeContext.lang
                        }
                    }).then(({data}) => ({
                        data,
                        dependentPropertiesField,
                        ticket
                    }));
                }

                return undefined;
            })).then(results => {
                if (applyFieldConstraints(results, sections)) {
                    onChangeContext.onSectionsUpdate();
                    console.debug(`Triggering update to field ${field.name} due to dependentProperties change.`);
                }
            });
        }
    });
};

const buildContext = (dependentProperties, {field, currentValue, fields, activeFields, formik}) => {
    const context = [{
        key: 'dependentProperties', value: dependentProperties.join(',')
    }];

    // A sibling copy of an inherited field (see adaptSections.ts) shares its propertyName with copies in
    // other fieldsets, some of them inactive. The active copies are the ones in play, so they are read
    // first and the full set is only a fallback.
    const resolveDependentField = propertyName =>
        activeFields.find(f => f.propertyName === propertyName) ||
        fields.find(f => f.propertyName === propertyName);

    dependentProperties
        .filter(dependentProperty => dependentProperty !== field.propertyName)
        .forEach(dependentProperty => {
            const dependentField = resolveDependentField(dependentProperty);
            if (dependentField) {
                context.push({
                    key: dependentProperty,
                    value: formik.values[dependentField.name]
                });
            }
        });

    // Set value to empty array in case of null to be consistent with old implementation.
    context.push({
        key: field.propertyName,
        value: currentValue === null ? [] : currentValue
    });

    return context;
};
