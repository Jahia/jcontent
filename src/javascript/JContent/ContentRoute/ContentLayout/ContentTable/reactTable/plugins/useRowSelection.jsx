import {useDispatch, useSelector} from 'react-redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '~/JContent/redux/selection.redux';
import {useGetLatest} from 'react-table';
import {flattenTree} from '../../../ContentLayout.utils';
import {useState} from 'react';

export const useRowSelection = hooks => {
    hooks.getToggleRowSelectedProps = defaultGetToggleRowSelectedProps;
    hooks.getToggleAllRowsSelectedProps = defaultGetToggleAllRowsSelectedProps;
    hooks.useInstance.push(useInstance);
    hooks.prepareRow.push(prepareRow);
};

useRowSelection.pluginName = 'useRowSelection';

function prepareRow(row, {instance}) {
    row.toggleRowSelected = event => instance.toggleRowSelected(row, event);
    row.getToggleRowSelectedProps = () => (instance.getHooks().getToggleRowSelectedProps(instance.selection, row));
}

const defaultGetToggleRowSelectedProps = (selection, row) => {
    return {
        onChange: event => {
            row.toggleRowSelected(event);
        },
        checked: selection.indexOf(row.original.path) !== -1
    };
};

const defaultGetToggleAllRowsSelectedProps = instance => ({
    onChange: e => {
        instance.toggleAllRowsSelected(e);
    },
    indeterminate: instance.anySelected && !instance.allSelected,
    checked: instance.anySelected
});

function useInstance(instance) {
    const {getHooks, rows} = instance;
    const getInstance = useGetLatest(instance);
    const selection = useSelector(state => state.jcontent.selection);
    const dispatch = useDispatch();
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

    const paths = flattenTree(rows).map(n => n.original.path);
    const allSelected = selection.length > 0 && selection.length === paths.length;
    const anySelected = selection.length > 0;

    const toggleRowSelected = (row, event) => {
        const isRangeSelection = event?.nativeEvent?.shiftKey;
        if (isRangeSelection && selection.length > 0 && selectedItemIndex !== -1) {
            const rangeStart = Math.min(selectedItemIndex + 1, row.index);
            const rangeEnd = Math.max(selectedItemIndex - 1, row.index);

            const selectedPathsSet = new Set(selection);
            const pathsInRange = paths.slice(rangeStart, rangeEnd + 1)
                .filter(path => !selectedPathsSet.has(path));
            pathsInRange.forEach(path => {
                dispatch(cmAddSelection(path));
            });
            setSelectedItemIndex(rangeEnd);
        } else {
            dispatch(cmSwitchSelection(row.original.path));
            setSelectedItemIndex(row.index);
        }
    };

    const toggleAllRowsSelected = () => {
        if (allSelected) {
            dispatch(cmRemoveSelection(paths));
            setSelectedItemIndex(-1);
        } else {
            dispatch(cmAddSelection(paths));
            setSelectedItemIndex(paths.length - 1);
        }
    };

    const getToggleAllRowsSelectedProps = handlerFcn => (getHooks().getToggleAllRowsSelectedProps(getInstance(), handlerFcn));
    Object.assign(instance, {
        toggleRowSelected,
        toggleAllRowsSelected,
        getToggleAllRowsSelectedProps,
        selection,
        allSelected,
        anySelected
    });
}
