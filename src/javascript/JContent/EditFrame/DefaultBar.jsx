import {NodeIcon} from '~/utils';
import styles from './Box/Box.scss';
import {Area, Chip, HandleDrag, toIconComponent, Typography} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {includes} from 'lodash';
import React from 'react';
import {ContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import PropTypes from 'prop-types';
import {truncate} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';

const AreaShape = PropTypes.shape({
    isAbsolute: PropTypes.bool,
    isList: PropTypes.bool,
    isArea: PropTypes.bool
});

// eslint-disable-next-line react/prop-types
export const headerButtonWrapper = (Renderer, currentFrameRef) => ({onClick, ...props}) => (
    <Renderer
        onClick={(item, event) => onClick(item, {
            ...event,
            currentTarget: {
                ...event.currentTarget,
                getBoundingClientRect: () => {
                    const boundingClientRect = event.currentTarget.getBoundingClientRect();
                    const frameRect = currentFrameRef.current.getBoundingClientRect();
                    return new DOMRect(boundingClientRect.x + frameRect.x, boundingClientRect.y + frameRect.y, boundingClientRect.width, boundingClientRect.height);
                }
            }}
        )}
        {...props}
    />
);

const getAreaIcon = (node, area) => {
    const contextPath = window.contextJsParameters.contextPath;

    if (!node || !area) {
        return null;
    }

    if (area.isArea || area.isAbsolute) {
        return <Area/>;
    }

    if (node.primaryNodeType?.icon) {
        const url = node.primaryNodeType.icon;
        const iconUrl = `${contextPath}${url}${url.endsWith('.png') ? '' : '.png'}`;
        return toIconComponent(iconUrl);
    }

    if (area.isList) {
        return toIconComponent(`${contextPath}/modules/assets/icons/jnt_contentList.png`);
    }

    return <Area/>;
};

export const LabelBar = ({node, area, dragProps}) => {
    const {t} = useTranslation('jcontent');
    const title = truncate(node.displayName, 24);
    const boundComponentTitleAddOn = node?.boundComponent?.refNode?.displayName ? ` - ${t('jcontent:label.contentManager.pageBuilder.box.linkedTo')} ${node?.boundComponent?.refNode?.displayName}` : '';

    if (area) {
        return (
            <>
                <Chip variant="default"
                      color="accent"
                      label={area.isArea ? 'Area' : area.isAbsolute ? 'Absolute Area' : 'List'}
                      icon={getAreaIcon(node, area)}/>
                <Typography isNowrap weight="bold" variant="caption">{title}{boundComponentTitleAddOn}</Typography>
            </>
        );
    }

    return (
        <>
            {dragProps?.isDraggable && <HandleDrag color={dragProps?.isCanDrag ? undefined : 'gray'}/>}
            <NodeIcon node={node} className={styles.icon}/>
            <Typography
                isNowrap
                className={styles.title}
                weight={dragProps?.isDropAllowed ? 'bold' : 'default'}
                variant="caption"
            >
                {title}{boundComponentTitleAddOn}
            </Typography>
        </>
    );
};

LabelBar.propTypes = {
    node: {displayName: PropTypes.string},
    area: PropTypes.objectOf(AreaShape),
    dragProps: PropTypes.shape({
        isDraggable: PropTypes.bool,
        isCanDrag: PropTypes.bool,
        isDropAllowed: PropTypes.bool
    })
};

export const DefaultBar = ({node, language, displayLanguage, width, currentFrameRef, isActionsHidden, isStatusHidden, area, dragProps}) => {
    const WrappedButtonRendererNoLabel = headerButtonWrapper(ButtonRendererNoLabel, currentFrameRef);
    const WrappedButtonRenderer = headerButtonWrapper(ButtonRenderer, currentFrameRef);

    const displayLabels = width > 400;
    return (
        <>
            <LabelBar node={node} area={area} dragProps={dragProps}/>

            {!isStatusHidden && <ContentStatuses node={node}
                                                 hasLabel={displayLabels}
                                                 uilang={displayLanguage}
                                                 language={language}
                                                 renderedStatuses={['locked', 'warning', 'workInProgress', 'published', 'modified', 'markedForDeletion']}/>}

            {!isActionsHidden && (
                <>
                    <DisplayAction
                        actionKey="edit"
                        path={node.path}
                        render={displayLabels ? WrappedButtonRenderer : WrappedButtonRendererNoLabel}
                        buttonProps={{variant: 'ghost', size: 'default'}}
                    />

                    <DisplayAction
                        actionKey="contentItemActionsMenu"
                        path={node.path}
                        menuFilter={value => !includes(['edit'], value.key)}
                        render={WrappedButtonRendererNoLabel}
                        buttonProps={{variant: 'ghost', size: 'default'}}
                    />
                </>
            )}
        </>
    );
};

DefaultBar.propTypes = {
    node: PropTypes.object,
    language: PropTypes.string,
    displayLanguage: PropTypes.string,
    width: PropTypes.number,
    currentFrameRef: PropTypes.any,
    isActionsHidden: PropTypes.bool,
    isStatusHidden: PropTypes.bool,
    area: PropTypes.objectOf(AreaShape),
    dragProps: PropTypes.shape({
        isDraggable: PropTypes.bool,
        isCanDrag: PropTypes.bool,
        isDropAllowed: PropTypes.bool
    })
};
