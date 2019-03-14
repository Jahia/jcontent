import React from 'react';
import PropTypes from 'prop-types';
import {TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import ContentListTableConstants from './ContentListTable.constants';

const EmptyRow = props => (
    <TableRow>
        <TableCell colSpan={props.columnData.length + ContentListTableConstants.appTableCells + 2}>
            <Typography variant="p">{props.translate('label.contentManager.noResults')}</Typography>
        </TableCell>
    </TableRow>
);

EmptyRow.propTypes = {
    columnData: PropTypes.array.isRequired,
    translate: PropTypes.func.isRequired
};

export default EmptyRow;
