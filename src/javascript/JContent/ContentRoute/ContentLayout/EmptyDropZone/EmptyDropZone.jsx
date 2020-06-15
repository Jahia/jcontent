import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import JContentConstants from '../../../JContent.constants';
import {Publish} from '@jahia/moonstone';

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
    },
    emptyZone: {
        flex: '1 1 0%',
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

const EmptyDropZone = ({component: Component, t, classes, mode}) => {
    if (mode === JContentConstants.mode.MEDIA) {
        return (
            <Component className={classes.dropZone}>
                <Typography variant="gamma" color="inherit">{t('jcontent:label.contentManager.fileUpload.dropMessage')}</Typography>
                <Publish/>
            </Component>
        );
    }

    if (mode === JContentConstants.mode.PAGES) {
        return (
            <Component className={classes.emptyZone}>
                <Typography variant="gamma" color="inherit">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay')}</Typography>
            </Component>
        );
    }

    return (
        <Component className={classes.dropZone}>
            <Typography variant="gamma" color="inherit">{t('jcontent:label.contentManager.import.dropMessage')}</Typography>
            <Publish/>
        </Component>
    );
};

EmptyDropZone.propTypes = {
    classes: PropTypes.object.isRequired,
    component: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles, {withTheme: true})
)(EmptyDropZone);
