import React from 'react';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useUndo} from './undo.store';
import {useUndoRunner} from './useUndoRunner';

/**
 * The button the notification carries while an operation can still be taken back.
 *
 * It is rendered inside the notification provider, which sits at the root of the application, so it
 * reaches Apollo and the translations through context like anything else - the call site that raised
 * the notification does not have to pass them in.
 *
 * It draws nothing once the snapshot is gone. A notification whose message still describes what
 * happened is worth leaving on screen; a button offering to take back something that has already
 * been taken back is not.
 */
export const UndoAction = () => {
    const {t} = useTranslation('jcontent');
    const snapshot = useUndo();
    const {runUndo, isRunning} = useUndoRunner();
    const notificationContext = useNotifications();

    if (!snapshot) {
        return null;
    }

    const handleClick = () => {
        runUndo().then(({failures}) => {
            triggerRefetchAll();

            // Reporting what could not be put back replaces the offer, rather than closing it and
            // leaving the reader to assume everything went back.
            if (failures?.length > 0) {
                notificationContext.notify(
                    t('jcontent:label.contentManager.undo.partial', {count: failures.length}),
                    ['closeButton']
                );
                return;
            }

            notificationContext.closeNotification();
        });
    };

    return (
        <Button isReversed
                variant="ghost"
                size="big"
                isDisabled={isRunning}
                data-sel-role="undo-button"
                label={t('jcontent:label.contentManager.undo.action')}
                onClick={handleClick}
        />
    );
};

export default UndoAction;
