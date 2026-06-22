import React, {useState, useCallback, useMemo, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Button, Close, Drawer, Tab, TabItem} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useSidePanelContext} from './SidePanelContext';
import styles from './SidePanel.scss';
import {useTranslation} from 'react-i18next';
import {ErrorBoundary} from '@jahia/jahia-ui-root';

export const SidePanel = ({registryTarget = 'sidePanelTabsActions'}) => {
    const [activeTab, setActiveTab] = useState(null);
    const ctx = useSidePanelContext();
    const {t} = useTranslation('jcontent');

    const {onClose} = ctx;
    const tabs = registry.find({target: registryTarget});
    const visibleTabs = useMemo(
        () => tabs.filter(tab => tab?.isDisplayable(ctx)),
        [tabs, ctx]
    );
    const ActiveTabComponent = visibleTabs.find(tab => tab.key === activeTab)?.displayableComponent;

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
        <Drawer isOpen className={styles.root} data-sel-role="side-panel">
            <div className={styles.tabs} data-sel-role="side-panel-tabs">
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
                {onClose && (
                    <Button
                        className={styles.closeButton}
                        variant="ghost"
                        icon={<Close/>}
                        data-sel-role="side-panel-close"
                        onClick={onClose}
                    />
                )}
            </div>

            <ErrorBoundary key={activeTab}>
                <div className={styles.content} data-sel-role="side-panel-content">
                    {ActiveTabComponent && <ActiveTabComponent/>}
                </div>
            </ErrorBoundary>
        </Drawer>
    );
};

SidePanel.propTypes = {
    registryTarget: PropTypes.string
};
