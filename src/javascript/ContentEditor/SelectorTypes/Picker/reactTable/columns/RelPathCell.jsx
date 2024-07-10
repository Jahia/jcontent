import {TableBodyCell} from '@jahia/moonstone';
import {getRelativePath} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import React from 'react';
import {rowPropType} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/rowPropType';

export const RelPathCell = ({row}) => (
    <TableBodyCell data-cm-role="rel-path-cell">
        {getRelativePath(row.original.path)}
    </TableBodyCell>
);

RelPathCell.propTypes = rowPropType;
