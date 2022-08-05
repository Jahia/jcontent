import React from 'react';
import PropTypes from 'prop-types';
import {ExpansionPanelActions} from '@jahia/design-system-kit';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './ImageEditorActions.scss';

const ImageEditorActions = ({undoChanges, saveChanges, isDirty}) => {
    const {t} = useTranslation();
    return (
        <ExpansionPanelActions className={styles.expansePanel}>
            <Button data-cm-role="undo-changes"
                    size="big"
                    variant="outlined"
                    color="default"
                    className={styles.button}
                    label={t('jcontent:label.contentManager.editImage.undo')}
                    disabled={!isDirty}
                    onClick={undoChanges}/>
            <div className="flexFluid"/>
            <Button data-cm-role="image-save-button"
                    size="big"
                    variant="outlined"
                    color="default"
                    label={t('jcontent:label.contentManager.editImage.save')}
                    disabled={!isDirty}
                    onClick={() => saveChanges(false)}/>
            <Button data-cm-role="image-save-as-button"
                    size="big"
                    variant="outlined"
                    color="accent"
                    label={t('jcontent:label.contentManager.editImage.saveAs')}
                    disabled={!isDirty}
                    onClick={() => saveChanges(true)}/>
        </ExpansionPanelActions>
    );
};

ImageEditorActions.propTypes = {
    isDirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default ImageEditorActions;
