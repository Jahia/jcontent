import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PublicationStatus from '../../../../PublicationStatus';
import PropTypes from 'prop-types';
import scssStyles from './Cells.scss';
import styles from './CellPublicationStatus.scss';

export const CellPublicationStatus = (({row, cell, column}) => (
    <TableBodyCell key={row.id + column.id}
                   className={scssStyles.publicationStatusCell}
                   {...cell.getCellProps()}
                   width={column.width}
                   data-cm-role="table-content-list-cell-publication"
    >
        <PublicationStatus node={row.original} className={styles.root}/>
    </TableBodyCell>
));

CellPublicationStatus.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
