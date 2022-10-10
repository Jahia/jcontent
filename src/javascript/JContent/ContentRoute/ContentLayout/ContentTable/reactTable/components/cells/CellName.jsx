import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import {NodeIcon} from '~/utils';
import classes from './Cells.scss';
import clsx from 'clsx';

export const CellName = ({value, cell, column, row}) => {
    const node = row.original;
    const deleted = isMarkedForDeletion(node);

    return (
        <TableBodyCell key={row.id + column.id}
                       ref={row.ref}
                       isExpandableColumn
                       isScrollable
                       className={clsx(
                           classes.cellName,
                           row.dropClasses,
                           row.dragClasses,
                           {[classes.deleted]: deleted}
                       )}
                       width={column.width}
                       {...cell.getCellProps()}
                       row={row}
                       iconStart={<NodeIcon node={node} className={classes.icon}/>}
                       cell={cell}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            {value}
        </TableBodyCell>
    );
};

CellName.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
