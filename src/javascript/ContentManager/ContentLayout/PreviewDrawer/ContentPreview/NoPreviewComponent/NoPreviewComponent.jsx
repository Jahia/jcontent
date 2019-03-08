import React from 'react';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';

export default class NoPreviewComponent extends React.Component {
    render() {
        const {classes, t} = this.props;
        return (
            <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
                <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
                    <Typography variant="gamma" color="gamma">
                        {t('label.contentManager.contentPreview.noContentSelected')}
                    </Typography>
                </Paper>
            </div>
        );
    }
}
