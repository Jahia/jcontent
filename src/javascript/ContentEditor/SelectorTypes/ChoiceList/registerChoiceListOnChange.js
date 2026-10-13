import {getFields} from '~/ContentEditor/utils/fields.utils';

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

const isSameProperty = (field, otherField) =>
    field.propertyName === otherField.propertyName && field.declaringNodeType === otherField.declaringNodeType;

// Sibling mixins each hold their own copy of a property they inherit from a shared supertype (see
// adaptSections.ts), but the node stores it once. The copy of the mixin being switched on still holds
// the value from when the form loaded, so it takes the value of the copy being switched off.
function carrySharedValues(oldMixins, newMixins, sections, formik) {
    const fields = getFields(sections);
    const oldFields = fields.filter(f => oldMixins.includes(f.nodeType));
    fields
        .filter(f => newMixins.includes(f.nodeType) && !oldMixins.includes(f.nodeType))
        .forEach(newField => {
            const oldField = oldFields.find(f => isSameProperty(f, newField));
            if (oldField && formik.values[oldField.name] !== formik.values[newField.name]) {
                formik.setFieldValue(newField.name, formik.values[oldField.name]);
            }
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
