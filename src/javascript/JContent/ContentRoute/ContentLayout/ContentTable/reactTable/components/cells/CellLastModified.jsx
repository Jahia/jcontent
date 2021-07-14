import React from 'react';
import {useSelector} from 'react-redux';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import css from '../../../ContentTable.scss';
import dayjs from 'dayjs';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {getDefaultLocale} from '../../../../../../JContent.utils';
import {DisplayActions} from '@jahia/ui-extender';
import {includes} from 'lodash';
import PropTypes from 'prop-types';

export const CellLastModified = ({row, value, cell, column}) => {
    const uilang = useSelector(state => state.uilang);
    return (
        <TableBodyCell key={row.id + column.id} {...cell.getCellProps()} data-cm-role={'table-content-list-cell-' + column.id}>
            <Typography className={css.cellLastModifiedText}>
                <time>{dayjs(value).locale(getDefaultLocale(uilang)).format('ll')}</time>
            </Typography>
            <div className={css.cellActions}
                 data-cm-role="table-content-list-cell-actions"
            >
                <DisplayActions
                    target="contentActions"
                    filter={value => {
                        return includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                    }}
                    path={row.original.path}
                    render={ButtonRendererNoLabel}
                    buttonProps={{variant: 'ghost', size: 'big'}}
                />
            </div>
        </TableBodyCell>
    );
};

CellLastModified.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
