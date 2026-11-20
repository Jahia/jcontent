import {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {cmSetPage} from '~/JContent/redux/pagination.redux';
import {cmClearSelection} from '~/JContent/redux/selection.redux';
import {readFilters, setFilterIn, withFilters} from './filterParams';

/**
 * The filters of the current list, kept in the jContent URL in `params.filters`.
 * A change goes back to page 1 and clears the selection, in one history entry.
 * The hook does not check the fields: the view checks each filter against its field list.
 *
 * @returns {{filters: Array, setFilters: Function, setFilter: Function, clearFilter: Function, clearAll: Function}}
 */
export const useFilters = () => {
    const dispatch = useDispatch();
    const params = useSelector(state => state.jcontent.params);
    const filters = useMemo(() => readFilters(params), [params]);

    const setFilters = useCallback(next => {
        dispatch(batchActions([
            cmGoto({params: withFilters(params, next)}),
            cmSetPage(0),
            cmClearSelection()
        ]));
    }, [dispatch, params]);

    const setFilter = useCallback(filter => setFilters(setFilterIn(filters, filter)), [setFilters, filters]);
    const clearFilter = useCallback(field => setFilters(filters.filter(filter => filter.field !== field)), [setFilters, filters]);
    const clearAll = useCallback(() => setFilters([]), [setFilters]);

    return {filters, setFilters, setFilter, clearFilter, clearAll};
};
