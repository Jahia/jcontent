import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {Paper, Tab, TabItem} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './SidePanel.scss';
import {useTranslation} from 'react-i18next';

export const SidePanel = () => {
    const [activeTab, setActiveTab] = useState(null);
    const ceCtx = useContentEditorContext();
    const {t} = useTranslation('jcontent');

    const tabs = registry.find({target: 'sidePanelTabsActions'});
    const visibleTabs = useMemo(
        () => tabs.filter(tab => tab.isDisplayable && tab.isDisplayable(ceCtx)),
        [tabs, ceCtx]
    );
    const ActiveTabComponent = visibleTabs.find(tab => tab.value === activeTab)?.displayableComponent;

    // If the currently-selected tab is no longer visible (e.g. the underlying
    // node lost preview capability), drop the selection so onVisible can pick a new default.
    useEffect(() => {
        if (activeTab !== null && !visibleTabs.some(tab => tab.value === activeTab)) {
            setActiveTab(null);
        }
    }, [visibleTabs, activeTab]);

    // Called by each SidePanelTab once it confirms it's visible.
    // Only the first call sets the default — preserving priority order (tabs are sorted by target weight).
    const onVisible = useCallback(value => {
        setActiveTab(current => current === null ? value : current);
    }, []);

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
                                onVisible={onVisible}
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
