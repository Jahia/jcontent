import React from 'react';
import {FullWidthContent} from '@jahia/design-system-kit';
import {FormBuilder} from './FormBuilder/FormBuilder';
import {
    useContentEditorConfigContext
} from '~/ContentEditor/contexts';
import {PublicationInfoProgress} from './PublicationInfoProgress';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import styles from './EditPanelContent.scss';
import {TwoPanelsContent} from '~/ContentEditor/actions/contenteditor/translate/TranslatePanel/TwoPanelsContent';

export const EditPanelContent = ({tab}) => {
    const {mode, isFullscreen} = useContentEditorConfigContext();

    return (
        <>
            {mode === Constants.routes.baseEditRoute && <PublicationInfoProgress/>}
            {isFullscreen ? (
                <TwoPanelsContent
                    leftCol={<FormBuilder mode={mode}/>}
                    rightCol={tab?.side?.component && <tab.side.component/>}
                    singleSyncedScrollbar={tab?.side?.singleSyncedScrollbar}
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
