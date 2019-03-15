import React from 'react';
import PropTypes from 'prop-types';
import {TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import ContentListTableConstants from './ContentListTable.constants';

const EmptyRow = ({columnData, t}) => (
    <TableRow>
        <TableCell colSpan={columnData.length + ContentListTableConstants.appTableCells + 2}>
            <Typography variant="p">{t('label.contentManager.noResults')}</Typography>
        </TableCell>
    </TableRow>
);

EmptyRow.propTypes = {
    columnData: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired
};

export default EmptyRow;
