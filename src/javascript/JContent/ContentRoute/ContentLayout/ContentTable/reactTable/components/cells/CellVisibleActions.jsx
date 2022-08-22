import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {includes} from 'lodash';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import PropTypes from 'prop-types';
import classes from './Cells.scss';
import {useSelector} from 'react-redux';

export const CellVisibleActions = ({row, cell, column}) => {
    const selection = useSelector(state => state.jcontent.selection);
    return (
        <TableBodyCell key={row.id + column.id}
                       className={classes.visibleActions}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role="table-content-list-cell-actions"
        >
            {selection.length === 0 &&
                <DisplayAction
                    actionKey="contentMenu"
                    path={row.original.path}
                    menuFilter={value => !includes(['edit', 'preview', 'subContents', 'locate'], value.key)}
                    render={ButtonRendererNoLabel}
                    buttonProps={{variant: 'ghost', size: 'big'}}
                />}
        </TableBodyCell>
    );
};

CellVisibleActions.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
