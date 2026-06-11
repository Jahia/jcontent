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
        () => tabs.filter(tab => tab?.isDisplayable(ceCtx)),
        [tabs, ceCtx]
    );
    const displayableComponent = visibleTabs.find(tab => tab.key === activeTab)?.displayableComponent;

    // If the currently-selected tab is no longer visible (e.g. the underlying
    // node lost preview capability), drop the selection so onVisible can pick a new default.
    useEffect(() => {
        if (activeTab !== null && !visibleTabs.some(tab => tab.key === activeTab)) {
            setActiveTab(null);
        }
    }, [visibleTabs, activeTab]);

    // Called by each SidePanelTab once it confirms it's visible.
    // Only the first call sets the default — preserving priority order (tabs are sorted by target weight).
    const onVisible = useCallback(value => {
        setActiveTab(current => current === null ? value : current);
    }, []);

    return (
        <Paper className={styles.root} data-sel-role="side-panel" style={{padding: 0}}>
            <div data-sel-role="side-panel-tabs">
                <Tab>
                    {visibleTabs.map(tab => {
                        const {displayableComponent, ...tabProps} = tab;
                        const TabComponent = tab.component;

                        return (
                            <TabComponent
                                key={tab.key}
                                {...tabProps}
                                value={tab.key}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                render={({onClick}) => (
                                    <TabItem
                                        label={t(tab.buttonLabel)}
                                        isSelected={activeTab === tab.key}
                                        data-sel-role={tab.dataSelRole || tab.key}
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
                {displayableComponent}
            </div>
        </Paper>
    );
};
