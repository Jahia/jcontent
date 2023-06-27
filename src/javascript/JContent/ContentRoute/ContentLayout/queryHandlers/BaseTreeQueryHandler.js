import JContentConstants from '~/JContent/JContent.constants';

export const BaseTreeQueryHandler = {
    structureTreeEntries: (treeEntries, {hideRoot}) => {
        const stack = [];
        const nodes = [];
        treeEntries.forEach(entry => {
            const node = {
                ...entry.node,
                subRows: [],
                hasSubRows: entry.openable && entry.node.children.pageInfo.nodesCount > 0
            };
            const depth = hideRoot ? entry.depth : entry.depth + 1;
            while (depth <= stack.length) {
                stack.pop();
            }

            if (stack.length === 0) {
                nodes.push(node);
            } else {
                const nodeOnTop = stack[stack.length - 1];
                if (nodeOnTop.hasSubRows) {
                    nodeOnTop.subRows.push(node);
                }
            }

            stack.push(node);
        });

        return {
            nodes,
            pageInfo: {
                totalCount: nodes.length
            }
        };
    },

    getTreeParams: ({path, openPaths, openableTypes, selectableTypes, sort, hideRoot, tableView}) => ({
        rootPaths: [path],
        openPaths: [...new Set([path, ...openPaths])],
        selectedPaths: [],
        openableTypes,
        selectableTypes,
        hideRoot: hideRoot !== false,
        sortBy: sort.orderBy === '' || tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED ? null : {
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
