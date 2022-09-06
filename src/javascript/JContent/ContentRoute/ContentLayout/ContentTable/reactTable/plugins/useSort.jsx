import {useGetLatest} from 'react-table';

const DESC = 'DESC';
const ASC = 'ASC';

export const useSort = hooks => {
    hooks.getSortProps = defaultGetSortProps;
    hooks.useInstance.push(useInstance);
};

useSort.pluginName = 'useSort';

const toggleOrder = order => {
    return order === DESC ? ASC : DESC;
};

const defaultGetSortProps = (props, {instance, column}) => {
    return [
        props,
        {
            onClick: () => {
                instance.onSort(column, instance.sort.orderBy === column.property ? toggleOrder(instance.sort.order) : instance.sort.order);
            },
            style: {
                cursor: 'pointer'
            }
        }
    ];
};

function useInstance(instance) {
    const getInstance = useGetLatest(instance);
    const {getHooks, flatHeaders} = instance;

    flatHeaders
        .forEach(column => {
            column.getSortProps = () => [];
            if (column.sortable) {
                column.sortDirection = 'descending';
                column.getSortProps = () => getHooks().getSortProps({}, {
                    instance: getInstance(),
                    column: column
                });

                if (column.property === instance.sort.orderBy) {
                    column.sorted = true;
                    column.sortDirection = instance.sort.order === DESC ? 'descending' : 'ascending';
                } else {
                    column.sorted = false;
                }
            }
        });
}

