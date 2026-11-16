import gql from 'graphql-tag';

export const BulkFieldsQuery = gql`
    query bulkFields($paths: [String!]!, $language: String!) {
        jcr(workspace: EDIT) {
            nodesByPath(paths: $paths) {
                uuid
                workspace
                path
                primaryNodeType {
                    name
                    properties {
                        name
                        displayName(language: $language)
                        requiredType
                        multiple
                        internationalized
                        mandatory
                        hidden
                        protected
                        constraints
                    }
                }
            }
        }
    }
`;

export const EDITOR_KINDS = {
    TEXT: 'text',
    NUMBER: 'number',
    DATE: 'date',
    BOOLEAN: 'boolean',
    CHOICE: 'choice'
};

const NUMBER_TYPES = ['LONG', 'DOUBLE', 'DECIMAL'];
const EDITABLE_TYPES = ['STRING', 'BOOLEAN', 'DATE', ...NUMBER_TYPES];
export const REFERENCE_TYPES = ['REFERENCE', 'WEAKREFERENCE'];
const EXPORTABLE_TYPES = [...EDITABLE_TYPES, ...REFERENCE_TYPES, 'NAME', 'PATH', 'URI'];
const SYSTEM_PREFIXES = ['jcr:', 'j:', 'mix:', 'nt:', 'rep:'];

/**
 * Whether a property definition can be edited in bulk: a value an editor types or chooses,
 * not a system property, a reference, a binary or a wildcard definition.
 */
export const isBulkEditable = (definition, types = EDITABLE_TYPES, prefixes = SYSTEM_PREFIXES) => Boolean(definition) &&
    !definition.hidden &&
    !definition.protected &&
    definition.name !== '*' &&
    types.includes(definition.requiredType) &&
    !prefixes.some(prefix => definition.name.startsWith(prefix));

// An export reads `jcr:title` and the other `jcr:` properties an editor fills; the protected ones are already left out.
const EXPORT_EXCLUDED_PREFIXES = SYSTEM_PREFIXES.filter(prefix => prefix !== 'jcr:');

/** Whether a property definition can be exported: an editable one, a reference or a name, path or URI. */
export const isExportable = definition => isBulkEditable(definition, EXPORTABLE_TYPES, EXPORT_EXCLUDED_PREFIXES);

export const editorKind = field => {
    if (field.requiredType === 'BOOLEAN') {
        return EDITOR_KINDS.BOOLEAN;
    }

    if (field.requiredType === 'DATE') {
        return EDITOR_KINDS.DATE;
    }

    if (NUMBER_TYPES.includes(field.requiredType)) {
        return EDITOR_KINDS.NUMBER;
    }

    return field.constraints?.length > 0 ? EDITOR_KINDS.CHOICE : EDITOR_KINDS.TEXT;
};

/**
 * The fields that every selected item has: the editable properties of the first item's type that
 * the type of every other selected item also declares, with the same type and cardinality.
 *
 * @param nodes the selected nodes, with `primaryNodeType.properties`
 * @param keep the filter of the definitions to keep, isBulkEditable by default
 * @returns {Array} fields sorted by label, each a property definition with `key`, `label` and `kind`
 */
export const commonFields = (nodes, keep = isBulkEditable) => {
    const types = new Map();
    (nodes || []).forEach(node => {
        if (node?.primaryNodeType) {
            types.set(node.primaryNodeType.name, node.primaryNodeType.properties || []);
        }
    });

    if (types.size === 0) {
        return [];
    }

    const [first, ...others] = [...types.values()];
    const sameDefinition = (definition, candidates) => candidates.some(candidate => candidate.name === definition.name &&
        candidate.requiredType === definition.requiredType &&
        candidate.multiple === definition.multiple);

    const byName = new Map();
    first.filter(definition => keep(definition))
        .filter(definition => others.every(properties => sameDefinition(definition, properties)))
        .forEach(definition => byName.set(definition.name, definition));

    return [...byName.values()]
        .map(definition => ({
            ...definition,
            key: definition.name,
            label: definition.displayName || definition.name,
            kind: editorKind(definition)
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * The value to store for what the editor entered: a date input gives a day, which is stored as
 * the start of that day in the editor's time zone.
 */
export const toStoredValue = (field, value) => {
    if (field.kind === EDITOR_KINDS.DATE && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T00:00:00`).toISOString();
    }

    return String(value ?? '');
};

/** Whether the dialog has a value it can save for this field. */
export const canSave = ({field, value, isClearing}) => {
    if (!field) {
        return false;
    }

    if (isClearing) {
        return !field.mandatory;
    }

    return field.multiple ? (value || []).length > 0 : String(value ?? '').trim() !== '';
};

/**
 * The `mutateNode` body that sets or clears one property on one item, for bulkMutate.
 * A translated property is written in `language` only.
 */
export const replaceValueItem = ({field, value, isClearing, language}) => (item, index) => {
    const languageArgument = field.internationalized ? `language: $language${index}` : '';
    const variables = field.internationalized ? {[`language${index}`]: language} : {};
    const declarations = field.internationalized ? [`$language${index}: String`] : [];

    if (isClearing) {
        return {
            declarations,
            variables,
            selection: `mutateProperty(name: $property) { delete${languageArgument ? `(${languageArgument})` : ''} }`
        };
    }

    const separator = languageArgument ? ', ' : '';
    if (field.multiple) {
        return {
            declarations: [...declarations, `$values${index}: [String]!`],
            variables: {...variables, [`values${index}`]: (value || []).map(entry => toStoredValue(field, entry))},
            selection: `mutateProperty(name: $property) { setValues(${languageArgument}${separator}type: $type, values: $values${index}) }`
        };
    }

    return {
        declarations: [...declarations, `$value${index}: String!`],
        variables: {...variables, [`value${index}`]: toStoredValue(field, value)},
        selection: `mutateProperty(name: $property) { setValue(${languageArgument}${separator}type: $type, value: $value${index}) }`
    };
};
