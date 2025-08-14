import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';
import {LayoutContent} from '@jahia/moonstone';
import {EditPanelHeader} from '~/ContentEditor/ContentEditor/EditPanel/EditPanelHeader';
import {FormBuilder} from '../../../../editorTabs/EditPanelContent/FormBuilder';
import {EditPanelLanguageSwitcher} from '../../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {SourceContentPanel} from './SourceContentPanel';
import {useTranslation} from 'react-i18next';
import {TwoPanelsContent} from './TwoPanelsContent';

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

