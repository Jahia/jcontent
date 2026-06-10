import React, {useMemo} from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {
    ButtonRendererShortLabel,
    getButtonRenderer
} from '~/ContentEditor/utils';
import {truncate} from '~/utils';
import {ButtonGroup, Dropdown, Header, Separator} from '@jahia/moonstone';
import styles from './EditPanelHeader.scss';
import {PublishMenu} from './PublishMenu';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {EditPanelLanguageSwitcher} from '../EditPanelLanguageSwitcher';
import {HeaderBadges} from '../HeaderBadges';
import PropTypes from 'prop-types';
import {ContentPath} from './ContentPath';
import {HeaderButtonActions, HeaderThreeDotsActions} from '../HeaderActions';
import clsx from 'clsx';
import {ContentTypeChip} from '../ContentTypeChip';

const ButtonRenderer = getButtonRenderer({
    defaultButtonProps: {size: 'big', color: 'accent'}
});

const BackButtonRenderer = getButtonRenderer({
    defaultButtonProps: {size: 'big', variant: 'ghost'},
    noIcon: true
});

export const EditPanelHeader = ({
    title,
    isShowPublish,
    hideLanguageSwitcher,
    activeTabState,
    targetActionKey = 'content-editor/header/3dots'
}) => {
    const ctx = useContentEditorContext();
    const {nodeData} = ctx;

    const {t} = useTranslation('jcontent');
    const [activeTab, setActiveTab] = activeTabState || [];

    const tabs = useMemo(
        () =>
            registry
                .find({type: 'action', target: 'editHeaderTabsActions'})
                // If `isDisplayable` is not defined, we default to displayed
                .filter(tab => tab && (tab.isDisplayable?.(ctx) ?? true)),
        [ctx]
    );

    return (
        <Header
            title={truncate(title, 60)}
            breadcrumb={
                nodeData?.path?.startsWith('/sites') && (
                    <ContentPath path={nodeData.path}/>
                )
            }
            contentType={<ContentTypeChip/>}
            mainActions={
                <div
                    className={clsx(
                        styles.headerMainActions,
                        'flexRow_center',
                        'alignCenter'
                    )}
                >
                    <DisplayAction
                        actionKey="backButton"
                        render={BackButtonRenderer}
                        buttonLabel={t('label.contentEditor.close')}
                    />
                    <DisplayActions
                        target="content-editor/header/main-save-actions"
                        render={ButtonRenderer}
                    />

                    {isShowPublish && (
                        <ButtonGroup
                            color="accent"
                            size="big"
                            className={styles.publishActions}
                        >
                            <DisplayActions
                                isMainButton
                                target="content-editor/header/main-publish-actions"
                                buttonProps={{size: 'big', color: 'accent'}}
                                render={ButtonRendererShortLabel}
                            />

                            <PublishMenu/>
                        </ButtonGroup>
                    )}
                </div>
            }
            toolbarLeft={
                <div className={styles.headerToolBar}>
                    {!hideLanguageSwitcher && (
                        <>
                            <EditPanelLanguageSwitcher/>
                            <Separator variant="vertical" size="medium"/>
                        </>
                    )}

                    <HeaderButtonActions targetActionKey={targetActionKey}/>
                    <HeaderThreeDotsActions targetActionKey={targetActionKey}/>
                </div>
            }
            toolbarRight={
                // <select value={activeTab} onChange={e => setActiveTab(e.target.value)}>
                //     <DisplayActions
                //         setActiveTab={setActiveTab}
                //         activeTab={activeTab}
                //         target="editHeaderTabsActions"
                //         nodeData={nodeData}
                //         render={renderProps => <option key={renderProps.value} value={renderProps.value}>{t(renderProps.buttonLabel)}</option>}
                //     />
                // </select>
                <Dropdown
                    data={[{label: 'Hello', value: 'hello'}]}
                    value={activeTab}
                    onChange={(_, item) => setActiveTab(item.value)}
                />
            }
            status={<HeaderBadges/>}
        />
    );
};

EditPanelHeader.propTypes = {
    title: PropTypes.string.isRequired,
    isShowPublish: PropTypes.bool,
    hideLanguageSwitcher: PropTypes.bool,
    activeTabState: PropTypes.arrayOf(
        PropTypes.exact({
            0: PropTypes.string.isRequired,
            1: PropTypes.func.isRequired
        })
    ),
    targetActionKey: PropTypes.string
};
