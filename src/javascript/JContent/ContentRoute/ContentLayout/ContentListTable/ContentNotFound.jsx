import React from 'react';
import PropTypes from 'prop-types';
import {TableBody, TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import ContentListTableConstants from './ContentListTable.constants';

const ContentNotFound = ({columnData, t, className}) => (
    <TableBody>
        <TableRow>
            <TableCell colSpan={columnData.length + ContentListTableConstants.appTableCells}>
                <Typography variant="p" className={className}>
                    {t('jcontent:label.contentManager.contentNotFound')}
                </Typography>
            </TableCell>
        </TableRow>
    </TableBody>
);

ContentNotFound.propTypes = {
    className: PropTypes.string,
    columnData: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentNotFound;
