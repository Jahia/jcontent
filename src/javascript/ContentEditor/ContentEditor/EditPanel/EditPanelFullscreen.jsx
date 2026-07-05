import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './EditPanel.scss';
import {registry} from '@jahia/ui-extender';
import {LayoutContent} from '@jahia/moonstone';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditPanelHeader} from './EditPanelHeader/EditPanelHeader';
import {useContentEditorConfigContext} from '~/shared';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';

export const EditPanelFullscreen = ({title}) => {
    const config = useContentEditorConfigContext();
    const {advancedOpenTab} = config;
    // Tab state lives on the modal config so it survives subtree remounts during a language
    // switch (#2483); fall back to local state when rendered without that wiring.
    const [localActiveTab, setLocalActiveTab] = useState(advancedOpenTab ?? Constants.editPanel.editTab);
    const [activeTab, setActiveTab] = config.setActiveTab ? [config.activeTab, config.setActiveTab] : [localActiveTab, setLocalActiveTab];
    const {mode} = useContentEditorContext();

    // Without edit tab, no content editor
    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const tab = tabs.find(t => t.value === activeTab);

    if (!tab) {
        throw new CeModalError(`No tab found for the current active tab value (${activeTab}), check the registry for the "editHeaderTabsActions" target (valid values are: ${tabs.map(t => t.value).join(', ')})`);
    }

    // Track which tabs have been visited so we mount them lazily but keep them
    // mounted afterwards (CSS show/hide), preserving scroll position and local state.
    const [mountedTabs, setMountedTabs] = useState(() => new Set([activeTab]));
    useEffect(() => {
        setMountedTabs(prev => {
            if (prev.has(activeTab)) {
                return prev;
            }

            const next = new Set(prev);
            next.add(activeTab);
            return next;
        });
    }, [activeTab]);

    return (
        <LayoutContent
            className={styles.main}
            hasPadding={false}
            header={(
                <EditPanelHeader
                    {...tab.editPanelHeaderProps}
                    title={title}
                    isShowPublish={mode === Constants.routes.baseEditRoute}
                    activeTabState={[activeTab, setActiveTab]}
                />
            )}
            content={(
                <>
                    {tabs.map(t => (
                        <div
                            key={t.value}
                            className={clsx('flexFluid', 'flexCol', t.value !== activeTab && styles.hideTab)}
                        >
                            {mountedTabs.has(t.value) && t.displayableComponent}
                        </div>
                    ))}
                </>
            )}
        />
    );
};

EditPanelFullscreen.propTypes = {
    title: PropTypes.string.isRequired
};
