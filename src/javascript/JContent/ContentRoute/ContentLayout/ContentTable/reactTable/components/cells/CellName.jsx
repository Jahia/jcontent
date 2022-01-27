import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import {columnWidths} from '../../columns';
import {NodeIcon} from '~/utils';
import classes from './Cells.scss';
import clsx from 'clsx';

export const CellName = ({value, cell, column, row}) => {
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
                       width={columnWidths[column.id]}
                       {...cell.getCellProps()}
                       row={row}
                       iconStart={<NodeIcon node={node} className={classes.icon}/>}
                       cell={cell}
                       data-cm-role="table-content-list-cell-name"
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
