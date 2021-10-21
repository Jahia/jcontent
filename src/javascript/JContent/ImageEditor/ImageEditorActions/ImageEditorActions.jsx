import React from 'react';
import PropTypes from 'prop-types';
import {Button, ExpansionPanelActions} from '@jahia/design-system-kit';
import {withStyles} from '@material-ui/core';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';

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

const ImageEditorActions = ({classes, t, undoChanges, saveChanges, isDirty}) => (
    <ExpansionPanelActions className={classes.buttons}>
        <Button data-cm-role="undo-changes" variant="ghost" disabled={!isDirty} onClick={undoChanges}>
            {t('jcontent:label.contentManager.editImage.undo')}
        </Button>
        <div className={classes.spacer}/>
        <Button variant="secondary" data-cm-role="image-save-as-button" disabled={!isDirty} onClick={() => saveChanges(true)}>
            {t('jcontent:label.contentManager.editImage.saveAs')}
        </Button>
        <Button variant="primary" data-cm-role="image-save-button" disabled={!isDirty} onClick={() => saveChanges(false)}>
            {t('jcontent:label.contentManager.editImage.save')}
        </Button>
    </ExpansionPanelActions>
);

ImageEditorActions.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    isDirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(ImageEditorActions);
