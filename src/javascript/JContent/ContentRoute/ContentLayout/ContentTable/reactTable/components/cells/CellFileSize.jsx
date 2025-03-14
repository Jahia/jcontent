import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {FileSize} from '~/JContent/ContentRoute/ContentLayout/FilesGrid/FileCard';

export const CellFileSize = ({cell, column, row}) => {
    const node = row.original;

    return (
        <TableBodyCell key={row.id + column.id}
                       width={column.width}
                       {...cell.getCellProps()}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            <FileSize node={node}/>
        </TableBodyCell>
    );
};

CellFileSize.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
