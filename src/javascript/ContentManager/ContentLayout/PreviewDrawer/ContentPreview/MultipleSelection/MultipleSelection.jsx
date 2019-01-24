import React from 'react';
import classNames from 'classnames';
import {Paper, Typography, Button} from '@material-ui/core';
import {ContentCopy} from 'mdi-material-ui';

export default class MultipleSelection extends React.Component {
    render() {
        const {classes, t, selection, clearSelection} = this.props;
        return (
            <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
                <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
                    <Typography variant="h6" color="inherit">
                        {t('label.contentManager.selection.itemsSelected', {count: selection.length})}
                    </Typography>
                    <ContentCopy className={classes.centerIcon} color="inherit"/>
                    <Button variant="text" color="inherit" size="small" onClick={clearSelection}>
                        {t('label.contentManager.selection.clearMultipleSelection')}
                    </Button>
                </Paper>
            </div>
        );
    }
}

