import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './styles.scss';
import {LayoutContent} from '@jahia/moonstone';
import {EditPanelHeader} from '~/ContentEditor/ContentEditor/EditPanel/EditPanelHeader';
import {FormBuilder} from '../../../editorTabs/EditPanelContent/FormBuilder';
import {EditPanelLanguageSwitcher} from '../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {useSyncScroll} from './useSyncScroll';
import clsx from 'clsx';
import {Formik} from 'formik';
import {I18nContextHandler} from '../../../ContentEditor/EditPanel/I18nContextHandler';
import {ContentEditorConfigContextProvider, ContentEditorContextProvider, useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useTranslateFormDefinition} from './useTranslateFormDefinition';

const ReadOnlyFormikEditor = memo(({lang}) => {
    const {initialValues} = useContentEditorContext();
    const {mode} = useContentEditorContext();
    return (
        <Formik initialValues={{...initialValues, blah: lang}} onSubmit={() => {}}>
            <>
                <EditPanelLanguageSwitcher/>
                <FormBuilder mode={mode}/>
            </>
        </Formik>
    );
});
ReadOnlyFormikEditor.propTypes = {lang: PropTypes.string}

const ReadOnlyFormBuilder = ({lang}) => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();
    const [readOnlyParams, setReadOnlyParams] = useState({lang});

    return (
        <ContentEditorConfigContextProvider config={{
            ...ceConfigContext,
            lang: readOnlyParams.lang,
            translateLang: ceConfigContext.lang,
            readOnly: true,
            setReadOnlyParams
        }}>
            <ContentEditorContextProvider useFormDefinition={useTranslateFormDefinition} overrides={ceContext}>
                <ReadOnlyFormikEditor lang={readOnlyParams.lang}/>
            </ContentEditorContextProvider>
        </ContentEditorConfigContextProvider>
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
    const {mode} = useContentEditorContext();

    return (
        <LayoutContent
            className={styles.layoutContent}
            hasPadding={false}
            header={(
                <EditPanelHeader title={title} hideLanguageSwitcher/>
            )}
            content={(
                <TwoPanelsContent
                    leftCol={
                        // TODO set initial readOnly language
                        <ReadOnlyFormBuilder lang="fr"/>
                    }
                    rightCol={
                        <>
                            <EditPanelLanguageSwitcher/>
                            <FormBuilder mode={mode}/>
                            <I18nContextHandler/>
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

