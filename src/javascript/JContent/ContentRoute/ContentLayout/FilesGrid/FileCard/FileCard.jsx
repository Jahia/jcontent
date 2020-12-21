import React from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, CardMedia, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {ContextualMenu} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import PublicationStatus from '../../PublicationStatus';
import {isBrowserImage} from '../../ContentLayout.utils';
import FileIcon from '../FileIcon';
import {CM_DRAWER_STATES} from '../../../../JContent.redux';
import {allowDoubleClickNavigation, getDefaultLocale} from '../../../../JContent.utils';
import classNames from 'classnames';
import FileName from './FileName';
import Actions from './Actions';
import {Folder} from 'mdi-material-ui';
import dayjs from 'dayjs';
import FileSize from './FileSize';

const styles = theme => ({
    detailedCard: {
        display: 'flex',
        cursor: 'pointer',
        position: 'relative',
        margin: '0 16px 16px 0',
        minWidth: 200,
        minHeight: 200,
        maxHeight: 200,
        backgroundColor: theme.palette.background.paper,
        '& $fileCardContentContainer': {
            width: 'calc(100% - 160px)'
        }
    },
    card: {
        '&:hover $actions': {
            display: 'block'
        }
    },
    detailedIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        '& svg': {
            fontSize: 160
        }
    },
    detailedCover: {
        minWidth: 200,
        maxWidth: 200,
        minHeight: 200,
        backgroundSize: 'contain',
        backgroundColor: '#DADADA'
    },
    thumbCoverDetailed: {
        height: 200
    },
    mediaCardContentContainer: {
        minWidth: 0,
        position: 'relative',
        width: '100%'
    },
    fileCardContentContainer: {
        minWidth: 0,
        position: 'relative',
        width: '100%'
    },
    cardContent: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingTop: theme.spacing.unit * 3,
        '& div': {
            marginBottom: theme.spacing.unit * 2
        }
    },
    selectedCard: {
        boxShadow: '1px 0px 15px 4px ' + theme.palette.primary.main
    },
    publicationInfoDetailed: {
        minWidth: 400 - (theme.spacing.unit * 4) - 6
    },
    actions: {
        position: 'absolute',
        top: 8,
        right: 8,
        '& button': {
            padding: '8px',
            margin: '0px'
        },
        display: 'none'
    }
});

export const FileCard = ({
    classes,
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
    const {t} = useTranslation();

    let contextualMenu = React.createRef();

    const isImage = isBrowserImage(node.path);
    const isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;
    const isPreviewSelected = (previewSelection && previewSelection === node.path) && isPreviewOpened;
    let maxLengthLabels;
    maxLengthLabels = 28;

    // This is to support IE11, please don't remove it, we need to put inline style in each elements to place them into grid layout
    let rowNumber = Math.floor(index / 2) + 1;
    let columnNumber = (index % 2) + 1;
    let encodedPath = node.path.replace(/[^/]/g, encodeURIComponent);
    let isPdf = node.children ? node.children.nodes.filter(node => node.mimeType.value === 'application/pdf').length !== 0 : false;
    return (
        <Card
                style={{msGridColumn: columnNumber, msGridRow: rowNumber}}
                className={classNames(
                    classes.card,
                    classes.detailedCard,
                    isPreviewSelected && classes.selectedCard
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

            <PublicationStatus node={node} classes={{publicationInfo: classes.publicationInfoDetailed}}/>

            {isImage ?
                <CardMedia
                        className={classNames(classes.detailedCover)}
                        image={`${window.contextJsParameters.contextPath}/files/default/${encodedPath}?lastModified=${node.lastModified.value}&t=thumbnail2`}
                        title={node.name}
                    /> :
                <div className={classes.detailedIcon}>
                    {node.primaryNodeType.name === 'jnt:folder' ?
                        <Folder color="action"/> :
                            isPdf ?
                                <img src={`${window.contextJsParameters.contextPath}/files/default/${encodedPath}?t=thumbnail`} className={classes.thumbCoverDetailed}/> :
                                <FileIcon filename={node.path} color="disabled"/>}
                </div>}

            <div className={isImage ? classes.mediaCardContentContainer : classes.fileCardContentContainer}>

                <Actions node={node} className={classes.actions}/>

                <CardContent classes={{root: classes.cardContent}}>
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
                        <Typography variant="iota" component="p">
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
                </CardContent>
            </div>
        </Card>
    );
};

FileCard.propTypes = {
    classes: PropTypes.object.isRequired,
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

export default withStyles(styles)(FileCard);
