import React from 'react';
import PropTypes from 'prop-types';
import css from '../../../ContentListTableMoon.scss';
import {TableBodyCell, Typography, Chip, Subdirectory} from '@jahia/moonstone';

export const CellType = ({value, cell, column, row}) => {
    const node = row.original;
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;

    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()}>
            <div className={css.cellType}>
                <Typography>{value}</Typography>
                {showSubNodes && <Chip color="accent" label={`${node.subNodes.pageInfo.totalCount} item(s)`} icon={<Subdirectory/>}/>}
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
