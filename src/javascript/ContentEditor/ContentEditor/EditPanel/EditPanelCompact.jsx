import React from 'react';
import PropTypes from 'prop-types';
import styles from './EditPanel.scss';
import clsx from 'clsx';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Checkbox, Typography} from '@jahia/moonstone';
import {getButtonRenderer, truncate} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';

import {AdvancedModeButton} from './AdvancedModeButton';
import {ContentTypeChip} from './ContentTypeChip';
import {EditPanelLanguageSwitcher} from './EditPanelLanguageSwitcher';
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
    const {t} = useTranslation('jcontent');

    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const EditPanelContent = tabs.find(tab => tab.value === Constants.editPanel.editTab).displayableComponent;

    return (
        <>
            <DialogTitle disableTypography className={styles.dialogTitle} id="contenteditor-dialog-title">
                <div className="flexRow">
                    <Typography variant="heading">{truncate(title, 40)}</Typography>
                    <div className="flexFluid"/>
                    <AdvancedModeButton/>
                    <HeaderThreeDotsActions/>
                </div>
                <div className={clsx('flexRow', 'alignCenter')}>
                    <ContentTypeChip/>
                    <div className="flexFluid"/>
                    <HeaderBadges/>
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
