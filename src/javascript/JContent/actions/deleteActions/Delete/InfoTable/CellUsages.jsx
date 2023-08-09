import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from '~/JContent/actions/deleteActions/Delete/InfoTable/Cells.scss';

const ButtonRenderer = getButtonRenderer({labelStyle: 'short', defaultButtonProps: {className: styles.button}});

export const CellUsages = ({cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;
    const usagesCount = node?.usages?.pageInfo?.nodesCount;

    return (
        <TableBodyCell key={row.id + column.id}
                       className={clsx('flexRow')}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={'table-content-list-cell-' + column.id}
        >
            {usagesCount === 0 ? (
                <Typography>
                    {t('jcontent:label.contentManager.deleteAction.infoTable.usageZero')}
                </Typography>
            ) : (
                <DisplayAction
                    actionKey="viewUsages"
                    usagesCount={usagesCount}
                    path={row.original.path}
                    render={ButtonRenderer}
                />
            )}
        </TableBodyCell>
    );
};

CellUsages.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
