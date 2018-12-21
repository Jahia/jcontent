import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, CardMedia, Tooltip, Typography, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {ContextualMenu, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import {translate} from 'react-i18next';
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import 'moment-timezone';
import {fileIcon, isBrowserImage} from './filesGridUtils';
import {cmSetSelection, cmGoto} from '../redux/actions';
import {connect} from 'react-redux';
import {allowDoubleClickNavigation, isMarkedForDeletion} from '../utils';
import classNames from 'classnames';

const styles = theme => ({
    defaultCard: {
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
        position: 'relative',
        marginLeft: 0,
        marginRight: 0,
        padding: 0,
        minHeight: 200,
        maxHeight: 200,
        backgroundColor: theme.palette.background.paper,
        '& $mediaCardContentContainer': {
            width: 'calc(100% - 200px)'
        },
        '& $fileCardContentContainer': {
            width: 'calc(100% - 120px)'
        }
    },
    extraSmallCard: {
        minHeight: 150,
        maxHeight: 150,
        '& $mediaCardContentContainer': {
            width: 'calc(100% - 75px)'
        },
        '& $fileCardContentContainer': {
            width: 'calc(100% - 84px)'
        }
    },
    smallCard: {
        minHeight: 150,
        maxHeight: 150,
        '& $mediaCardContentContainer': {
            width: 'calc(100% - 125px)'
        },
        '& $fileCardContentContainer': {
            width: 'calc(100% - 84px)'
        }
    },
    largeCard: {
        '& $mediaCardContentContainer': {
            width: 'calc(100% - 300px)'
        },
        '& $fileCardContentContainer': {
            width: 'calc(100% - 120px)'
        }
    },
    verticalCard: {
        flexDirection: 'column',
        minHeight: 252,
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
    defaultFileCover: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    extraSmallCover: {
        minWidth: 75,
        maxWidth: 75,
        height: 100
    },
    smallCover: {
        minWidth: 125,
        maxWidth: 125,
        height: 150
    },
    defaultCover: {
        minWidth: 200,
        maxWidth: 200,
        height: 200
    },
    largeCover: {
        minWidth: 300,
        maxWidth: 300,
        height: 300
    },
    verticalCover: {
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
    actionButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        '& button': {
            padding: '8px'
        }
    },
    isDeleted: {
        textDecoration: 'line-through'
    },
    tooltip: {
        display: 'unset'
    },
    selectedCard: {
        boxShadow: '1px 0px 15px 4px ' + theme.palette.primary.main
    }
});

let Actions = ({classes, isHovered, node}) => isHovered &&
    <div className={classes.actionButtons}>
        <DisplayActions target="tableActions"
                        context={{path: node.path}}
                        render={iconButtonRenderer({
                            disableRipple: true
                        }, {
                            fontSize: 'small'
                        }, true)}/>
    </div>;

class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false
        };
    }

    render() {
        const {cardType, classes, t, node, dxContext, uiLang, setPath, selection} = this.props;
        const {isHovered} = this.state;

        let contextualMenu = React.createRef();

        const isImage = isBrowserImage(node.path);
        const isSelected = (selection && selection === node.path);

        let isExtraSmallCard = false;
        let isSmallCard = false;
        let isDefaultCard = false;
        let isLargeCard = false;
        let isVerticalCard = false;
        let maxLengthLabels;
        switch (cardType) {
            case 2:
                isVerticalCard = true;
                maxLengthLabels = 18;
                break;
            case 3:
                isExtraSmallCard = true;
                maxLengthLabels = 16;
                break;
            case 4:
                isSmallCard = true;
                maxLengthLabels = 16;
                break;
            case 6:
                isDefaultCard = true;
                maxLengthLabels = 28;
                break;
            default:
                isLargeCard = true;
                maxLengthLabels = 28;
        }

        return (
            <React.Fragment>
                <ContextualMenu ref={contextualMenu} actionKey="contextualMenuContent" context={{path: node.path}}/>

                <Card className={classNames(classes.defaultCard, isExtraSmallCard && classes.extraSmallCard, isSmallCard && classes.smallCard,
                    isLargeCard && classes.largeCard, isVerticalCard && classes.verticalCard, isSelected && classes.selectedCard)}
                      data-cm-role="grid-content-list-card"
                      onContextMenu={event => {
                          event.stopPropagation();
                          contextualMenu.current.open(event);
                      }}
                      onClick={() => this.props.onSelect(node.path)}
                      onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                      onMouseEnter={event => this.onHoverEnter(event)}
                      onMouseLeave={event => this.onHoverExit(event)}
                >
                    {!isVerticalCard && <PublicationStatus node={node}/>}

                    { isImage ?
                        <CardMedia className={classNames(isDefaultCard && classes.defaultCover,
                                                isExtraSmallCard && classes.extraSmallCover,
                                                isSmallCard && classes.smallCover,
                                                isLargeCard && classes.largeCover,
                                                isVerticalCard && classes.verticalCover)}
                                   image={`${dxContext.contextPath}/files/default/${node.path}?lastModified=${node.lastModified}&t=thumbnail2`}
                                   title={node.name}
                        /> :
                        <div className={classes.defaultFileCover}>
                            {fileIcon(node.path, isDefaultCard ? '10x' : '7x')}
                        </div>
                    }

                    <div className={isImage ? classes.mediaCardContentContainer : classes.fileCardContentContainer}>
                        {isVerticalCard && <PublicationStatus node={node}/>}

                        <Actions classes={classes} node={node} isHovered={isHovered}/>

                        <CardContent classes={{root: classes.cardContent}}>
                            <div>
                                <Typography color="textSecondary" variant="caption" component="p">
                                    {t('label.contentManager.filesGrid.name')}
                                </Typography>
                                {this.fileName(maxLengthLabels)}
                            </div>
                            {(!isVerticalCard) &&
                                <div>
                                    <Typography color="textSecondary" variant="caption" component="p">
                                        {t('label.contentManager.filesGrid.createdBy')}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2" component="p">
                                        {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                                        &nbsp;
                                        <Moment format="LLL" locale={uiLang}>
                                            {node.created}
                                        </Moment>
                                    </Typography>
                                </div>
                            }
                            {((isDefaultCard || isLargeCard) && node.width && node.height) &&
                                <div>
                                    <Typography color="textSecondary" variant="caption" component="p">
                                        {t('label.contentManager.filesGrid.fileInfo')}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2" component="p">
                                        {`${node.width} x ${node.height}`}
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

    fileName(maxLength) {
        const {classes, node} = this.props;
        const name = node.name;
        const shortenName = name.length > maxLength;

        let typography = (
            <Typography noWrap
                        component="p"
                        color="textSecondary"
                        className={isMarkedForDeletion(node) ? classes.isDeleted : ''}
                        variant="body2"
                        data-cm-role="grid-content-list-card-name"
            >
                {name}
            </Typography>
        );

        return shortenName ? (
            <Tooltip title={name} classes={{tooltip: classes.tooltip}}>
                {typography}
            </Tooltip>
        ) : typography;
    }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    uiLang: state.uiLang,
    selection: state.selection
});

const mapDispatchToProps = dispatch => ({
    onSelect: selection => dispatch(cmSetSelection(selection)),
    setPath: (path, params) => dispatch(cmGoto({path, params}))
});

const ComposedFileCard = compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(FileCard);

export default ComposedFileCard;
