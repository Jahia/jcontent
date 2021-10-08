import React from 'react';
import PropTypes from 'prop-types';
import {ExpansionPanelActions} from '@jahia/design-system-kit';
import {Button} from '@jahia/moonstone';
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
    <ExpansionPanelActions>
        <Button data-cm-role="undo-changes" variant="default" color="accent" label={t('jcontent:label.contentManager.editImage.undo')} disabled={!isDirty} onClick={undoChanges}/>
        <div className={classes.spacer}/>
        <Button data-cm-role="image-save-as-button" variant="default" color="default" label={t('jcontent:label.contentManager.editImage.saveAs')} disabled={!isDirty} onClick={() => saveChanges(true)}/>
        <Button data-cm-role="image-save-button" variant="default" color="accent" label={t('jcontent:label.contentManager.editImage.save')} disabled={!isDirty} onClick={() => saveChanges(false)}/>
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
