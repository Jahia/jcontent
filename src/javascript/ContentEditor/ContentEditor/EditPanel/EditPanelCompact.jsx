import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import styles from './EditPanel.scss';
import clsx from 'clsx';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Checkbox, Chip, Edit, Typography} from '@jahia/moonstone';
import {getButtonRenderer, getNodeTypeIcon, truncate} from '~/ContentEditor/utils';
import {EditPanelLanguageSwitcher} from './EditPanelLanguageSwitcher';
import {useTranslation} from 'react-i18next';
import {HeaderBadges} from './HeaderBadges';
import {HeaderButtonActions, HeaderThreeDotsActions} from './HeaderActions';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {size: 'big'},
    noIcon: true
});

const accentColorButtonProps = {
    color: 'accent'
};

export const EditPanelCompact = ({title, createAnother}) => {
    const {nodeTypeName, nodeTypeDisplayName, mode, showAdvancedMode} = useContentEditorContext();
    const {updateEditorConfig} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');

    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const EditPanelContent = tabs.find(tab => tab.value === Constants.editPanel.editTab).displayableComponent;

    const setFullscreen = () => updateEditorConfig({
        isFullscreen: true
    });

    return (
        <>
            <DialogTitle disableTypography className={styles.dialogTitle} id="contenteditor-dialog-title">
                <div className="flexRow">
                    <Typography variant="heading">{truncate(title, 40)}</Typography>
                    <div className="flexFluid"/>
                    {mode !== Constants.routes.baseCreateRoute && showAdvancedMode &&
                        <Button
                            className={styles.uppercase}
                            label={t('label.contentEditor.create.advanced')}
                            icon={<Edit/>}
                            data-sel-role="advancedMode"
                            onClick={setFullscreen}
                        />}
                    <HeaderThreeDotsActions/>
                </div>
                <div className={clsx('flexRow', 'alignCenter')}>
                    <Chip color="accent" label={nodeTypeDisplayName || nodeTypeName} icon={getNodeTypeIcon(nodeTypeName)}/>
                    <div className="flexFluid"/>
                    <HeaderBadges mode={mode}/>
                </div>
                <div className={clsx('flexRow', 'alignCenter', styles.languageSwitcherActionButtons)}>
                    <EditPanelLanguageSwitcher/>
                    <HeaderButtonActions/>
                </div>
            </DialogTitle>
            <DialogContent className="flexCol" id="contenteditor-dialog-content" data-sel-role="form-container">
                <EditPanelContent/>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                {createAnother && (
                    <>
                        <Checkbox className={styles.checkbox} id="createAnother" checked={createAnother.value} onChange={() => createAnother.set(!createAnother.value)}/>
                        <Typography isUpperCase component="label" htmlFor="createAnother" variant="button" className={styles.checkbox}>
                            {t('label.contentEditor.create.createButton.createAnother')}
                        </Typography>
                    </>
                )}
                <div className="flexFluid"/>
                <DisplayAction
                    actionKey="backButton"
                    render={ButtonRenderer}
                />
                <div className={styles.saveActions}>
                    <DisplayActions
                        buttonProps={accentColorButtonProps}
                        isCreateAnother={createAnother?.value}
                        target="content-editor/header/main-save-actions"
                        render={ButtonRenderer}
                    />
                </div>
            </DialogActions>
        </>
    );
};

EditPanelCompact.propTypes = {
    title: PropTypes.string.isRequired,
    createAnother: PropTypes.object
};
