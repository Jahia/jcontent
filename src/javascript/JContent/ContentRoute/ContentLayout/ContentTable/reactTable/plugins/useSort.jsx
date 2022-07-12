import {useDispatch, useSelector} from 'react-redux';
import {useGetLatest} from 'react-table';

const DESC = 'DESC';
const ASC = 'ASC';

export const useSort = (selector, actions) => hooks => {
    hooks.getSortProps = defaultGetSortProps;
    hooks.useInstance.push(getUseInstance(selector, actions));
};

useSort.pluginName = 'useSort';

const defaultGetSortProps = (props, {instance, column}) => {
    return [
        props,
        {
            onClick: () => {
                instance.sortColumn(column);
            },
            style: {
                cursor: 'pointer'
            }
        }
    ];
};

const getUseInstance = (selector, actions) => instance => {
    const getInstance = useGetLatest(instance);
    const {getHooks, flatHeaders} = instance;
    const {order, orderBy} = useSelector(selector);
    const dispatch = useDispatch();

    const toggleOrder = order => {
        return order === DESC ? ASC : DESC;
    };

    const sortColumn = column => {
        dispatch(actions.setSortAction({
            order: orderBy === column.property ? toggleOrder(order) : order,
            orderBy: column.property
        }));
    };

    flatHeaders
        .forEach(column => {
            column.getSortProps = () => [];
            if (column.sortable) {
                column.sortDirection = 'descending';
                column.getSortProps = () => getHooks().getSortProps({}, {
                    instance: getInstance(),
                    column: column
                });

                if (column.property === orderBy) {
                    column.sorted = true;
                    column.sortDirection = order === DESC ? 'descending' : 'ascending';
                } else {
                    column.sorted = false;
                }
            }
        });

    Object.assign(instance, {
        sortColumn
    });
};

