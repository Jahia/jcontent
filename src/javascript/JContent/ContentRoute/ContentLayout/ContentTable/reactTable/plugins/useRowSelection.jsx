import {useDispatch, useSelector} from 'react-redux';
import {useGetLatest} from 'react-table';
import {flattenTree} from '../../../ContentLayout.utils';

export const useRowSelection = (selector, actions) => hooks => {
    hooks.getToggleRowSelectedProps = defaultGetToggleRowSelectedProps;
    hooks.getToggleAllRowsSelectedProps = defaultGetToggleAllRowsSelectedProps;
    hooks.useInstance.push(getUseInstance(selector, actions));
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

const getUseInstance = (selector, actions) => instance => {
    const {getHooks, rows} = instance;
    const getInstance = useGetLatest(instance);
    const {selection} = useSelector(selector);
    const dispatch = useDispatch();

    const paths = flattenTree(rows).map(n => n.original.path);
    const allSelected = selection.length > 0 && selection.length === paths.length;
    const anySelected = selection.length > 0;

    const toggleRowSelected = row => {
        dispatch(actions.switchSelectionAction(row.original.path));
    };

    const toggleAllRowsSelected = () => {
        if (allSelected) {
            dispatch(actions.removeSelectionAction(paths));
        } else {
            dispatch(actions.addSelectionAction(paths));
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
