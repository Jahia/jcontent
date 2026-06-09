import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './EditPanel.scss';
import clsx from 'clsx';
import {registry} from '@jahia/ui-extender';
import {LayoutContent} from '@jahia/moonstone';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditPanelHeader} from './EditPanelHeader';
import { useContentEditorConfigContext } from '~/shared';

export const EditPanelFullscreen = ({title}) => {
    const {advancedOpenTab} = useContentEditorConfigContext();
    console.log('advancedOpenTab', advancedOpenTab);
    const [activeTab, setActiveTab] = useState(advancedOpenTab ?? Constants.editPanel.editTab);
    const {mode} = useContentEditorContext();

    // Without edit tab, no content editor
    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const tab = tabs.find(tab => tab.value === activeTab);

    return (
        <LayoutContent
            className={styles.main}
            hasPadding={false}
            header={(
                <EditPanelHeader title={title}
                                 isShowPublish={mode === Constants.routes.baseEditRoute}
                                 activeTabState={[activeTab, setActiveTab]}
                />
            )}
            content={tab?.displayableComponent && <tab.displayableComponent tab={tab} />}
        />
    );
};

EditPanelFullscreen.propTypes = {
    title: PropTypes.string.isRequired
};
