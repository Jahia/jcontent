import React from 'react';
import {Chip, Lock} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

export const getBadgeContent = (nodeData, t) => {
    const LOCK_TYPE_VALIDATION = 'validation';
    const LOCK_TYPE_DELETION = 'deletion';

    let color = 'warning';
    let label = t('jcontent:label.contentEditor.edit.action.lock.unknown');

    if (nodeData?.lockInfo?.details && nodeData.lockInfo.details.length > 0) {
        let lockInfoDetails = nodeData.lockInfo.details.find(detail => detail.type === LOCK_TYPE_VALIDATION || detail.type === LOCK_TYPE_DELETION);
        if (lockInfoDetails) {
            label = t('jcontent:label.contentEditor.edit.action.lock.' + lockInfoDetails.type);
            color = (lockInfoDetails.type === LOCK_TYPE_DELETION) ? 'danger' : 'warning';
        } else {
            lockInfoDetails = nodeData.lockInfo.details[0];
            if (lockInfoDetails && (lockInfoDetails.type === 'user' || lockInfoDetails.type === 'engine')) {
                label = t('jcontent:label.contentEditor.edit.action.lock.' + lockInfoDetails.type, {userName: lockInfoDetails.owner});
            }
        }
    }

    return {label, color};
};

export const LockInfoChip = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const {label, color} = getBadgeContent(nodeData, t);
    return (
        <>
            {nodeData.lockedAndCannotBeEdited &&
            <Chip
                data-sel-role="lock-info-badge"
                label={label}
                icon={<Lock/>}
                color={color}
            />}
        </>
    );
};
