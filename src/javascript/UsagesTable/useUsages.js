import {useQuery} from '@apollo/client';
import {UsagesQuery} from './UsagesTable.gql-queries';

// Sort contract: {order: 'ASC'|'DESC'|'', orderBy: 'displayName'|''} — same as UsagesTable
export const useUsages = (path, language, sort) => {
    let sortType = null;
    if (sort.order !== '') {
        sortType = sort.order === 'DESC' ? 'DESC' : 'ASC';
    }

    const {data, loading, error} = useQuery(UsagesQuery, {
        variables: {
            path,
            language,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType,
                fieldName: sort.orderBy === '' ? null : 'node.' + sort.orderBy,
                ignoreCase: true
            }
        },
        fetchPolicy: 'cache-and-network',
        skip: !path
    });

    const usagesCount = data?.jcr?.nodeByPath?.usagesCount;
    const usages = data?.jcr?.nodeByPath?.usages?.nodes ? Object.values(data.jcr.nodeByPath.usages.nodes.reduce((acc, ref) => (
        {
            ...acc,
            [ref.node.uuid]: {
                ...ref.node,
                locales: ref.properties.map(property => property.language)
            }
        }
    ), {})) : [];
    const visibleUsages = usages.reduce((prev, current) => prev + current.locales.length, 0);

    return {usages, usagesCount, visibleUsages, loading, error};
};
