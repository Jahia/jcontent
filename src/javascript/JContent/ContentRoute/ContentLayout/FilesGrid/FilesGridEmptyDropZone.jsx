import React from 'react';
import PropTypes from 'prop-types';
import {Grid} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';
import styles from './FilesGridEmptyDropZone.scss';

export const FilesGridEmptyDropZone = ({path, mode}) => (
    <UploadTransformComponent uploadTargetComponent={Grid} uploadPath={path} mode={mode} className={styles.root}>
        <Grid container className={styles.gridEmpty} data-cm-role="grid-content-list">
            <div className={styles.dragZoneRoot}>
                <EmptyDropZone component="div" mode={mode}/>
            </div>
        </Grid>
    </UploadTransformComponent>
);

FilesGridEmptyDropZone.propTypes = {
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired
};

export default FilesGridEmptyDropZone;
