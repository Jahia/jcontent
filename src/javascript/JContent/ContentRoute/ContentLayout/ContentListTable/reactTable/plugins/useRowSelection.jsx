import {useDispatch, useSelector} from 'react-redux';
import {cmSwitchSelection, cmAddSelection, cmRemoveSelection} from '../../../contentSelection.redux';

export const useRowSelection = hooks => {
    hooks.getToggleRowSelectedProps = defaultGetToggleRowSelectedProps;
    hooks.getToggleAllRowsSelectedProps = defaultGetToggleAllRowsSelectedProps;
    hooks.useInstance.push(useInstance);
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

function useInstance(instance) {
    const {getHooks, rows} = instance;

    const {selection} = useSelector(state => ({selection: state.jcontent.selection}));
    const dispatch = useDispatch();

    const allSelected = selection.length > 0 && selection.length === instance.rows.length;
    const anySelected = selection.length > 0;

    const toggleRowSelected = row => {
        dispatch(cmSwitchSelection(row.original.path));
    };

    const toggleAllRowsSelected = () => {
        if (allSelected) {
            dispatch(cmRemoveSelection(rows.map(r => r.original.path)));
        } else {
            dispatch(cmAddSelection(rows.map(r => r.original.path)));
        }
    };

    const getToggleAllRowsSelectedProps = handlerFcn => (getHooks().getToggleAllRowsSelectedProps(instance, handlerFcn));
    Object.assign(instance, {
        toggleRowSelected,
        toggleAllRowsSelected,
        getToggleAllRowsSelectedProps,
        selection,
        allSelected,
        anySelected
    });
}

