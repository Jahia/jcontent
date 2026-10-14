import {getDynamicFieldSets, getFields, isSameValue} from '~/ContentEditor/utils/fields.utils';

function getMixinList(field, fieldValue) {
    let mixins = [];

    const findAddMixin = value => field.valueConstraints
        ?.find(valueConstraint => valueConstraint.value.string === value)?.properties
        ?.find(property => property.name === 'addMixin')?.value;

    if (field.multiple) {
        fieldValue.forEach(value => {
            const mixin = findAddMixin(value);
            if (mixin) {
                mixins.push(mixin);
            }
        });
    } else {
        const mixin = findAddMixin(fieldValue);
        if (mixin) {
            mixins.push(mixin);
        }
    }

    return mixins;
}

const isSameProperty = (field, otherField) => Boolean(field.declaringNodeType) &&
    field.propertyName === otherField.propertyName && field.declaringNodeType === otherField.declaringNodeType;

// Sibling mixins each hold their own copy of a property they inherit from a shared supertype (see
// adaptSections.ts), but the node stores it once, and a copy takes its value only when the form loads.
// A switch therefore gives every other copy the value of the copy the reader sees: one in a mixin that
// stays active, or else one in a mixin switched off. A copy that holds no value carries nothing, as
// Formik deletes a key set to undefined and the copy switched on would lose its default.
function carrySharedValues(oldMixins, newMixins, sections, formik) {
    const isKept = mixin => (oldMixins.includes(mixin) ? newMixins.includes(mixin) : !newMixins.includes(mixin) && formik.values[mixin] === true);
    const isSwitchedOff = mixin => oldMixins.includes(mixin) && !newMixins.includes(mixin);
    const hasValue = field => Object.hasOwn(formik.values, field.name) && formik.values[field.name] !== undefined;
    // A field switched on has moved next to the choicelist, so its fieldset is no longer its mixin's
    const dynamicFieldSets = getDynamicFieldSets(sections);
    const copies = getFields(sections).filter(field => Object.hasOwn(dynamicFieldSets, field.nodeType));

    // Two mixins switched off can share a property, and its group is carried once
    const carried = new Set();
    copies
        .filter(field => isSwitchedOff(field.nodeType))
        .forEach(switchedOff => {
            if (carried.has(switchedOff)) {
                return;
            }

            const group = copies.filter(field => isSameProperty(field, switchedOff));
            group.forEach(field => carried.add(field));
            const source = group.find(field => isKept(field.nodeType) && hasValue(field)) ||
                group.find(field => isSwitchedOff(field.nodeType) && hasValue(field));
            if (!source) {
                return;
            }

            const value = formik.values[source.name];
            group
                .filter(field => field !== source && !isKept(field.nodeType) && !isSameValue(formik.values[field.name], value))
                .forEach(field => formik.setFieldValue(field.name, Array.isArray(value) ? [...value] : value));
        });
}

export const registerChoiceListOnChange = registry => {
    registry.add('selectorType.onChange', 'addMixinChoicelist', {
        targets: ['Choicelist', 'MultipleLeftRightSelector'],
        // eslint-disable-next-line max-params
        onChange: (previousValue, currentValue, field, onChangeContext, selectorType, helper) => {
            let editorSection = onChangeContext.sections;

            let oldMixins = previousValue ? getMixinList(field, previousValue) : [];

            if (oldMixins.length === 0 && currentValue === undefined) {
                // If no mixin and no new value, do nothing
                return;
            }

            oldMixins.forEach(mixin => {
                helper.moveMixinToInitialFieldset(mixin, editorSection, onChangeContext.formik);
            });

            let newMixins = currentValue ? getMixinList(field, currentValue) : [];
            newMixins.forEach(mixin => {
                helper.moveMixinToTargetFieldset(mixin, field.nodeType, editorSection, field, onChangeContext.formik);
            });

            carrySharedValues(oldMixins, newMixins, editorSection, onChangeContext.formik);

            if (onChangeContext.onSectionsUpdate) {
                onChangeContext.onSectionsUpdate();
            }
        }
    });
};
