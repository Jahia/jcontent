import React from 'react';
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
import {useResizeWatcher} from './useResizeWatcher';

const ReadOnlyFormikEditor = () => {
    const {initialValues} = useContentEditorContext();
    const {mode} = useContentEditorConfigContext();
    useResizeWatcher({columnSelector: 'left-column'});
    return (
        <Formik initialValues={{...initialValues}} onSubmit={() => {}}>
            <>
                <EditPanelLanguageSwitcher/>
                <FormBuilder mode={mode}/>
            </>
        </Formik>
    );
};

const ReadOnlyFormBuilder = () => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();

    return (
        <ContentEditorConfigContextProvider config={{
            ...ceConfigContext,
            lang: ceConfigContext.sbsContext.lang,
            sbsContext: {
                ...ceConfigContext.sbsContext,
                enabled: true,
                readOnly: true,
                translateLang: ceConfigContext.lang,
            }
        }}
        >
            <ContentEditorContextProvider useFormDefinition={useTranslateFormDefinition} overrides={ceContext}>
                <ReadOnlyFormikEditor/>
            </ContentEditorContextProvider>
        </ContentEditorConfigContextProvider>
    );
};

const TwoPanelsContent = ({leftCol, rightCol}) => {
    const {leftColRef, rightColRef} = useSyncScroll();

    return (
        <div className={styles.twoColumnsRoot}>
            <div ref={leftColRef} className={clsx(styles.col, styles.leftCol)} data-sel-role="left-column">
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
    useResizeWatcher({columnSelector: 'right-column'});

    return (
        <LayoutContent
            className={styles.layoutContent}
            hasPadding={false}
            header={(
                <EditPanelHeader hideLanguageSwitcher title={title}/>
            )}
            content={(
                <TwoPanelsContent
                    leftCol={<ReadOnlyFormBuilder/>}
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

