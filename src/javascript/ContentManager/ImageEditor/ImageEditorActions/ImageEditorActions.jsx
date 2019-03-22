import React from 'react';
import PropTypes from 'prop-types';
import {Button, ExpansionPanelActions} from '@jahia/ds-mui-theme';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = {
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        '& > button': {
            marginRight: '1em'
        }
    },
    spacer: {
        flex: 1
    }
};

const ImageEditorActions = ({classes, t, undoChanges, saveChanges, dirty}) => (
    <ExpansionPanelActions className={classes.buttons}>
        <Button data-cm-role="undo-changes" variant="ghost" disabled={!dirty} onClick={undoChanges}>
            {t('label.contentManager.editImage.undo')}
        </Button>
        <div className={classes.spacer}/>
        <Button variant="secondary" data-cm-role="image-save-as-button" disabled={!dirty} onClick={() => saveChanges(true)}>
            {t('label.contentManager.editImage.saveAs')}
        </Button>
        <Button variant="primary" data-cm-role="image-save-button" disabled={!dirty} onClick={() => saveChanges(false)}>
            {t('label.contentManager.editImage.save')}
        </Button>
    </ExpansionPanelActions>
);

ImageEditorActions.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    dirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEditorActions);
