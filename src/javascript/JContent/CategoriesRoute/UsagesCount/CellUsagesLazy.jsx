import React from 'react';
import PropTypes from 'prop-types';
import {Chip, ContentReference, TableBodyCell} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useUsagesCount} from './UsagesCount.context';

/**
 * Same output as CellUsages, but the count is fetched once the row is on screen instead of
 * coming from the tree query. Renders empty until the count arrives, so the cell never holds
 * the table back.
 */
export const CellUsagesLazy = ({cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;
    const usagesCount = useUsagesCount(node.path);

    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            {usagesCount > 0 ? (
                <Chip label={t('label.contentManager.listColumns.usagesCount', {count: usagesCount})}
                      color="warning"
                      icon={<ContentReference/>}/>
            ) : null}
        </TableBodyCell>
    );
};

CellUsagesLazy.propTypes = {
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

export default CellUsagesLazy;
