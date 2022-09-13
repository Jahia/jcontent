import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import classes from './Cells.scss';
import clsx from 'clsx';

export const CellNameNoIcon = ({value, cell, column, row}) => {
    const node = row.original;
    const deleted = isMarkedForDeletion(node);
    return (
        <TableBodyCell key={row.id + column.id}
                       isExpandableColumn
                       isScrollable
                       className={clsx(
                           classes.cellName,
                           {[classes.deleted]: deleted}
                       )}
                       width={column.width}
                       {...cell.getCellProps()}
                       row={row}
                       cell={cell}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            {value}
        </TableBodyCell>
    );
};

CellNameNoIcon.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
