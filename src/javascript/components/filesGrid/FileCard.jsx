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
import {ellipsizeText, allowDoubleClickNavigation, isMarkedForDeletion} from '../utils';

const styles = theme => ({
    card: {
        display: 'flex',
        maxHeight: 300,
        cursor: 'pointer',
        position: 'relative',
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20,
            marginLeft: '6px',
            marginRight: '23px'
        },
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON': {
            display: 'block'
        }
    },
    cardMedium: {
        display: 'flex',
        maxHeight: 150,
        cursor: 'pointer',
        position: 'relative',
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20,
            marginLeft: '6px',
            marginRight: '30px'
        },
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON': {
            display: 'block'
        }
    },
    cardVertical: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 200,
        minHeight: 200,
        cursor: 'pointer',
        position: 'relative',
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20,
            marginLeft: '6px',
            marginRight: '30px'
        },
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON': {
            display: 'block'
        }
    },
    details: {
        display: 'flex',
        '-ms-flex': 1,
        flexDirection: 'row'
    },
    verticalDetails: {
        display: 'flex',
        position: 'relative',
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20
        },
        '&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON': {
            display: 'block'
        }
    },
    content: {
        flex: '10'
    },
    publicationStatus: {
        flex: '1',
        height: 'auto'
    },
    coverLarge: {
        width: 300,
        backgroundColor: theme.palette.common.white,
        height: 300
    },
    coverMedium: {
        width: 150,
        height: 150
    },
    coverVertical: {
        height: 150
    },
    selectedCard: {
        backgroundColor: 'rgb(250,250,250)',
        boxShadow: '1px 0px 15px 4px rgba(247,150,5,1)'
    },
    actionsButton: {
        position: 'absolute',
        top: '11px',
        '&[data-sel-role="preview"]': {
            right: '60px'
        },
        '&[data-sel-role="edit"]': {
            right: '35px'
        },
        '&[data-sel-role="tableMenuActions"]': {
            right: '10px'
        },
        color: theme.palette.text.secondary,
        padding: 0,
        '&:hover': {
            backgroundColor: 'transparent'
        },
        '& svg': {
            width: '18px',
            height: '18px'
        }
    },
    renewIcon: {
        color: theme.palette.background.default
    },
    cardStyle: {
        marginLeft: 0,
        marginRight: 0,
        padding: 0,
        minHeight: 200,
        maxHeight: 200,
        backgroundColor: theme.palette.background.paper
    },
    cardContent: {
        marginLeft: Number(theme.spacing.unit),
        marginRight: '0 !important',
        padding: '5 !important'
    },
    textTypo: {
        color: theme.palette.text.secondary
    },
    typoBody: {
        fontSize: '14px',
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing.unit * 2
    },
    typoCaption: {
        color: theme.palette.text.secondary,
        fontSize: '12px'
    },
    typoCaptionLarge: {
        fontSize: '12px'
    },
    typoBodyLarge: {
        fontSize: '14px',
        marginBottom: theme.spacing.unit * 2
    },
    isDeleted: {
        color: '#91A3AE',
        textDecoration: 'line-through'
    }
});

const PUBLICATION_INFO_WIDTH_LARGE = 400;
const PUBLICATION_INFO_WIDTH_MED = 300;
const PUBLICATION_INFO_WIDTH_SMALL = 150;

const MAX_LENGTH_MEDIA_LABELS_LARGE = 30;
const MAX_LENGTH_MEDIA_LABELS_MEDIUM = 25;
const MAX_LENGTH_MEDIA_LABELS_VERTICAL = 25;
const MAX_LENGTH_FILES_LABELS_VERTICAL = 15;

