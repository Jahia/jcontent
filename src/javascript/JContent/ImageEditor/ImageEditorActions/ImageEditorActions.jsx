import React from 'react';
import PropTypes from 'prop-types';
import {ExpansionPanelActions} from '@jahia/design-system-kit';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const ImageEditorActions = ({undoChanges, saveChanges, isDirty}) => {
    const {t} = useTranslation();
    return (
        <ExpansionPanelActions>
            <Button data-cm-role="undo-changes"
                    size="big"
                    variant="ghost"
                    color="default"
                    label={t('jcontent:label.contentManager.editImage.undo')}
                    disabled={!isDirty}
                    onClick={undoChanges}/>
            <div className="flexFluid"/>
            <Button data-cm-role="image-save-as-button"
                    size="big"
                    variant="ghost"
                    color="default"
                    label={t('jcontent:label.contentManager.editImage.saveAs')}
                    disabled={!isDirty}
                    onClick={() => saveChanges(true)}/>
            <Button data-cm-role="image-save-button"
                    size="big"
                    variant="default"
                    color="accent"
                    label={t('jcontent:label.contentManager.editImage.save')}
                    disabled={!isDirty}
                    onClick={() => saveChanges(false)}/>
        </ExpansionPanelActions>
    );
};

ImageEditorActions.propTypes = {
    isDirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default ImageEditorActions;
