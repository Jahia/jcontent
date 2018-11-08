import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, CardMedia, IconButton, Tooltip, Typography, withStyles} from '@material-ui/core';
import {compose} from "react-apollo/index";
import {DisplayAction} from "@jahia/react-material"
import {translate} from "react-i18next";
import {Autorenew, Visibility} from "@material-ui/icons";
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import 'moment-timezone';
import {fileIcon, isBrowserImage} from './filesGridUtils';
import {cmSetSelection} from "../redux/actions";
import {connect} from "react-redux";
import {ellipsizeText} from "../utils";

const styles = theme => ({
    card: {
        display: 'flex',
        maxHeight: 300,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 20,
            marginLeft: '6px',
            marginRight: '30px',
        },
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
            display: "block"
        }
    },
    cardMedium: {
        display: 'flex',
        maxHeight: 150,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 20,
            marginLeft: '6px',
            marginRight: '30px',
        },
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
            display: "block"
        }
    },
    cardVertical: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 200,
        minHeight: 200,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 20,
            marginLeft: '6px',
            marginRight: '30px',
        },
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
            display: "block"
        }
    },
    details: {
        display: 'flex',
        '-ms-flex': 1,
        flexDirection: 'row',
    },
    verticalDetails: {
        display: "flex",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 20
        },
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
            display: "block"
        }
    },
    content: {
        flex: '10',
    },
    publicationStatus: {
        flex: "1",
        height: "auto"
    },
    coverLarge: {
        width: 300,
        backgroundColor: theme.palette.common.white,
        height: 300,
    },
    coverMedium: {
        width: 150,
        height: 150,
    },
    coverVertical: {
        height: 150,
    },
    selectedCard: {
        backgroundColor: "rgb(250,250,250)",
        boxShadow: "1px 0px 15px 4px rgba(247,150,5,1)"
    },
    visibilityButton: {
        position: "absolute",
        top: "11px",
        right: "10px",
        color: theme.palette.background.default,
        padding: 0,
        '&:hover': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width: "18px",
            height: "18px"
        }
    },
    renewIcon: {
        color: theme.palette.background.default,
    },
    publishButton: {
        position: "absolute",
        top: "12px",
        right: "35px",
        color: theme.palette.background.default,
        '&:hover': {
            backgroundColor: "transparent"
        },
        '&:active': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width: "18px",
            height: "18px"
        }
    },
    publishButtonAlternate: {
        position: "absolute",
        top: "30px",
        right: "10px",
        color: "#fff",
        '&:hover': {
            backgroundColor: "transparent"
        },
        '&:active': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width: "18px",
            height: "18px"
        }
    },
    cardStyle: {
        marginLeft: 0,
        marginRight: 0,
        padding: 0,
        minHeight: 200,
        maxHeight: 200,
        backgroundColor: 'rgb(245,245,245)'
    },
    cardContent: {
        marginLeft: theme.spacing.unit * 1,
        marginRight: '0 !important',
        padding: '5 !important',
    },
    textTypo: {
        color: theme.palette.background.default,
    },
    typoBody: {
        fontSize: '14px',
        color: theme.palette.background.default,
        marginBottom: theme.spacing.unit * 2,
    },
    typoCaption: {
        color: theme.palette.background.default,
        fontSize: '12px'
    },
    typoCaptionLarge: {
        fontSize: '12px'
    },
    typoBodyLarge: {
        fontSize: '14px',
        marginBottom: theme.spacing.unit * 2,
    },
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
    }

    render() {

        const {node} = this.props;
        let context = {

        };
        return <DisplayAction actionKey={"contextualMenuContent"} context={context} render={
            ({context}) => isBrowserImage(node.path) ? this.regularMediaCard(context) : this.fileCard(context)
        }/>
    }

    regularMediaCard(menuContext) {

        let {cardType} = this.props;

        switch(cardType) {
            case 2 : return this.verticalMediaCard(menuContext);
            case 6 :
            case 12 : return this.largeMediaCard(menuContext);
            default : return this.mediumMediaCard(menuContext);
        }
    }

    fileCard(menuContext) {

        let {cardType} = this.props;

        switch(cardType) {
            case 2 : return this.verticalFileCard(menuContext);
            case 3 : return this.mediumFileCard(menuContext);
            case 6 :
            case 12 : return this.largeFileCard(menuContext);
            default : return this.mediumFileCard(menuContext);
        }
    }

    largeMediaCard(menuContext) {

        const {classes, t, node, dxContext, cardType, uiLang} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.card)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
        >
            <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_LARGE}/>
            <CardMedia
                className={classes.coverLarge}
                image={`${dxContext.contextPath}/files/default/${node.path}`}
                title={node.name}
            />
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    {this.fileName(node.name, MAX_LENGTH_MEDIA_LABELS_LARGE, classes.typoBodyLarge, 6)}
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.createdBy")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.author", {author: node.createdBy})}
                        &nbsp;
                        <Moment format={"LLL"} locale={uiLang}>
                            {node.created}
                        </Moment>
                    </Typography>
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.fileInfo")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        {`${node.width} x ${node.height}`}
                    </Typography>
                </CardContent>
            </div>
        </Card>;
    }

    mediumMediaCard(menuContext) {

        const {classes, t, node, dxContext, uiLang} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.cardMedium)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
        >
            <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_MED}/>
            <CardMedia
                className={classes.coverMedium}
                image={`${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2`}
                title={node.name}
            />
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{root: classes.cardContent}} style={{width: '100%'}}>
                    <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    {this.fileName(node.name, MAX_LENGTH_MEDIA_LABELS_MEDIUM, classes.typoBody)}
                    <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.createdBy")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.author", {author: node.createdBy})}
                        &nbsp;
                        <Moment format={"LLL"} locale={uiLang}>
                            {node.created}
                        </Moment>
                    </Typography>
                </CardContent>
            </div>
        </Card>;
    }

    verticalMediaCard(menuContext) {

        const {classes, t, node, dxContext} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.cardVertical)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
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
                    <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    {this.fileName(node.name, MAX_LENGTH_MEDIA_LABELS_VERTICAL, classes.typoBody)}
                </CardContent>
            </div>
        </Card>;
    }

    largeFileCard(menuContext) {

        const {classes, t, node, uiLang} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.card)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
        >
            <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_LARGE}/>
            {fileIcon(node.path, '6x', {fontSize: "160px"})}
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        {node.name}
                    </Typography>
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.createdBy")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.author", {author: node.createdBy})}
                        &nbsp;
                        <Moment format={"LLL"} locale={uiLang}>
                            {node.created}
                        </Moment>
                    </Typography>
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.fileInfo")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        {`${node.width} x ${node.height}`}
                    </Typography>
                </CardContent>
            </div>
        </Card>;
    }

    mediumFileCard(menuContext) {

        const {classes, t, node, cardType, uiLang} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.card)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
        >
            <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_MED}/>
            {fileIcon(node.path, '6x', {fontSize: "110px"})}
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{root: classes.cardContent}}>
                    <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    {this.fileName(node.name, MAX_LENGTH_MEDIA_LABELS_VERTICAL, classes.typoBody, 3)}
                    <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.createdBy")}
                    </Typography>
                    <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                        {t("label.contentManager.filesGrid.author", {author: node.createdBy})}
                        &nbsp;
                        <Moment format={"LLL"} locale={uiLang}>
                            {node.created}
                        </Moment>
                    </Typography>
                </CardContent>
            </div>
        </Card>;
    }

    verticalFileCard(menuContext) {

        const {classes, t, node, cardType, uiLang} = this.props;

        return <Card
            className={this.generateCardClass(node, classes.cardVertical)}
            classes={{root: classes.cardStyle}}
            onContextMenu={(event) => menuContext.onContextMenu(menuContext, event)}
            // onContextMenu={(event) => {onContextualMenu({isOpen: true, event: event, menuId: "contextualMenuContentAction", ...node})}}
            onClick={() => this.props.onSelect([node])}
        >
            {fileIcon(node.path, '6x', {fontSize: "110px"})}
            <div className={classes.details} style={{height: '100%'}}>
                <PublicationStatus node={node} publicationInfoWidth={PUBLICATION_INFO_WIDTH_SMALL}/>
                <CardContent className={classes.content}  classes={{root: classes.cardContent}}>
                    <Typography classes={{caption: classes.typoCaption}} variant="caption">
                        {t("label.contentManager.filesGrid.name")}
                    </Typography>
                    {this.fileName(node.name, MAX_LENGTH_FILES_LABELS_VERTICAL, classes.typoBody)}
                    {cardType !== 2 &&
                        <React.Fragment>
                            <Typography classes={{caption: classes.typoCaption}} variant="caption" className={classes.textTypo}>
                                {t("label.contentManager.filesGrid.createdBy")}
                            </Typography>
                            <Typography classes={{body2: classes.typoBody}} variant="body2" className={classes.textTypo}>
                                {t("label.contentManager.filesGrid.author", {author: node.createdBy})}
                                &nbsp;
                                <Moment format={"LLL"} locale={uiLang}>
                                    {node.created}
                                </Moment>
                            </Typography>
                        </React.Fragment>
                    }
                </CardContent>
            </div>
        </Card>;
    }

    fileName(name, maxLength, bodyClass, cardType) {

        let abbreviatableCardType = (cardType == null || this.props.cardType === cardType);

        return <Tooltip title={(abbreviatableCardType && name.length > maxLength) ? name : ""}>
            <Typography classes={{body2: bodyClass}} variant={"body2"} className={this.props.classes.textTypo}>
                {abbreviatableCardType ? ellipsizeText(name, maxLength) : name}
            </Typography>
        </Tooltip>;
    }

    generateCardClass(node, baseClass) {
        const {classes} = this.props;
        return node.isSelected ? `${baseClass} ${classes.selectedCard}` : baseClass;
    }

    // displayVisibilityButton() {
    //
    //     let {classes, isHovered, handleShowPreview, t} = this.props;
    //
    //     return isHovered
    //
    //         ? <Tooltip title={t('label.contentManager.contentPreview.preview')}>
    //             <IconButton onClick={handleShowPreview} disableRipple={true} className={classes.visibilityButton}>
    //                 <Visibility/>
    //             </IconButton>
    //         </Tooltip>
    //
    //         : null;
    // }
    // displayPublicationAction(publishButtonClass) {
    //
    //     let {classes, node, isHovered, t} = this.props;
    //
    //     if (!isHovered) {
    //         return null;
    //     }
    //
    //     return <Actions menuId={"thumbnailPublishMenu"} context={{
    //         uuid: node.uuid,
    //         path: node.path,
    //         displayName: node.name,
    //         nodeName: node.nodeName
    //     }}>
    //         {(props) => {
    //             return <CmIconButton
    //                 className={publishButtonClass ? publishButtonClass : classes.publishButton}
    //                 {...props}
    //                 disableRipple={true}
    //                 cmRole={"file-grid-thumbnail-button-publish"}
    //                 tooltip={t('label.contentManager.filesGrid.publish')}
    //             >
    //                 <Autorenew className={classes.renewIcon}/>
    //             </CmIconButton>;
    //         }}
    //     </Actions>;
    // }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    uiLang : state.uiLang
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelect: (selection) => dispatch(cmSetSelection(selection)),
});

const ComposedFileCard = compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(FileCard);

export default ComposedFileCard;