import {useDispatch, useSelector} from 'react-redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../../../contentSelection.redux';
import {useGetLatest} from 'react-table';
import {flattenTree} from '../../../ContentLayout.utils';

export const useRowSelection = selector => hooks => {
    hooks.getToggleRowSelectedProps = defaultGetToggleRowSelectedProps;
    hooks.getToggleAllRowsSelectedProps = defaultGetToggleAllRowsSelectedProps;
    hooks.useInstance.push(getUseInstance(selector));
    hooks.prepareRow.push(prepareRow);
};

useRowSelection.pluginName = 'useRowSelection';

function prepareRow(row, {instance}) {
    row.toggleRowSelected = () => instance.toggleRowSelected(row);
    row.getToggleRowSelectedProps = () => (instance.getHooks().getToggleRowSelectedProps(instance.selection, row));
}

const defaultGetToggleRowSelectedProps = (selection, row) => {
    return {
        onChange: () => {
            row.toggleRowSelected();
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

const getUseInstance = selector => instance => {
    const {getHooks, rows} = instance;
    const getInstance = useGetLatest(instance);
    const {selection} = useSelector(selector);
    const dispatch = useDispatch();

    const paths = flattenTree(rows).map(n => n.original.path);
    const allSelected = selection.length > 0 && selection.length === paths.length;
    const anySelected = selection.length > 0;

    const toggleRowSelected = row => {
        dispatch(cmSwitchSelection(row.original.path));
    };

    const toggleAllRowsSelected = () => {
        if (allSelected) {
            dispatch(cmRemoveSelection(paths));
        } else {
            dispatch(cmAddSelection(paths));
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
};
