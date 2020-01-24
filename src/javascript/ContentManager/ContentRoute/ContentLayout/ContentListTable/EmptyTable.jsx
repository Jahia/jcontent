import React from 'react';
import PropTypes from 'prop-types';
import {TableBody, TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import ContentListTableConstants from './ContentListTable.constants';

const EmptyTable = ({columnData, t}) => (
    <TableBody>
        <TableRow>
            <TableCell colSpan={columnData.length + ContentListTableConstants.appTableCells + 2}>
                <Typography variant="p">{t('jcontent:label.contentManager.noResults')}</Typography>
            </TableCell>
        </TableRow>
    </TableBody>
);

EmptyTable.propTypes = {
    columnData: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired
};

export default EmptyTable;
