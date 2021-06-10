import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography, Chip, Subdirectory} from '@jahia/moonstone';
import clsx from 'clsx';
import css from './Cells.scss';

export const CellType = ({value, cell, column, row}) => {
    const node = row.original;
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;

    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} className={clsx(css.cell)}>
            <Typography>{value}</Typography>
            {showSubNodes && <Chip label={`${node.subNodes.pageInfo.totalCount} item(s)`} icon={<Subdirectory/>}/>}
        </TableBodyCell>
    );
};

CellType.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
