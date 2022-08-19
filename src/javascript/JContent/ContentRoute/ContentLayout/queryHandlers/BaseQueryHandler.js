import {BaseChildrenQuery} from './BaseQueryHandler.gql-queries';

export const BaseQueryHandler = {
    getQuery() {
        return BaseChildrenQuery;
    },

    structureData(parentPath, result) {
        const dataForParentPath = result?.nodes || [];
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

    getQueryParams({path, lang, uilang, pagination, sort}) {
        return {
            path: path,
            language: lang,
            displayLanguage: uilang,
            offset: pagination.currentPage * pagination.pageSize,
            limit: pagination.pageSize,
            typeFilter: ['jnt:content'],
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'DESC' : 'ASC'),
                fieldName: sort.orderBy === '' ? null : sort.orderBy,
                ignoreCase: true
            },
            recursionTypesFilter: {multi: 'NONE', types: ['nt:base']}
        };
    },

    isStructured: () => false
};
