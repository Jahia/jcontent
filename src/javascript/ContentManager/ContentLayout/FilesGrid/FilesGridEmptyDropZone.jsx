import React from 'react';
import PropTypes from 'prop-types';
import {Grid, withStyles} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';

const styles = theme => ({
    root: {
        flex: '1 1 0%',
        display: 'flex'
    },
    gridEmpty: {
        flex: '1 1 0%',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    dragZoneRoot: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: theme.spacing.unit * 4
    }
});

export const FilesGridEmptyDropZone = ({classes, path, mode}) => (
    <UploadTransformComponent uploadTargetComponent={Grid} uploadPath={path} mode={mode} className={classes.root}>
        <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
            <div className={classes.dragZoneRoot}>
                <EmptyDropZone component="div" mode={mode}/>
            </div>
        </Grid>
    </UploadTransformComponent>
);

FilesGridEmptyDropZone.propTypes = {
    classes: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired
};

export default withStyles(styles)(FilesGridEmptyDropZone);
