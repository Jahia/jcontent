import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {includes} from 'lodash';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import PropTypes from 'prop-types';

export const CellVisibleActions = ({row, cell, column}) => (
    <TableBodyCell key={row.id + column.id} {...cell.getCellProps()}>
        <DisplayAction
            actionKey="contentMenu"
            path={row.original.path}
            menuFilter={value => !includes(['edit', 'preview', 'subContents', 'locate'], value.key)}
            render={ButtonRendererNoLabel}
            buttonProps={{variant: 'ghost', size: 'big'}}
        />
    </TableBodyCell>
);

CellVisibleActions.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
