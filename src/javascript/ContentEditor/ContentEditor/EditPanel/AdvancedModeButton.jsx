import React from 'react';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {Button, Edit} from '@jahia/moonstone';
import styles from '~/ContentEditor/ContentEditor/EditPanel/EditPanel.scss';
import {useTranslation} from 'react-i18next';

export const AdvancedModeButton = () => {
    const {t} = useTranslation('jcontent');
    const {mode, showAdvancedMode} = useContentEditorContext();
    const {updateEditorConfig} = useContentEditorConfigContext();

    const setFullscreen = () => updateEditorConfig({isFullscreen: true});

    return (mode !== Constants.routes.baseCreateRoute && showAdvancedMode) ? (
        <Button
            className={styles.uppercase}
            label={t('label.contentEditor.create.advanced')}
            icon={<Edit/>}
            data-sel-role="advancedMode"
            onClick={setFullscreen}
        />
    ) : null;
};
