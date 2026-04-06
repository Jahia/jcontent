import React, {useState} from 'react';
import {Paper, Tab, TabItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {Preview} from '../Preview';
import {ContentDetails} from './ContentDetails';
import styles from './SidePanel.scss';

export const SidePanel = () => {
    const {t} = useTranslation('jcontent');
    const [activeTab, setActiveTab] = useState('details');

    return (
        <Paper className={styles.container}>
            <div className={styles.tabs}>
                <Tab>
                    <TabItem
                        label={t('jcontent:label.contentEditor.sidePanel.details')}
                        isSelected={activeTab === 'details'}
                        onClick={() => setActiveTab('details')}
                    />
                    <TabItem
                        label={t('jcontent:label.contentEditor.sidePanel.preview')}
                        isSelected={activeTab === 'preview'}
                        onClick={() => setActiveTab('preview')}
                    />
                </Tab>
            </div>
            <div className={styles.content}>
                {activeTab === 'details' && <ContentDetails/>}
                {activeTab === 'preview' && <Preview/>}
            </div>
        </Paper>
    );
};
