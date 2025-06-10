import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {isBrowserImage, isPDF} from '../../ContentLayout.utils';
import {NodeIcon} from '~/utils';
import {allowDoubleClickNavigation, booleanValue} from '~/JContent/JContent.utils';
import clsx from 'clsx';
import FileName from './FileName';
import Actions from './Actions';
import FileSize from './FileSize';
import styles from './FileCard.scss';
import {ContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import JContentConstants from '~/JContent/JContent.constants';

function useDragDrop(node, tableConfig) {
    const ref = useRef(null);
    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: node});
    const [{isCanDrop: isCanDropFile}, dropFile] = useFileDrop({
        uploadType: node.primaryNodeType.name === 'jnt:folder' && JContentConstants.mode.UPLOAD,
        uploadPath: node.path
    });
    const [{dragging}, drag] = useNodeDrag({dragSource: node});

    if (booleanValue(tableConfig.dnd?.canDrop)) {
        drop(ref);
    }

    if (booleanValue(tableConfig.dnd?.canDropFile)) {
        dropFile(ref);
    }

    if (booleanValue(tableConfig.dnd?.canDrag)) {
        drag(ref);
    }

    return {isCanDrop, isCanDropFile, dragging, ref};
}

function getElement(node, encodedPath) {
    if (isBrowserImage(node)) {
        return (
            <div
                className={clsx(styles.cardPreviewAndIcon, {[styles.smallImage]: node.width && node.width.value < 200})}
                style={{backgroundImage: `url("${window.contextJsParameters.contextPath}/files/default/${encodedPath}?lastModified=${node.lastModified.value}&t=thumbnail2")`}}
            />
        );
    }

    if (isPDF(node) && node.thumbnailUrl && node.thumbnailUrl.endsWith('?t=thumbnail')) {
        return (
            <div
                className={clsx(styles.cardPreviewAndIcon, {[styles.smallImage]: node.width && node.width.value < 200})}
                style={{backgroundImage: `url("${node.thumbnailUrl}")`}}
            />
        );
    }

    return (
        <div className={styles.cardPreviewAndIcon}>
            <NodeIcon node={node}/>
        </div>
    );
}

function getIsHighlighted(node, previewSelection, isPreviewOpened, selection) {
    return (node.path === previewSelection && isPreviewOpened) || (selection.indexOf(node.path) > -1) || (selection.indexOf(node.uuid) > -1);
}

export const FileCard = ({
    node,
    lang,
    uilang,
    setPath,
    selection,
    isPreviewOpened,
    previewSelection,
    onClick,
    siteKey,
    mode,
    tableConfig,
    contextualMenuAction,
    onDoubleClick
}) => {
    const {t} = useTranslation('jcontent');
    const {isCanDrop, isCanDropFile, dragging, ref} = useDragDrop(node, tableConfig);

    const contextualMenu = useRef();

    const isHighlighted = getIsHighlighted(node, previewSelection, isPreviewOpened, selection);

    // This is to support IE11, please don't remove it, we need to put inline style in each element to place them into grid layout
    // let rowNumber = Math.floor(index / 2) + 1;
    // let columnNumber = (index % 2) + 1;
    const encodedPath = node.path.replace(/[^/]/g, encodeURIComponent);
    const showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node?.subNodes?.pageInfo?.totalCount > 0;
    const dblClick = onDoubleClick ? onDoubleClick : allowDoubleClickNavigation(node.primaryNodeType.name, null, () => setPath(siteKey, node.path, mode));

    return (
        <div
            ref={ref}
            className={clsx(
                styles.card,
                {
                    'moonstone-drag': dragging,
                    'moonstone-drop_card': isCanDrop || isCanDropFile
                },
                isHighlighted && styles.selected
            )}
            data-cm-role="grid-content-list-card"
            data-sel-role-card={node.name}
            aria-checked={isHighlighted}
            onContextMenu={event => {
                event.stopPropagation();
                if (contextualMenuAction) {
                    contextualMenu.current(event);
                }
            }}
            onClick={onClick}
            onDoubleClick={dblClick}
        >
            {contextualMenuAction && (<ContextualMenu
                    setOpenRef={contextualMenu}
                    actionKey={selection.length === 0 ? contextualMenuAction : (selection.indexOf(node.path) === -1 ? 'notSelectedContentMenu' : 'selectedContentMenu')}
                    currentPath={node.path}
                    path={selection.length === 0 || selection.indexOf(node.path) === -1 ? node.path : null}
                    paths={selection.length === 0 || selection.indexOf(node.path) === -1 ? null : selection}
                />
            )}

            {getElement(node, encodedPath)}

            <div className={styles.infoContainer}>
                <div className={styles.nameAndActions}>
                    <FileName node={node}/>
                    {contextualMenuAction && selection.length === 0 && <Actions node={node} className={styles.actions} action={contextualMenuAction}/>}
                </div>
                <div className={styles.fileInfo}>
                    <ContentStatuses hasLabel={false}
                                     className={styles.statuses}
                                     node={node}
                                     uilang={uilang}
                                     language={lang}
                                     renderedStatuses={['locked', 'workInProgress']}/>
                    {node.width && node.height &&
                        <Typography variant="caption" component="p">
                            {`${node.width.value} x ${node.height.value}`}
                        </Typography>}
                    {node.isFile &&
                        <Typography variant="caption" component="p">
                            <FileSize node={node}/>
                        </Typography>}
                    {showSubNodes && (
                        <Typography variant="caption" component="p">
                            {node?.subNodes?.pageInfo?.totalCount}
                            &nbsp;
                            {node?.subNodes?.pageInfo?.totalCount === 1 ?
                                t('jcontent:label.contentManager.filesGrid.element') : t('jcontent:label.contentManager.filesGrid.elements')}
                        </Typography>
                    )}
                </div>
                <ContentStatuses className={styles.statuses} node={node} uilang={uilang} language={lang} renderedStatuses={['published', 'modified', 'markedForDeletion']}/>
            </div>
        </div>
    );
};

FileCard.propTypes = {
    mode: PropTypes.string.isRequired,
    node: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    isPreviewOpened: PropTypes.bool,
    previewSelection: PropTypes.string,
    setPath: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func,
    siteKey: PropTypes.string.isRequired,
    uilang: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    selection: PropTypes.array,
    tableConfig: PropTypes.shape({
        dnd: PropTypes.shape({
            canDrag: PropTypes.bool,
            canDrop: PropTypes.bool,
            canDropFile: PropTypes.bool
        })
    }).isRequired,
    contextualMenuAction: PropTypes.string
};

export default FileCard;
