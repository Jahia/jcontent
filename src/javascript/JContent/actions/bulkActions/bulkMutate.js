import {parse} from 'graphql';

export const BULK_BATCH_SIZE = 50;

const aliasOf = index => `n${index}`;

/**
 * Builds one mutation document that changes every item of a batch.
 *
 * @param {Array} items the items of the batch, each with a `path`
 * @param {function} buildItem (item, index) => {declarations: string[], variables: object, selection: string}.
 *        `selection` is the body of the item's `mutateNode`, its variables must be suffixed with `index`.
 * @param {string[]} sharedDeclarations variable declarations used by every item, e.g. '$type: JCRPropertyType!'
 */
export const buildBulkDocument = ({items, buildItem, sharedDeclarations = []}) => {
    const declarations = [...sharedDeclarations];
    const variables = {};
    const selections = items.map((item, index) => {
        const built = buildItem(item, index);
        declarations.push(`$path${index}: String!`, ...built.declarations);
        variables[`path${index}`] = item.path;
        Object.assign(variables, built.variables);
        return `${aliasOf(index)}: mutateNode(pathOrId: $path${index}) { ${built.selection} }`;
    });

    return {
        document: parse(`mutation bulkMutate(${declarations.join(', ')}) { jcr(workspace: EDIT) { ${selections.join(' ')} } }`),
        variables
    };
};

/**
 * Maps the errors of a batch to the items they belong to.
 * An error without an item alias in its path is a failure of the whole batch.
 */
export const failedItems = (items, errors) => {
    if (!errors || errors.length === 0) {
        return [];
    }

    const byAlias = new Map(items.map((item, index) => [aliasOf(index), item]));
    const failed = new Map();
    errors.forEach(error => {
        const item = byAlias.get(error?.path?.[1]);
        const targets = item ? [item] : items;
        targets.forEach(target => {
            if (!failed.has(target.path)) {
                failed.set(target.path, {path: target.path, message: error?.message});
            }
        });
    });
    return [...failed.values()];
};

/**
 * Saves one change on many items, in batches of `batchSize` aliased `mutateNode` calls.
 * Continues after a failed item or a failed batch.
 *
 * @returns {Promise<{saved: string[], failed: {path: string, message: string}[]}>}
 */
export const bulkMutate = async ({client, items, buildItem, sharedDeclarations = [], sharedVariables = {}, batchSize = BULK_BATCH_SIZE}) => {
    const saved = [];
    const failed = [];

    for (let start = 0; start < items.length; start += batchSize) {
        const batch = items.slice(start, start + batchSize);
        const {document, variables} = buildBulkDocument({items: batch, buildItem, sharedDeclarations});
        let batchFailures;
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await client.mutate({mutation: document, variables: {...sharedVariables, ...variables}, errorPolicy: 'all'});
            batchFailures = failedItems(batch, result?.errors);
        } catch (error) {
            batchFailures = batch.map(item => ({path: item.path, message: error?.message}));
        }

        const failedPaths = new Set(batchFailures.map(failure => failure.path));
        failed.push(...batchFailures);
        saved.push(...batch.map(item => item.path).filter(path => !failedPaths.has(path)));
    }

    return {saved, failed};
};
