import {isExportable, REFERENCE_TYPES} from '~/JContent/actions/bulkActions/bulkFields';
import type {FilterField, FilterFieldOption, FilterKind} from './filters.types';

const LABEL_PREFIX = 'jcontent:label.contentManager.filters.fields';

type StandardField = Omit<FilterField, 'label'> & {labelKey: string};

/**
 * The fields of every list: every item has these properties.
 * Last modified and Modified by are not offered: a query matches them on the translations too, where the table cannot show them.
 */
export const STANDARD_FILTER_FIELDS: readonly StandardField[] = Object.freeze([
    {key: 'std:created', labelKey: `${LABEL_PREFIX}.created`, property: 'jcr:created', kind: 'date'},
    {key: 'std:createdBy', labelKey: `${LABEL_PREFIX}.createdBy`, property: 'jcr:createdBy', kind: 'text'},
    {key: 'std:lastPublished', labelKey: `${LABEL_PREFIX}.lastPublished`, property: 'j:lastPublished', kind: 'date'},
    {key: 'std:lastPublishedBy', labelKey: `${LABEL_PREFIX}.lastPublishedBy`, property: 'j:lastPublishedBy', kind: 'text'},
    {key: 'std:tags', labelKey: `${LABEL_PREFIX}.tags`, property: 'j:tagList', kind: 'text', multiple: true},
    {key: 'std:systemName', labelKey: `${LABEL_PREFIX}.systemName`, property: 'j:nodename', kind: 'text', looseSeparators: true},
    {key: 'std:type', labelKey: `${LABEL_PREFIX}.type`, property: 'jcr:primaryType', kind: 'choice'}
] as StandardField[]);

/** A property definition, as the `nodeTypeByName` query returns it. */
export type PropertyDefinition = {
    name: string;
    displayName?: string;
    requiredType: string;
    multiple?: boolean;
    hidden?: boolean;
    protected?: boolean;
    constraints?: string[];
};

/** A field of the Content Editor form, as the `createForm` query returns it. */
export type FormField = {
    name: string;
    selectorType?: string;
    valueConstraints?: {value?: {string?: string}; displayValue?: string}[];
};

type Translate = (key: string) => string;

const NUMBER_TYPES = ['LONG', 'DOUBLE', 'DECIMAL'];
const MEDIA_CONSTRAINT_PARTS = ['image', 'video', 'audio', 'file'];

// A constraint comes expanded, `{http://www.jahia.org/jahia/mix/1.0}image`, or prefixed, `jmix:image`
const constraintLocalName = (constraint: string): string => String(constraint || '')
    .replace(/^\{[^}]*\}/, '')
    .replace(/^[^:\s]+:/, '')
    .toLowerCase();

/** Whether a reference points at a media file: its constraint names an image, a video, an audio file or a file. */
export const isMediaReference = (definition: PropertyDefinition): boolean => REFERENCE_TYPES.includes(definition.requiredType) &&
    (definition.constraints || []).some(constraint => {
        const name = constraintLocalName(constraint);
        return MEDIA_CONSTRAINT_PARTS.some(part => name.includes(part));
    });

// The selectors that pick from the values of the form. A text or number field gives its range or pattern as a value
// constraint too, such as `(0,)` or `.{0,255}`, which is no value to pick
const LIST_SELECTOR = /choicelist|multipleleftright|checkboxes/i;

const valueOptions = (formField: FormField | undefined): FilterFieldOption[] => (LIST_SELECTOR.test(formField?.selectorType || '') ? formField?.valueConstraints || [] : [])
    .map(constraint => ({value: constraint.value?.string ?? '', label: constraint.displayValue || constraint.value?.string || ''}))
    .filter(option => option.value !== '');

const kindOf = (definition: PropertyDefinition, options: FilterFieldOption[]): FilterKind | null => {
    if (REFERENCE_TYPES.includes(definition.requiredType)) {
        return isMediaReference(definition) ? 'media' : null;
    }

    if (definition.requiredType === 'BOOLEAN') {
        return 'boolean';
    }

    if (definition.requiredType === 'DATE') {
        return 'date';
    }

    if (options.length > 0) {
        return 'choice';
    }

    return NUMBER_TYPES.includes(definition.requiredType) ? 'number' : 'text';
};

/**
 * The field of a property, or null when the property gives no field: a reference to a content item, a rich text,
 * a binary, a hidden or a protected property. The rules of the Bulk menu and the export decide which properties count.
 * With no form field, a property is offered: a slow form does not block the list.
 */
export const propertyToFilterField = (definition: PropertyDefinition, formField?: FormField): FilterField | null => {
    if (!isExportable(definition)) {
        return null;
    }

    if (String(formField?.selectorType || '').toLowerCase() === 'richtext') {
        return null;
    }

    const options = valueOptions(formField);
    const kind = kindOf(definition, options);
    if (!kind) {
        return null;
    }

    return {
        key: `prop:${definition.name}`,
        label: definition.displayName || definition.name,
        kind,
        property: definition.name,
        multiple: Boolean(definition.multiple),
        ...(kind === 'choice' && {options})
    };
};

/**
 * The fields of a list: the standard fields first, then the properties of the content type in the order of its definition.
 * A property that a standard field already covers gives no second field.
 */
export const buildFilterFields = ({
    t,
    definitions = [],
    formFields = [],
    contentTypes = []
}: {
    t: Translate;
    definitions?: PropertyDefinition[];
    formFields?: FormField[];
    contentTypes?: FilterFieldOption[];
}): FilterField[] => {
    const standard: FilterField[] = STANDARD_FILTER_FIELDS.map(({labelKey, ...field}) => ({
        ...field,
        label: t(labelKey),
        ...(field.key === 'std:type' && {options: contentTypes})
    }));
    const standardProperties = new Set(standard.map(field => field.property));
    const formByName = new Map(formFields.map(formField => [formField.name, formField]));
    const seen = new Set<string>();

    const properties = definitions
        .filter(definition => !standardProperties.has(definition.name))
        .map(definition => propertyToFilterField(definition, formByName.get(definition.name)))
        .filter((field): field is FilterField => {
            if (!field || seen.has(field.key)) {
                return false;
            }

            seen.add(field.key);
            return true;
        });

    return [...standard, ...properties];
};

/** The form fields of the `createForm` query, flattened. */
export const formFieldsOf = (form: {sections?: {fieldSets?: {fields?: FormField[]}[]}[]} | undefined): FormField[] => (form?.sections || [])
    .flatMap(section => section.fieldSets || [])
    .flatMap(fieldSet => fieldSet.fields || []);
