import React, {useState} from 'react';
import {Paper, Tab, TabItem} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './SidePanel.scss';
import {useTranslation} from 'react-i18next';

export const SidePanel = () => {
    const [activeTab, setActiveTab] = useState('details');
    const ceCtx = useContentEditorContext();
    const {t} = useTranslation('jcontent');

    const tabs = registry.find({target: 'sidePanelTabsActions'});
    const ActiveTabComponent = tabs.find(tab => tab.value === activeTab)?.displayableComponent;

    return (
        <Paper className={styles.root} data-sel-role="side-panel">
            <div className={styles.tabs} data-sel-role="side-panel-tabs">
                <Tab>
                    {tabs.map(tab => {
                        const {displayableComponent, ...tabProps} = tab;
                        const TabComponent = tab.component;

                        if (!tab.isDisplayable || !tab.isDisplayable(ceCtx)) {
                            return null;
                        }

                        return (
                            <TabComponent
                                key={tab.value}
                                {...tabProps}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                render={({onClick}) => (
                                    <TabItem
                                        label={t(tab.buttonLabel)}
                                        isSelected={activeTab === tab.value}
                                        data-sel-role={tab.dataSelRole}
                                        onClick={onClick}
                                    />
                                )}
                            />
                        );
                    })}
                </Tab>
            </div>
            <div className={styles.content} data-sel-role="side-panel-content">
                {ActiveTabComponent && <ActiveTabComponent/>}
            </div>
        </Paper>
    );
};
