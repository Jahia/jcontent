import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Chip, Subdirectory, Lock, Build} from '@jahia/moonstone';
import {isWorkInProgress} from '../../../../../../JContent.utils';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Tooltip} from '@material-ui/core';
import {columnWidths} from '../../columns';
import classes from './Cells.scss';

export const CellStatus = ({cell, column, row}) => {
    const {t} = useTranslation();
    const node = row.original;
    const lang = useSelector(state => state.lang);
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;

    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={columnWidths[column.id]}
        >
            {isWorkInProgress(node, lang) &&
            <Tooltip title={node.wipLangs ? t('jcontent:label.contentManager.workInProgress', {wipLang: node.wipLangs.values}) : t('jcontent:label.contentManager.workInProgressAll')}><Chip className={classes.statusCellItem} icon={<Build fontSize="small"/>}/></Tooltip>}
            {node.lockOwner !== null &&
            <Tooltip title={t('jcontent:label.contentManager.locked')}><Chip className={classes.statusCellItem} icon={<Lock fontSize="small"/>} color="danger"/></Tooltip>}
            {showSubNodes && <Chip data-cm-role="sub-contents-count" color="accent" label={`${node.subNodes.pageInfo.totalCount} item(s)`} icon={<Subdirectory/>}/>}
        </TableBodyCell>
    );
};

CellStatus.propTypes = {
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

