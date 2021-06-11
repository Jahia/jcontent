import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Chip} from '@jahia/moonstone';
import clsx from 'clsx';
import css from './Cells.scss';
import {isWorkInProgress} from '../../../../../../JContent.utils';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Lock, Build} from '@material-ui/icons';
import {Tooltip} from '@material-ui/core';

export const CellStatus = ({cell, column, row}) => {
    const {t} = useTranslation();
    const node = row.original;
    const lang = useSelector(state => state.lang);
    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} className={clsx(css.cell)}>
            {isWorkInProgress(node, lang) &&
            <Tooltip title={node.wipLangs ? t('jcontent:label.contentManager.workInProgress', {wipLang: node.wipLangs.values}) : t('jcontent:label.contentManager.workInProgressAll')}><Chip icon={<Build fontSize="small"/>}/></Tooltip>}
            {node.lockOwner !== null &&
            <Tooltip title={t('jcontent:label.contentManager.locked')}><Chip icon={<Lock fontSize="small"/>} color="danger"/></Tooltip>}
        </TableBodyCell>
    );
};

CellStatus.propTypes = {
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};

