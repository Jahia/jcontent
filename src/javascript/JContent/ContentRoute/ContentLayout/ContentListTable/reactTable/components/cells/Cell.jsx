import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import clsx from 'clsx';
import css from './Cells.scss';

export const Cell = ({value, cell, column, row}) => (
    <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} className={clsx(css.cell)}>
        <Typography>{value}</Typography>
    </TableBodyCell>
);

Cell.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

