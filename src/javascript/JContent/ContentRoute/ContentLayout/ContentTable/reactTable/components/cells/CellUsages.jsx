import React from 'react';
import PropTypes from 'prop-types';
import {Chip, ContentReference, TableBodyCell} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

export const CellUsages = ({cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;

    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            <Chip label={t('label.contentManager.listColumns.usagesCount', {count: node.usagesCount})} color="warning" icon={<ContentReference/>}/>
        </TableBodyCell>
    );
};

CellUsages.propTypes = {
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

