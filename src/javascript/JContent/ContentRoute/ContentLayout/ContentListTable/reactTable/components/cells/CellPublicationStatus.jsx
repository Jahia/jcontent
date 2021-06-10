import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import clsx from 'clsx';
import css from './Cells.scss';
import PublicationStatus from '../../../../PublicationStatus';
import PropTypes from 'prop-types';

export const CellPublicationStatus = ({row, cell, column}) => (
    <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} className={clsx(css.cell, css.unAlign)}>
        <PublicationStatus node={row.original}/>
    </TableBodyCell>
);

CellPublicationStatus.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
