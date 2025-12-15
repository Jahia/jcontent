import React from 'react';
import {Chip, ContentReference} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

const UsagesCountBadge = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const usagesCount = nodeData.usagesCount || 0;
    if (usagesCount === 0) {
        return null;
    }

    return (
        <Chip
            data-sel-role="lock-info-badge"
            label={t('label.contentManager.contentStatus.usagesCount', {count: usagesCount})}
            icon={<ContentReference/>}
            color="warning"
        />
    );
};

export default UsagesCountBadge;
