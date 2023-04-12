import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './Cells.scss';

const ButtonRenderer = getButtonRenderer({labelStyle: 'short', defaultButtonProps: {className: styles.button}});

export const CellExport = ({cell, column, row}) => (
    <TableBodyCell key={row.id + column.id}
                   {...cell.getCellProps()}
                   width={column.width}
                   data-cm-role="table-content-list-cell-export"
    >
        {row.depth === 0 && (
            <>
                <DisplayAction
                    actionKey="exportPage"
                    path={row.original.path}
                    render={ButtonRenderer}
                />
                <DisplayAction
                    actionKey="export"
                    path={row.original.path}
                    render={ButtonRenderer}
                />
                <DisplayAction
                    actionKey="downloadAsZip"
                    path={row.original.path}
                    render={ButtonRenderer}
                />
            </>
        )}
    </TableBodyCell>
);

CellExport.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
