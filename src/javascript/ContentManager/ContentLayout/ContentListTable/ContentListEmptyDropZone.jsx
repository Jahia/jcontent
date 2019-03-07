import React from 'react';
import {TableBody, TableRow, TableCell, withStyles} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';

const styles = theme => ({
    dragZoneContentList: {
        position: 'absolute',
        height: '57vh',
        width: '100%',
        display: 'flex',
        padding: theme.spacing.unit * 4
    },
    dragZone: {
        display: 'flex',
        padding: 0,
        width: '100%'
    }
});

export const ContentListEmptyDropZone = ({classes, path, mode}) => (
    <TableBody>
        <UploadTransformComponent
            uploadTargetComponent={TableRow}
            uploadPath={path}
            className={classes.dragZoneContentList}
            mode={mode}
        >
            <TableCell className={classes.dragZone}>
                <EmptyDropZone component="div" mode={mode}/>
            </TableCell>
        </UploadTransformComponent>
    </TableBody>
);

export default withStyles(styles)(ContentListEmptyDropZone);
