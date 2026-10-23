import {useFormikContext} from 'formik';
import {Badge} from '@jahia/design-system-kit';
import styles from './UpdateOnSaveBadge.scss';
import React from 'react';
import {useTranslation} from 'react-i18next';

export const UpdateOnSaveBadge = () => {
    const formik = useFormikContext();
    const dirty = formik.dirty;
    const {t} = useTranslation('jcontent');

    // While the form is dirty the preview renders the unsaved values, so the badge says the
    // preview is showing changes that are not in the repository — not that it is out of date.
    return dirty && (
        <div>
            <Badge className={styles.badge}
                   badgeContent={t('jcontent:label.contentEditor.preview.unsavedChanges')}
                   variant="normal"
                   color="info"
            />
        </div>
    );
};
