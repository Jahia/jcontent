import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import {getDisplayName} from '~/utils/userDisplay';

export const CellCreatedBy = ({value, cell, column, row}) => {
    const displayName = getDisplayName(row?.original?.createdByUser) || value;
    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={'table-content-list-cell-' + column.id}
        >
            <Typography>{displayName}</Typography>
        </TableBodyCell>
    );
};

CellCreatedBy.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
