import React, {useState} from 'react';
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
    const {advancedOpenTab} = useContentEditorConfigContext();
    const [activeTab, setActiveTab] = useState(advancedOpenTab ?? Constants.editPanel.editTab);
    const {mode} = useContentEditorContext();

    // Without edit tab, no content editor
    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const tab = tabs.find(tab => tab.value === activeTab);

    if (!tab) {
        throw new CeModalError(`No tab found for the current active tab value (${activeTab}), check the registry for the "editHeaderTabsActions" target (valid values are: ${tabs.map(t => t.value).join(', ')})`);
    }

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
            content={tab.displayableComponent}
        />
    );
};

EditPanelFullscreen.propTypes = {
    title: PropTypes.string.isRequired
};
