import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import {columnWidths} from '../../columns';
import css from '../../../ContentTable.scss';
import dayjs from 'dayjs';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {getDefaultLocale} from '~/JContent/JContent.utils';
import {DisplayActions} from '@jahia/ui-extender';
import {includes} from 'lodash';
import PropTypes from 'prop-types';

export const CellLastModified = ({row, value, cell, column}) => {
    const {uilang, selection} = useSelector(state => ({uilang: state.uilang, selection: state.jcontent.selection}), shallowEqual);
    return (
        <TableBodyCell key={row.id + column.id}
                       {...cell.getCellProps()}
                       width={columnWidths[column.id]}
                       data-cm-role={'table-content-list-cell-' + column.id}
        >
            <div className={css.cellLastModified}>
                <Typography className={css.cellLastModifiedText} component="time">
                    {dayjs(value).locale(getDefaultLocale(uilang)).format('lll')}
                </Typography>
                {selection.length === 0 &&
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
                    </div>}
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
