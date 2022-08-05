import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, CardMedia} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import PublicationStatus from '../../PublicationStatus';
import {isBrowserImage} from '../../ContentLayout.utils';
import {NodeIcon} from '~/utils';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import {allowDoubleClickNavigation, getDefaultLocale} from '~/JContent/JContent.utils';
import classNames from 'clsx';
import FileName from './FileName';
import Actions from './Actions';
import dayjs from 'dayjs';
import FileSize from './FileSize';
import styles from './FileCard.scss';

export const FileCard = ({
    node,
    uilang,
    setPath,
    previewSelection,
    onPreviewSelect,
    previewState,
    siteKey,
    mode,
    index
}) => {
    const {t} = useTranslation('jcontent');

    let contextualMenu = useRef();

    const isImage = isBrowserImage(node.path);
    const isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;
    const isPreviewSelected = (previewSelection && previewSelection === node.path) && isPreviewOpened;
    let maxLengthLabels;
    maxLengthLabels = 28;

    // This is to support IE11, please don't remove it, we need to put inline style in each elements to place them into grid layout
    let rowNumber = Math.floor(index / 2) + 1;
    let columnNumber = (index % 2) + 1;
    let encodedPath = node.path.replace(/[^/]/g, encodeURIComponent);
    let showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node?.subNodes?.pageInfo?.totalCount > 0;

    return (
        <Card
                style={{msGridColumn: columnNumber, msGridRow: rowNumber}}
                className={classNames(
                    styles.card,
                    styles.detailedCard,
                    isPreviewSelected && styles.selectedCard
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

            <PublicationStatus node={node} styles={{publicationInfo: styles.publicationInfoDetailed}}/>

            {isImage ?
                <CardMedia
                        className={classNames(styles.detailedCover)}
                        image={`${window.contextJsParameters.contextPath}/files/default/${encodedPath}?lastModified=${node.lastModified.value}&t=thumbnail2`}
                        title={node.name}
                    /> :
                <div className={styles.detailedIcon}>
                    <NodeIcon node={node}/>
                </div>}

            <div className={isImage ? styles.mediaCardContentContainer : styles.fileCardContentContainer}>

                <Actions node={node} className={styles.actions}/>

                <CardContent classes={{root: styles.cardContent}}>
                    <div>
                        <Typography variant="caption" component="p">
                            {t('jcontent:label.contentManager.filesGrid.name')}
                        </Typography>
                        <FileName maxLength={maxLengthLabels} node={node}/>
                    </div>
                    <div>
                        <Typography variant="caption" component="p">
                            {t('jcontent:label.contentManager.filesGrid.createdBy')}
                        </Typography>
                        <Typography isNowrap component="p">
                            {t('jcontent:label.contentManager.filesGrid.author', {author: node.createdBy ? node.createdBy.value : ''})}
                            &nbsp;
                            <time>{dayjs(node.created.value).locale(getDefaultLocale(uilang)).format('LLL')}</time>
                        </Typography>
                    </div>
                    {node.width && node.height &&
                    <div>
                        <Typography variant="caption" component="p">
                            {t('jcontent:label.contentManager.filesGrid.fileInfo')}
                        </Typography>
                        <Typography variant="iota" component="p">
                            {`${node.width.value} x ${node.height.value}`} <FileSize node={node}/>
                        </Typography>
                    </div>}
                    {showSubNodes &&
                    <div>
                        <Typography variant="caption" component="p">
                            {t('jcontent:label.contentManager.filesGrid.contains')}
                        </Typography>
                        <Typography component="p">
                            {node?.subNodes?.pageInfo?.totalCount}
                            &nbsp;
                            {node?.subNodes?.pageInfo?.totalCount === 1 ?
                                t('jcontent:label.contentManager.filesGrid.element') : t('jcontent:label.contentManager.filesGrid.elements')}
                        </Typography>
                    </div>}
                </CardContent>
            </div>
        </Card>
    );
};

FileCard.propTypes = {
    mode: PropTypes.string.isRequired,
    node: PropTypes.object.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    setPath: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    uilang: PropTypes.string.isRequired
};

export default FileCard;
