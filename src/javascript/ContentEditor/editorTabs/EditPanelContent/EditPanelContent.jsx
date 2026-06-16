import React from 'react';
import {FullWidthContent, TwoColumnsContent} from '@jahia/design-system-kit';
import {FormBuilder} from './FormBuilder';
import {SidePanel, SidePanelContextProvider} from './SidePanel';
import {PublicationInfoProgress} from './PublicationInfoProgress';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import styles from './EditPanelContent.scss';

export const EditPanelContent = () => {
    const {mode, isFullscreen} = useContentEditorConfigContext();
    const ceCtx = useContentEditorContext();

    return (
        <>
            {mode === Constants.routes.baseEditRoute && <PublicationInfoProgress/>}
            {isFullscreen ?
                (
                    <TwoColumnsContent
                        classes={{root: styles.twoColumnsRoot, left: styles.col, right: styles.col}}
                        rightCol={
                            <SidePanelContextProvider value={{...ceCtx, isJContent: false}}>
                                <SidePanel/>
                            </SidePanelContextProvider>
                        }
                        data-sel-mode={mode}
                    >
                        <FormBuilder mode={mode}/>
                    </TwoColumnsContent>
                ) :
                (
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
