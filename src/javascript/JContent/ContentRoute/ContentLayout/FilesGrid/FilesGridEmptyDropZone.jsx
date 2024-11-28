import React from 'react';
import PropTypes from 'prop-types';
import {Grid, RootRef} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import styles from './FilesGridEmptyDropZone.scss';

export const FilesGridEmptyDropZone = ({uploadType, reference, isCanDrop, allowDrop}) => {
    return (
        <RootRef rootRef={reference}>
            <Grid container className={styles.gridEmpty} data-cm-role="grid-content-list">
                <div className={styles.dragZoneRoot}>
                    <EmptyDropZone component="div" uploadType={uploadType} isCanDrop={isCanDrop} allowDrop={allowDrop}/>
                </div>
            </Grid>
        </RootRef>
    );
};

FilesGridEmptyDropZone.propTypes = {
    uploadType: PropTypes.string,
    reference: PropTypes.object,
    isCanDrop: PropTypes.bool,
    allowDrop: PropTypes.bool
};

export default FilesGridEmptyDropZone;
