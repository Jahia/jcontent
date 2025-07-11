import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './styles.scss';
import {registry} from '@jahia/ui-extender';
import {LayoutContent} from '@jahia/moonstone';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditPanelHeader} from '~/ContentEditor/ContentEditor/EditPanel/EditPanelHeader';
import {FormBuilder} from '../../../editorTabs/EditPanelContent/FormBuilder';
import {EditPanelLanguageSwitcher} from '../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {useSyncScroll} from './useSyncScroll';
import clsx from 'clsx';

const ReadOnlyFormBuilder = ({lang, mode}) => {
    return (
        <>
            <EditPanelLanguageSwitcher/>
            <FormBuilder mode={mode}/>
        </>
    );
}

const TwoPanelsContent = ({leftCol, rightCol}) => {
    const {leftColRef, rightColRef} = useSyncScroll();

    return (
        <div className={styles.twoColumnsRoot}>
            <div className={clsx(styles.col, styles.leftCol)} data-sel-role="left-column" ref={leftColRef}>
                {leftCol}
            </div>
            <div className={styles.col} data-sel-role="right-column" ref={rightColRef}>
                {rightCol}
            </div>
        </div>
    );
};

export const TranslatePanel = ({title}) => {
    const [activeTab, setActiveTab] = useState(Constants.editPanel.editTab);
    const {mode} = useContentEditorContext();

    const tabs = registry.find({target: 'editHeaderTabsActions'});
    const EditPanelContent = tabs.find(tab => tab.value === Constants.editPanel.editTab).displayableComponent;

    return (
        <LayoutContent
            hasPadding={false}
            header={(
                <EditPanelHeader title={title} hideLanguageSwitcher/>
            )}
            content={(
                <TwoPanelsContent
                    leftCol={
                        <ReadOnlyFormBuilder/>
                    }
                    rightCol={
                        <>
                            <EditPanelLanguageSwitcher/>
                            <FormBuilder mode={mode}/>
                        </>
                    }
                />
            )}
        />
    );
};

TranslatePanel.propTypes = {
    title: PropTypes.string.isRequired
};

