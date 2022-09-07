import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {isBrowserImage} from '../../ContentLayout.utils';
import {NodeIcon} from '~/utils';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import {allowDoubleClickNavigation} from '~/JContent/JContent.utils';
import classNames from 'clsx';
import FileName from './FileName';
import Actions from './Actions';
import FileSize from './FileSize';
import styles from './FileCard2.scss';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';

export const FileCard = ({
    node,
    lang,
    uilang,
    setPath,
    previewSelection,
    onPreviewSelect,
    previewState,
    siteKey,
    mode
}) => {
    const {t} = useTranslation('jcontent');

    let contextualMenu = useRef();

    const isImage = isBrowserImage(node.path);
    const isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;
    const isPreviewSelected = (previewSelection && previewSelection === node.path) && isPreviewOpened;

    // This is to support IE11, please don't remove it, we need to put inline style in each elements to place them into grid layout
    // let rowNumber = Math.floor(index / 2) + 1;
    // let columnNumber = (index % 2) + 1;
    let encodedPath = node.path.replace(/[^/]/g, encodeURIComponent);
    let showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node?.subNodes?.pageInfo?.totalCount > 0;

    return (
        <div
            className={classNames(
                styles.card,
                isPreviewSelected && styles.selected
            )}
            data-cm-role="grid-content-list-card"
            onContextMenu={event => {
                event.stopPropagation();
                contextualMenu.current(event);
            }}
            onClick={() => {
                if (!node.notSelectableForPreview) {
                    onPreviewSelect(node.path);
                }
            }}
            onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType.name, null, () => setPath(siteKey, node.path, mode))}
        >
            <ContextualMenu setOpenRef={contextualMenu} actionKey="contentMenu" path={node.path}/>

            {isImage ?
                <div
                    className={classNames(styles.cardPreviewAndIcon)}
                    style={{backgroundImage: `url("${window.contextJsParameters.contextPath}/files/default/${encodedPath}?lastModified=${node.lastModified.value}&t=thumbnail2")`}}
                /> :
                <div className={styles.cardPreviewAndIcon}>
                    <NodeIcon node={node}/>
                </div>}

            <div className={styles.infoContainer}>
                <div className={styles.nameAndActions}>
                    <FileName node={node}/>
                    <Actions node={node} className={styles.actions}/>
                </div>
                <div className={styles.fileInfo}>
                    <ContentStatuses className={styles.statuses} node={node} uilang={uilang} language={lang} renderedStatuses={['locked', 'workInProgress']}/>
                    {node.width && node.height &&
                        <Typography variant="caption" component="p">
                            {`${node.width.value} x ${node.height.value}`} <FileSize node={node}/>
                        </Typography>}
                    {showSubNodes &&
                        <Typography variant="caption" component="p">
                            {node?.subNodes?.pageInfo?.totalCount}
                            &nbsp;
                            {node?.subNodes?.pageInfo?.totalCount === 1 ?
                                t('jcontent:label.contentManager.filesGrid.element') : t('jcontent:label.contentManager.filesGrid.elements')}
                        </Typography>}
                </div>
                <ContentStatuses className={styles.statuses} node={node} uilang={uilang} language={lang} renderedStatuses={['published', 'modified']}/>
            </div>
        </div>
    );
};

FileCard.propTypes = {
    mode: PropTypes.string.isRequired,
    node: PropTypes.object.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    setPath: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    uilang: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired
};

export default FileCard;
