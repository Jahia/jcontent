import React from 'react';
import PropTypes from 'prop-types';
import {columnWidths} from '../../columns';
import css from '../../../ContentTable.scss';
import {TableBodyCell, Typography} from '@jahia/moonstone';

export const CellType = ({value, cell, column, row}) => {
    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} width={columnWidths[column.id]}>
            <div className={css.cellType}>
                <Typography>{value}</Typography>
            </div>
        </TableBodyCell>
    );
};

CellType.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
