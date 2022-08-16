import React from 'react';
import {Checkbox, TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {columnWidths} from '../../columns';

export const CellSelection = ({row, cell, column}) => {
    // Not selectable only if 'isSelectable' is explicitly set to false
    const selectable = row.original.isSelectable !== false;
    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={columnWidths[column.id]}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            {selectable && <Checkbox {...row.getToggleRowSelectedProps()}/>}
        </TableBodyCell>
    );
};

CellSelection.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
