import React from 'react';
import PropTypes from 'prop-types';
import {TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import ContentListTableConstants from './ContentListTable.constants';

const ContentNotFound = ({columnData, t, className}) => (
    <TableRow>
        <TableCell colSpan={columnData.length + ContentListTableConstants.appTableCells}>
            <Typography variant="p" className={className}>
                {t('label.contentManager.contentNotFound')}
            </Typography>
        </TableCell>
    </TableRow>
);

ContentNotFound.propTypes = {
    className: PropTypes.string,
    columnData: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentNotFound;
