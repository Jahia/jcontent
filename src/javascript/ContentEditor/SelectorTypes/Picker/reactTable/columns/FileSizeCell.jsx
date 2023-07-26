import {TableBodyCell} from '@jahia/moonstone';
import React from 'react';
import {FileSize} from '~/JContent/ContentRoute/ContentLayout/FilesGrid/FileCard';
import {rowPropType} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/rowPropType';

export const FileSizeCell = ({row}) => (
    <TableBodyCell data-cm-role="file-size-cell"><FileSize node={row.original}/></TableBodyCell>
);

FileSizeCell.propTypes = rowPropType;
