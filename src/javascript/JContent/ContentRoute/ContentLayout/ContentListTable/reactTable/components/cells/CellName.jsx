import React from 'react';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import clsx from 'clsx';
import css from './Cells.scss';
import {Folder} from 'mdi-material-ui';
import {isEmpty} from 'lodash';
import {DocumentIcon, FileIcon, ImageIcon, ZipIcon} from '../../../../icons';
import {Badge} from '@material-ui/core';
import PropTypes from 'prop-types';

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
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;
    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} className={clsx(css.cell)}>
            {
                showSubNodes ?
                    <Badge
                        badgeContent={node.subNodes.pageInfo.totalCount}
                        invisible={node.subNodes.pageInfo.totalCount === 0}
                        classes={{badge: css.badge}}
                        data-cm-role="sub-contents-count"
                    >
                        <Typography>{getMediaIcon(node)}{value}</Typography>
                    </Badge> :
                    <Typography>{getMediaIcon(node)}{value}</Typography>
            }
        </TableBodyCell>
    );
};

CellName.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
