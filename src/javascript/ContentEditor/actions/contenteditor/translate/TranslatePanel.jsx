import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import {LayoutContent} from '@jahia/moonstone';
import {EditPanelHeader} from '~/ContentEditor/ContentEditor/EditPanel/EditPanelHeader';
import {FormBuilder} from '../../../editorTabs/EditPanelContent/FormBuilder';
import {EditPanelLanguageSwitcher} from '../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {useSyncScroll} from './useSyncScroll';
import clsx from 'clsx';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useResizeWatcher} from './useResizeWatcher';
import {SourceContentPanel} from './SourceContentPanel';
import {useTranslation} from 'react-i18next';

const TwoPanelsContent = ({leftCol, rightCol}) => {
    const {leftColRef, rightColRef} = useSyncScroll();
    useResizeWatcher({columnSelector: 'right-column'});

    return (
        <div className={styles.twoColumnsRoot}>
            <div ref={leftColRef} className={clsx(styles.col, styles.hideScrollbar)} data-sel-role="left-column">
                {leftCol}
            </div>
            <div ref={rightColRef} className={styles.col} data-sel-role="right-column">
                {rightCol}
            </div>
        </div>
    );
};

TwoPanelsContent.propTypes = {
    leftCol: PropTypes.node,
    rightCol: PropTypes.node
};

export const TranslatePanel = ({title}) => {
    const {mode} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');

    return (
        <LayoutContent
            className={styles.layoutContent}
            hasPadding={false}
            header={(
                <EditPanelHeader hideLanguageSwitcher title={title} targetActionKey="translate/header/3dots"/>
            )}
            content={(
                <TwoPanelsContent
                    leftCol={<SourceContentPanel/>}
                    rightCol={
                        <>

                            <div className={styles.languageDropDown}>
                                <span>{t('label.contentEditor.edit.action.translate.translateToLanguage')}</span>
                                <EditPanelLanguageSwitcher/>
                            </div>
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

