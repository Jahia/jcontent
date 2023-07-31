import React from 'react';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './TechnicalInformation.scss';
import {InfoPanel} from '~/ContentEditor/DesignSystem/InfoPanel';

export const TechnicalInformation = () => {
    const {t} = useTranslation('jcontent');

    const {details, technicalInfo} = useContentEditorContext();

    return (
        <section data-sel-details-section className={styles.container}>
            <InfoPanel
                panelTitle={t('jcontent:label.contentEditor.edit.advancedOption.technicalInformation.details')}
                infos={details}
            />
            <InfoPanel
                panelTitle={t(
                    'jcontent:label.contentEditor.edit.advancedOption.technicalInformation.label'
                )}
                variant="oneColumn"
                infos={technicalInfo}
            />
        </section>
    );
};
