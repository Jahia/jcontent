import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import css from './Cells.scss';
import {Folder} from 'mdi-material-ui';
import {isEmpty} from 'lodash';
import {DocumentIcon, FileIcon, ImageIcon, ZipIcon} from '../../../../icons';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../../../../../../JContent.utils';
import classes from './Cells.scss';

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

const getMediaIcon = node => {
    switch (node.primaryNodeType.name) {
        case 'jnt:folder':
            return <Folder className={css.icon}/>;
        case 'jnt:file':
            if (node.mixinTypes.length !== 0 && !isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:image'))) {
                return <ImageIcon className={css.icon}/>;
            }

            if (node.name.match(/.zip$/g) || node.name.match(/.tar$/g) || node.name.match(/.rar$/g)) {
                return <ZipIcon className={css.icon}/>;
            }

            if (node.mixinTypes.length !== 0 && !isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:document'))) {
                return <DocumentIcon className={css.icon}/>;
            }

            return <FileIcon className={css.icon}/>;
        default:
            return <img src={addIconSuffix(node.primaryNodeType.icon)}/>;
    }
};

export const CellName = ({value, cell, column, row}) => {
    const node = row.original;
    const deleted = isMarkedForDeletion(node);
    return (
        <TableBodyCell key={row.id + column.id} isExpandableColumn className={deleted ? classes.deleted : ''} {...cell.getCellProps()} row={row} cell={cell} iconStart={row.original[cell.column.id]?.icon} data-cm-role="table-content-list-cell-name">
            {getMediaIcon(node)}{value}
        </TableBodyCell>
    );
};

CellName.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
