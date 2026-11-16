import gql from 'graphql-tag';

export const BULK_VALUE_FIELDS = {
    tag: {
        key: 'tag',
        mixin: 'jmix:tagged',
        property: 'j:tagList',
        type: 'STRING',
        isReference: false
    },
    categorize: {
        key: 'categorize',
        mixin: 'jmix:categorized',
        property: 'j:defaultCategory',
        type: 'WEAKREFERENCE',
        isReference: true
    }
};

export const BULK_VALUE_MODES = {
    ADD: 'add',
    REPLACE: 'replace',
    REMOVE: 'remove'
};

export const HeldValuesQuery = gql`
    query bulkHeldValues($paths: [String!]!, $property: String!) {
        jcr(workspace: EDIT) {
            nodesByPath(paths: $paths) {
                uuid
                workspace
                path
                property(name: $property) {
                    values
                }
            }
        }
    }
`;

/** What each item holds now, as stored: tag strings, or category uuids. */
export const heldValues = nodes => new Map((nodes || []).map(node => [node.path, node.property?.values || []]));

/** The values an item ends up with. */
export const finalValues = ({mode, held, chosen}) => {
    if (mode === BULK_VALUE_MODES.REPLACE) {
        return [...new Set(chosen)];
    }

    if (mode === BULK_VALUE_MODES.REMOVE) {
        return held.filter(value => !chosen.includes(value));
    }

    return [...new Set([...held, ...chosen])];
};

const sameValues = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * The items to write and what each one ends up with. An item that would not change is left out,
 * so that it is not marked as modified for nothing.
 */
export const itemsToWrite = ({paths, held, mode, chosen}) => paths
    .map(path => {
        const before = held.get(path) || [];
        return {path, before, values: finalValues({mode, held: before, chosen})};
    })
    .filter(item => !sameValues(item.before, item.values));

/** The `mutateNode` body for one item, for bulkMutate. Clearing the list deletes the property. */
export const valueFieldItem = item => (index, field) => (item.values.length === 0 ? {
    declarations: [],
    variables: {},
    selection: 'mutateProperty(name: $property) { delete }'
} : {
    declarations: [`$values${index}: [String]!`],
    variables: {[`values${index}`]: item.values},
    selection: `addMixins(mixins: ["${field.mixin}"]) mutateProperty(name: $property) { setValues(type: $type, values: $values${index}) }`
});

/** Whether the dialog can apply: replacing with nothing clears the items, the other modes need a value. */
export const canApplyValues = ({mode, chosen}) => mode === BULK_VALUE_MODES.REPLACE || chosen.length > 0;
