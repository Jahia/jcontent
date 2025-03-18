import {TableBodyCell} from '@jahia/moonstone';
import React from 'react';
import {FileSize} from '~/JContent/ContentRoute/ContentLayout/FilesGrid/FileCard';
import {rowPropType} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/rowPropType';

export const FileSizeCell = ({row, column}) => (
    <TableBodyCell data-cm-role="file-size-cell" style={{flex: 'initial', minWidth: column.width}}><FileSize node={row.original}/></TableBodyCell>
);

FileSizeCell.propTypes = rowPropType;
