import React from 'react';
import PropTypes from 'prop-types';
import {TableCell, TableRow} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import ContentListTableConstants from './ContentListTable.constants';

const ContentNotFound = props => (
    <TableRow>
        <TableCell colSpan={props.columnData.length + ContentListTableConstants.appTableCells}>
            <Typography variant="p" className={props.class}>
                {props.translate('label.contentManager.contentNotFound')}
            </Typography>
        </TableCell>
    </TableRow>
);

ContentNotFound.propTypes = {
    class: PropTypes.string.isRequired,
    columnData: PropTypes.array.isRequired,
    translate: PropTypes.func.isRequired
};

export default ContentNotFound;
