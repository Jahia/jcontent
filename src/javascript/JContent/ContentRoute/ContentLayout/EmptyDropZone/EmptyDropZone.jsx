import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {Publish, Typography} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';

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
    const currentState = useSelector(state => ({site: state.site, language: state.language}));
    const permissions = useNodeChecks({
        path: `/sites/${currentState.site}`,
        language: currentState.language
    }, {
        requiredSitePermission: [ACTION_PERMISSIONS.uploadFilesAction, ACTION_PERMISSIONS.importAction]
    });

    if (permissions.loading) {
        return 'Loading...';
    }

    if (mode === JContentConstants.mode.MEDIA && permissions.node.site.uploadFilesAction) {
        return (
            <Component className={classes.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.dropMessage')}</Typography>
                <Publish/>
            </Component>
        );
    }

    if (mode === JContentConstants.mode.CONTENT_FOLDERS && permissions.node.site.importAction) {
        return (
            <Component className={classes.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.import.dropMessage')}</Typography>
                <Publish/>
            </Component>
        );
    }

    return (
        <Component className={classes.emptyZone}>
            <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay')}</Typography>
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
