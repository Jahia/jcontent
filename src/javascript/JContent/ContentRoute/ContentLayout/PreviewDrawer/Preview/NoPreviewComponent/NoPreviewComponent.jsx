import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const NoPreviewComponent = ({classes}) => {
    const {t} = useTranslation();
    return (
        <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
            <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
                <Typography variant="heading" weight="light">
                    {t('jcontent:label.contentManager.contentPreview.noContentSelected')}
                </Typography>
            </Paper>
        </div>
    );
};

NoPreviewComponent.propTypes = {
    classes: PropTypes.object.isRequired
};

export default NoPreviewComponent;
