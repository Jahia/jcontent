import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';

export const CellType = ({value, cell, column, row}) => {
    const node = row.original;
    let type = value;

    if (node.primaryNodeType.name === 'jnt:file') {
        type = node.content?.mimeType?.value;
    }

    return (
        <TableBodyCell
            key={row.id + column.id}
            {...cell.getCellProps()}
            width={column.width}
            data-cm-role={`table-content-list-cell-${column.id}`}
        >
            <Typography isNowrap>{type}</Typography>
        </TableBodyCell>
    );
};

CellType.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
