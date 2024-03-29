import {BaseChildrenQuery} from './BaseQueryHandler.gql-queries';

export const BaseQueryHandler = {
    getQuery() {
        return BaseChildrenQuery;
    },

    structureData(parentPath, result) {
        const dataForParentPath = (result?.nodes || []).map(s => ({...s}));
        const structuredData = dataForParentPath.filter(d => d.parent.path === parentPath);
        setSubrows(structuredData, dataForParentPath);
        return {
            ...result,
            nodes: structuredData
        };

        // Recursively finds and puts children of data[i] in data[i].subRows
        function setSubrows(data, unstructuredData) {
            for (let i = 0; i < data.length; i++) {
                data[i].subRows = [];
                const rest = [];
                for (let j = 0; j < unstructuredData.length; j++) {
                    if (data[i].path === unstructuredData[j].parent.path) {
                        data[i].subRows.push(unstructuredData[j]);
                    } else {
                        rest.push(unstructuredData[j]);
                    }
                }

                setSubrows(data[i].subRows, rest);
            }
        }
    },

    getResults(data) {
        return data && data.jcr && data.jcr.nodeByPath && data.jcr.nodeByPath.children;
    },

    getFragments() {
        return [];
    },

    getQueryVariables({path, lang, uilang, pagination, sort, typeFilter}) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: typeFilter,
            fieldSorter: sort.orderBy ? {
                sortType: sort.order === 'DESC' ? 'DESC' : 'ASC',
                fieldName: sort.orderBy,
                ignoreCase: true
            } : null,
            recursionTypesFilter: {multi: 'NONE', types: ['nt:base']}
        };
    },

    isStructured: () => false
};
