import React from 'react';
import {Grid, withStyles} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';

const styles = theme => ({
    gridEmpty: {
        maxHeight: 'calc(100vh - ' + (theme.layout.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    dragZoneRoot: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: theme.spacing.unit * 4
    }
});

export const FilesGridEmptyDropZone = ({classes, path, mode}) => (
    <UploadTransformComponent uploadTargetComponent={Grid} uploadPath={path} mode={mode}>
        <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
            <div className={classes.dragZoneRoot}>
                <EmptyDropZone component="div" mode={mode}/>
            </div>
        </Grid>
    </UploadTransformComponent>
);

export default withStyles(styles)(FilesGridEmptyDropZone);
