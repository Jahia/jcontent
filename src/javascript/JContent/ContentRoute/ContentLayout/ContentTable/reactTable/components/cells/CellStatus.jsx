import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {Build, Chip, Lock, Subdirectory, TableBodyCell} from '@jahia/moonstone';
import {isWorkInProgress} from '~/JContent/JContent.utils';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Tooltip} from '@material-ui/core';
import classes from './Cells.scss';

export const CellStatus = ({cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;
    const lang = useSelector(state => state.lang);
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;
    const subNodesCountText = useMemo(() => {
        if (showSubNodes) {
            const count = node.subNodes.pageInfo.totalCount;
            return count > 99 ? '99+' : count;
        }
    }, [showSubNodes, node?.subNodes?.pageInfo?.totalCount]);

    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={column.width}
                       data-cm-role={`table-content-list-cell-${column.id}`}
        >
            {isWorkInProgress(node, lang) &&
                <Tooltip
                    title={node.wipLangs ?
                        t('jcontent:label.contentManager.workInProgress', {wipLang: node.wipLangs.values}) :
                        t('jcontent:label.contentManager.workInProgressAll')}
                >
                    <Chip className={classes.statusCellItem} icon={<Build fontSize="small"/>} color="warning"/>
                </Tooltip>}
            {node.lockOwner !== null &&
            <Tooltip title={t('jcontent:label.contentManager.locked')}><Chip className={classes.statusCellItem} icon={<Lock fontSize="small"/>} color="warning"/></Tooltip>}
            {showSubNodes && <Chip data-cm-role="sub-contents-count" color="accent" label={`${subNodesCountText} item(s)`} icon={<Subdirectory/>}/>}
        </TableBodyCell>
    );
};

CellStatus.propTypes = {
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