class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false
        };
    }

    render() {
        const {node} = this.props;
        let contextualMenu = React.createRef();
        return (
            <React.Fragment>
                <ContextualMenu ref={contextualMenu} actionKey="contextualMenuContent" context={{path: node.path}}/>
                {isBrowserImage(node.path) ? this.regularMediaCard(contextualMenu) : this.fileCard(contextualMenu)}
            </React.Fragment>
        );
    }

    regularMediaCard(contextualMenu) {
        let {cardType} = this.props;

        switch (cardType) {
            case 2: return this.verticalMediaCard(contextualMenu);
            case 6:
            case 12: return this.largeMediaCard(contextualMenu);
            default: return this.mediumMediaCard(contextualMenu);
        }
    }

    fileCard(contextualMenu) {
        let {cardType} = this.props;

        switch (cardType) {
            case 2: return this.verticalFileCard(contextualMenu);
            case 3: return this.mediumFileCard(contextualMenu);
            case 6:
            case 12: return this.largeFileCard(contextualMenu);
            default: return this.mediumFileCard(contextualMenu);
        }
    }

    onHoverEnter() {
        this.setState({isHovered: true});
    }

    onHoverExit() {
        this.setState({isHovered: false});
    }

    largeMediaCard(contextualMenu) {
        const {classes, t, node, dxContext, uiLang, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card
                className={this.generateCardClass(node, classes.card)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))} onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_LARGE}/>
                <CardMedia
                    className={classes.coverLarge}
                    image={`${dxContext.contextPath}/files/default/${node.path}?lastModified=${node.lastModified}`}
                    title={node.name}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node, MAX_LENGTH_MEDIA_LABELS_LARGE, classes.typoBodyLarge, 6)}
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.createdBy')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                        &nbsp;
                            <Moment format="LLL" locale={uiLang}>
                                {node.created}
                            </Moment>
                        </Typography>
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.fileInfo')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                            {`${node.width} x ${node.height}`}
                        </Typography>
                    </CardContent>
                </div>
            </Card>
        );
    }

    mediumMediaCard(contextualMenu) {
        const {classes, t, node, dxContext, uiLang, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card className={this.generateCardClass(node, classes.cardMedium)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_MED}/>
                <CardMedia
                    className={classes.coverMedium}
                    image={`${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2`}
                    title={node.name}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}} style={{width: '100%'}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node, MAX_LENGTH_MEDIA_LABELS_MEDIUM, classes.typoBody)}
                        <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.createdBy')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                        &nbsp;
                            <Moment format="LLL" locale={uiLang}>
                                {node.created}
                            </Moment>
                        </Typography>
                    </CardContent>
                </div>
            </Card>
        );
    }

    verticalMediaCard(contextualMenu) {
        const {classes, t, node, dxContext, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card className={this.generateCardClass(node, classes.cardVertical)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                <CardMedia
                    style={{flex: 2}}
                    className={classes.coverVertical}
                    image={`${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2`}
                    title={node.name}
                />
                <div className={classes.verticalDetails} style={{flex: 1.5}}>
                    <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_SMALL}/>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node, MAX_LENGTH_MEDIA_LABELS_VERTICAL, classes.typoBody)}
                    </CardContent>
                </div>
            </Card>
        );
    }

    largeFileCard(contextualMenu) {
        const {classes, t, node, uiLang, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card className={this.generateCardClass(node, classes.card)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_LARGE}/>
                {fileIcon(node.path, '6x', {fontSize: '160px'})}
                <div className={classes.details}>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node)}
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.createdBy')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                        &nbsp;
                            <Moment format="LLL" locale={uiLang}>
                                {node.created}
                            </Moment>
                        </Typography>
                        <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.fileInfo')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                            {`${node.width} x ${node.height}`}
                        </Typography>
                    </CardContent>
                </div>
            </Card>
        );
    }

    mediumFileCard(contextualMenu) {
        const {classes, t, node, uiLang, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card className={this.generateCardClass(node, classes.card)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_MED}/>
                {fileIcon(node.path, '6x', {fontSize: '110px'})}
                <div className={classes.details}>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node, MAX_LENGTH_MEDIA_LABELS_VERTICAL, classes.typoBody, 3)}
                        <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.createdBy')}
                        </Typography>
                        <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                            {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                        &nbsp;
                            <Moment format="LLL" locale={uiLang}>
                                {node.created}
                            </Moment>
                        </Typography>
                    </CardContent>
                </div>
            </Card>
        );
    }

    verticalFileCard(contextualMenu) {
        const {classes, t, node, cardType, uiLang, setPath} = this.props;

        let {isHovered} = this.state;

        return (
            <Card className={this.generateCardClass(node, classes.cardVertical)}
                classes={{root: classes.cardStyle}}
                data-cm-role="grid-content-list-card"
                onContextMenu={event => {
                    event.stopPropagation();
                    contextualMenu.current.open(event);
                }}
                onClick={() => this.props.onSelect([node])}
                onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(node.path))}
                onMouseEnter={event => this.onHoverEnter(event)}
                onMouseLeave={event => this.onHoverExit(event)}
                >
                {fileIcon(node.path, '6x', {fontSize: '110px'})}
                <div className={classes.details} style={{height: '100%'}}>
                    <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_SMALL}/>
                    <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                        {isHovered && <DisplayActions target="tableActions" context={{path: node.path}}
                            render={iconButtonRenderer({disableRipple: true, className: classes.actionsButton}, true)}/>
                        }
                        <Typography classes={{caption: classes.typoCaption}} variant="caption">
                            {t('label.contentManager.filesGrid.name')}
                        </Typography>
                        {this.fileName(node, MAX_LENGTH_FILES_LABELS_VERTICAL, classes.typoBody)}
                        {cardType !== 2 &&
                        <React.Fragment>
                            <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                                {t('label.contentManager.filesGrid.createdBy')}
                            </Typography>
                            <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                                {t('label.contentManager.filesGrid.author', {author: node.createdBy})}
                                &nbsp;
                                <Moment format="LLL" locale={uiLang}>
                                    {node.created}
                                </Moment>
                            </Typography>
                        </React.Fragment>
                        }
                    </CardContent>
                </div>
            </Card>
        );
    }

    fileName(node, maxLength, bodyClass, cardType) {
        let name = node.name;
        let shortenName = (!cardType || this.props.cardType === cardType) && name.length > maxLength;
        let bodyClassToUse = bodyClass;

        if (isMarkedForDeletion(node)) {
            bodyClassToUse = bodyClassToUse + ' ' + this.props.classes.isDeleted;
        }
        let typography = (
            <Typography classes={{body2: bodyClassToUse}} variant="body2" className={this.props.classes.textTypo} data-cm-role="grid-content-list-card-name">
                {shortenName ? ellipsizeText(name, maxLength) : name}
            </Typography>
        );

        return shortenName ? (
            <Tooltip title={name}>
                {typography}
            </Tooltip>
        ) : typography;
    }

    generateCardClass(node, baseClass) {
        const {classes} = this.props;
        return node.isSelected ? `${baseClass} ${classes.selectedCard}` : baseClass;
    }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    uiLang: state.uiLang
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
