import React from 'react';
import {Checkbox, TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';

export const CellSelection = ({row, cell, column}) => (
    <TableBodyCell key={row.id + column.id} {...cell.getCellProps()}>
        <Checkbox isUncontrolled {...row.getToggleRowSelectedProps()}/>
    </TableBodyCell>
);

CellSelection.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
