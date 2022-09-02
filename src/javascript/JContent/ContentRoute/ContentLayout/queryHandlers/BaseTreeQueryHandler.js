export const BaseTreeQueryHandler = {
    structureTreeEntries: treeEntries => {
        const stack = [];
        const nodes = [];
        treeEntries.forEach(entry => {
            const node = {
                ...entry.node,
                subRows: [],
                hasSubRows: entry.node.children.pageInfo.nodesCount > 0
            };

            while (entry.depth <= stack.length) {
                stack.pop();
            }

            if (stack.length === 0) {
                nodes.push(node);
            } else {
                stack[stack.length - 1].subRows.push(node);
            }

            stack.push(node);
        });

        return {
            nodes,
            pageInfo: {}
        };
    },

    getTreeParams: ({path, openPaths, params, sort}) => ({
        rootPaths: [path],
        openPaths: [...new Set([path, ...openPaths])],
        selectedPaths: [],
        openableTypes: params.openableTypes,
        selectableTypes: params.selectableTypesTable,
        hideRoot: true,
        sortBy: sort.orderBy === '' ? null : {
            sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'DESC' : 'ASC'),
            fieldName: sort.orderBy === '' ? null : sort.orderBy,
            ignoreCase: true
        }
    }),

    getFragments() {
        return [];
    },

    getQueryVariables({path, lang, uilang}) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            typeFilter: ['jnt:content']
        };
    },

    isStructured: () => true
};
