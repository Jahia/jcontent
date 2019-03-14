import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';

const NoPreviewComponent = ({classes, t}) => (
    <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
        <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
            <Typography variant="gamma" color="gamma">
                {t('label.contentManager.contentPreview.noContentSelected')}
            </Typography>
        </Paper>
    </div>
);

NoPreviewComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default NoPreviewComponent;
