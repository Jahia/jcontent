import React from 'react';
import {TableBodyCell} from '@jahia/moonstone';
import PublicationStatus from '../../../../PublicationStatus';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';

const styles = () => ({
    root: {
        display: 'flex',
        position: 'absolute',
        minHeight: 48,
        maxHeight: 48,
        marginTop: -24, // Need to offset for moonstone table
        zIndex: 1,
        minWidth: 6
    }
});

export const CellPublicationStatus = withStyles(styles)(({row, cell, column, classes}) => (
    <TableBodyCell key={row.id + column.id} {...cell.getCellProps()}>
        <PublicationStatus node={row.original} classes={{root: classes.root}}/>
    </TableBodyCell>
));

CellPublicationStatus.propTypes = {
    value: PropTypes.string,
    cell: PropTypes.object,
    column: PropTypes.object,
    row: PropTypes.object,
    classes: PropTypes.object.isRequired
};
