import {withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {CloudUpload} from '@material-ui/icons';
import React from 'react';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

const styles = theme => ({
    dropZone: {
        flex: '1 1 0%',
        border: '2px dashed ' + theme.palette.border.main,
        color: theme.palette.text.disabled,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center', // This one is for Safari rendering
        justifyContent: 'center',
        width: 'inherit',
        boxSizing: 'border-box',
        transitionDuration: '.1s'
    }
});

const EmptyDropZone = ({component: Component, t, classes, mode}) => (
    <Component className={classes.dropZone}>
        <Typography variant="gamma" color="inherit">{t(mode === 'browse-files' ? 'label.contentManager.fileUpload.dropMessage' : 'label.contentManager.import.dropMessage')}</Typography>
        <CloudUpload/>
    </Component>
);

export default compose(
    translate(),
    withStyles(styles, {withTheme: true}),
)(EmptyDropZone);
