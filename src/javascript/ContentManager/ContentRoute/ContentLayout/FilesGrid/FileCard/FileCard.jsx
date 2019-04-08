import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, CardMedia, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {compose} from 'react-apollo';
import {ContextualMenu} from '@jahia/react-material';
import {translate} from 'react-i18next';
import PublicationStatus from '../../PublicationStatus';
import Moment from 'react-moment';
import 'moment-timezone';
import {isBrowserImage} from '../FilesGrid.utils';
import FileIcon from '../FileIcon';
import {CM_DRAWER_STATES} from '../../../../ContentManager.redux-actions';
import {allowDoubleClickNavigation} from '../../../../ContentManager.utils';
import classNames from 'classnames';
import FileName from './FileName';
import Actions from './Actions';
import {Folder} from 'mdi-material-ui';

const styles = theme => ({
    detailedCard: {
        display: 'flex',
        cursor: 'pointer',
        position: 'relative',
        margin: theme.spacing.unit,
        minWidth: '100%',
        minHeight: 250,
        maxHeight: 250,
        backgroundColor: theme.palette.background.paper,
        '& $fileCardContentContainer': {
            width: 'calc(100% - 160px)'
        }
    },
    thumbCard: {
        flexDirection: 'column',
        flex: '1 1 0%',
        minHeight: 252,
        minWidth: 150,
        margin: theme.spacing.unit,
        maxHeight: 252,
        '& $defaultFileCover': {
            height: 150
        },
        '& $mediaCardContentContainer': {
            width: '100%'
        },
        '& $fileCardContentContainer': {
            width: '100%'
        }
    },
    detailedIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 250,
        '& svg': {
            fontSize: 160
        }
    },
    thumbIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
        '& svg': {
            fontSize: 112
        }
    },
    detailedCover: {
        minWidth: 250,
        maxWidth: 250,
        minHeight: 200
    },
    thumbCover: {
        height: 150
    },
    mediaCardContentContainer: {
        position: 'relative',
        width: '100%'
    },
    fileCardContentContainer: {
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
    }
});

export class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false
        };
    }

    render() {
        const {gridMode, classes, t, node, dxContext, uiLang, setPath, previewSelection, onPreviewSelect, previewState, siteKey, mode} = this.props;
        const {isHovered} = this.state;

        let contextualMenu = React.createRef();

        const isImage = isBrowserImage(node.path);
        const isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;
        const isPreviewSelected = (previewSelection && previewSelection === node.path) && isPreviewOpened;

        let isDetailedCard = false;
        let isThumbCard = false;
        let maxLengthLabels;
        switch (gridMode) {
            case 'thumbnail':
                isThumbCard = true;
                maxLengthLabels = 18;
                break;
            case 'detailed':
                isDetailedCard = true;
                maxLengthLabels = 28;
                break;
            default:
                isThumbCard = true;
                maxLengthLabels = 18;
        }

        return (
            <React.Fragment>
                <ContextualMenu ref={contextualMenu} actionKey="contentMenu" context={{path: node.path}}/>

                <Card
                    className={classNames(
                        isThumbCard && classes.thumbCard,
                        isDetailedCard && classes.detailedCard,
                        isPreviewSelected && classes.selectedCard
                    )}
                    data-cm-role="grid-content-list-card"
                    onContextMenu={event => {
                        event.stopPropagation();
                        contextualMenu.current.open(event);
                    }}
                    onClick={() => {
                        if (!node.notSelectableForPreview) {
                            onPreviewSelect(node.path);
                        }
                    }}
                    onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType.name, null, () => setPath(siteKey, node.path, mode))}
                    onMouseEnter={event => this.onHoverEnter(event)}
                    onMouseLeave={event => this.onHoverExit(event)}
                >
                    {!isThumbCard &&
                        <PublicationStatus node={node}/>
                    }

                    {isImage ?
                        <CardMedia
                            className={classNames(
                                isDetailedCard && classes.detailedCover,
                                isThumbCard && classes.thumbCover
                            )}
                            image={`${dxContext.contextPath}/files/default/${node.path}?lastModified=${node.lastModified.value}&t=thumbnail2`}
                            title={node.name}
                        /> :
                        <div className={isDetailedCard ? classes.detailedIcon : classes.thumbIcon}>
                            {node.primaryNodeType.name === 'jnt:folder' ?
                                <Folder color="action"/> :
                                <FileIcon filename={node.path} color="disabled"/>
                            }
                        </div>
                    }

                    <div className={isImage ? classes.mediaCardContentContainer : classes.fileCardContentContainer}>
                        {isThumbCard &&
                            <PublicationStatus node={node}/>
                        }

                        <Actions node={node} isHovered={isHovered}/>

                        <CardContent classes={{root: classes.cardContent}}>
                            <div>
                                <Typography variant="caption" component="p">
                                    {t('label.contentManager.filesGrid.name')}
                                </Typography>
                                <FileName maxLength={maxLengthLabels} node={node}/>
                            </div>
                            {!isThumbCard &&
                                <div>
                                    <Typography variant="caption" component="p">
                                        {t('label.contentManager.filesGrid.createdBy')}
                                    </Typography>
                                    <Typography variant="iota" component="p">
                                        {t('label.contentManager.filesGrid.author', {author: node.createdBy ? node.createdBy.value : ''})}
                                        &nbsp;
                                        <Moment format="LLL" locale={uiLang}>
                                            {node.created.value}
                                        </Moment>
                                    </Typography>
                                </div>
                            }
                            {(isDetailedCard) && node.width && node.height &&
                                <div>
                                    <Typography variant="caption" component="p">
                                        {t('label.contentManager.filesGrid.fileInfo')}
                                    </Typography>
                                    <Typography variant="iota" component="p">
                                        {`${node.width.value} x ${node.height.value}`}
                                    </Typography>
                                </div>
                            }
                        </CardContent>
                    </div>
                </Card>
            </React.Fragment>
        );
    }

    onHoverEnter() {
        this.setState({isHovered: true});
    }

    onHoverExit() {
        this.setState({isHovered: false});
    }
}

FileCard.propTypes = {
    classes: PropTypes.object.isRequired,
    dxContext: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    node: PropTypes.object.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    setPath: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    uiLang: PropTypes.string.isRequired,
    gridMode: PropTypes.string.isRequired
};

export default compose(
    withStyles(styles),
    translate()
)(FileCard);
