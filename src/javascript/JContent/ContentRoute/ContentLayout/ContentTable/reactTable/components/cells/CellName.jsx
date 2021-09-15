import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import {Folder} from 'mdi-material-ui';
import {isEmpty} from 'lodash';
import {DocumentIcon, FileIcon, ImageIcon, ZipIcon} from '../../../../icons';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../../../../../../JContent.utils';
import {columnWidths} from '../../columns';
import classes from './Cells.scss';
import clsx from 'clsx';

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

const getMediaIcon = node => {
    switch (node.primaryNodeType.name) {
        case 'jnt:folder':
            return <Folder className={classes.icon}/>;
        case 'jnt:file':
            if (node.mixinTypes.length !== 0 && !isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:image'))) {
                return <ImageIcon className={classes.icon}/>;
            }

            if (node.name.match(/.zip$/g) || node.name.match(/.tar$/g) || node.name.match(/.rar$/g)) {
                return <ZipIcon className={classes.icon}/>;
            }

            if (node.mixinTypes.length !== 0 && !isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:document'))) {
                return <DocumentIcon className={classes.icon}/>;
            }

            return <FileIcon className={classes.icon}/>;
        default:
            return <img className={classes.icon} src={addIconSuffix(node.primaryNodeType.icon)}/>;
    }
};

export const CellName = ({value, cell, column, row}) => {
    const node = row.original;
    const deleted = isMarkedForDeletion(node);
    return (
        <TableBodyCell key={row.id + column.id}
                       isExpandableColumn
                       isScrollable
                       className={clsx(
                           classes.cellName,
                           {[classes.deleted]: deleted}
                       )}
                       width={columnWidths[column.id]}
                       {...cell.getCellProps()}
                       row={row}
                       cell={cell}
                       iconStart={row.original[cell.column.id]?.icon}
                       data-cm-role="table-content-list-cell-name"
        >
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
