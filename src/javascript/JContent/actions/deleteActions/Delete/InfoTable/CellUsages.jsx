import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import styles from './Cells.scss';

export const CellUsages = ({cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;
    const usagesCount = node?.usages?.pageInfo?.nodesCount;
    const usageKey = usagesCount === 0 ? 'usageZero' : 'usage';

    return (
        <TableBodyCell key={row.id + column.id}
                       className={clsx('flexRow', usagesCount === 0 ? styles.usages : '')}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={'table-content-list-cell-' + column.id}
        >
            <Typography>{t(`jcontent:label.contentManager.deleteAction.infoTable.${usageKey}`, {count: usagesCount})}</Typography>
        </TableBodyCell>
    );
};

CellUsages.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
