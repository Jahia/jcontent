import React from 'react';
import {FullWidthContent} from '@jahia/design-system-kit';
import {FormBuilder} from './FormBuilder/FormBuilder';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {PublicationInfoProgress} from './PublicationInfoProgress';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import styles from './EditPanelContent.scss';
import {TwoPanelsContent} from '~/ContentEditor/actions/contenteditor/translate/TranslatePanel/TwoPanelsContent';
import {EditPanelLanguageSwitcher} from '~/shared';
import {useTranslation} from 'react-i18next';
import translateStyles from '../../actions/contenteditor/translate/styles.scss';

export const EditPanelContent = ({twoPanelsContentProps, languageSwitchTopOfLeftCol = false}) => {
    const {t} = useTranslation('jcontent');
    const {mode, isFullscreen} = useContentEditorConfigContext();

    return (
        <>
            {mode === Constants.routes.baseEditRoute && (
                <PublicationInfoProgress/>
            )}
            {isFullscreen ? (
                <TwoPanelsContent
                    {...twoPanelsContentProps}
                    leftCol={
                        <>
                            {languageSwitchTopOfLeftCol && <div className={translateStyles.languageDropDown}>
                                <span>
                                    {t(
                                        'label.contentEditor.edit.action.translate.translateToLanguage'
                                    )}
                                </span>
                                <EditPanelLanguageSwitcher/>
                            </div>}
                            <FormBuilder mode={mode}/>
                        </>
                    }
                />
            ) : (
                <FullWidthContent
                    classes={{root: styles.fullWidthRoot}}
                    data-sel-mode={mode}
                >
                    <FormBuilder mode={mode}/>
                </FullWidthContent>
            )}
        </>
    );
};
