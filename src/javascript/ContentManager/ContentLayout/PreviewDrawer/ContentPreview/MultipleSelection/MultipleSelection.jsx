import React from 'react';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Button, Typography} from '@jahia/ds-mui-theme';
import {ContentCopy} from 'mdi-material-ui';

export default class MultipleSelection extends React.Component {
    render() {
        const {classes, t, selection, clearSelection} = this.props;
        return (
            <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
                <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
                    <Typography variant="gamma">
                        {t('label.contentManager.selection.itemsSelected', {count: selection.length})}
                    </Typography>
                    <ContentCopy className={classes.centerIcon} color="inherit"/>
                    <Button onClick={clearSelection}>
                        {t('label.contentManager.selection.clearMultipleSelection')}
                    </Button>
                </Paper>
            </div>
        );
    }
}

