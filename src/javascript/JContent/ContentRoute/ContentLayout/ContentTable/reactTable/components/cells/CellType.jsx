import React from 'react';
import PropTypes from 'prop-types';
import {TableBodyCell, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {isAreaList} from '~/JContent/JContent.utils';

export const CellType = ({value, cell, column, row}) => {
    const {t} = useTranslation('jcontent');
    const node = row.original;
    let type = value;

    if (node.primaryNodeType.name === 'jnt:file') {
        type = node.content?.mimeType?.value || value;
    }

    // An area is stored as a plain content list, so its own type says "List" where the author
    // sees an area everywhere else. The mixin is what makes it an area, so it names it here.
    if (isAreaList(node)) {
        type = t('jcontent:label.contentManager.contentType.area');
    }

    return (
        <TableBodyCell
            key={row.id + column.id}
            {...cell.getCellProps()}
            width={column.width}
            data-cm-role={`table-content-list-cell-${column.id}`}
        >
            <Typography isNowrap>{type}</Typography>
        </TableBodyCell>
    );
};

CellType.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object
};
