import React from 'react';
import {TableBody, TableRow, withStyles} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';

const styles = theme => ({
    dragZoneContentList: {
        position: 'absolute',
        height: '57vh',
        width: '100%',
        display: 'flex',
        padding: theme.spacing.unit * 4
    }
});

export const ContentListEmptyDropZone = ({classes, path, mode}) => (
    <TableBody>
        <UploadTransformComponent uploadTargetComponent={TableRow}
                                  uploadPath={path}
                                  className={classes.dragZoneContentList}
        >
            <EmptyDropZone component="td" mode={mode}/>
        </UploadTransformComponent>
    </TableBody>
);

export default withStyles(styles)(ContentListEmptyDropZone);
