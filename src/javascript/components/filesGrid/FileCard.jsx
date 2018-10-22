import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardContent, CardMedia, Typography,IconButton, Tooltip } from '@material-ui/core';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {Visibility, Autorenew} from "@material-ui/icons";
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import 'moment-timezone';
import Actions from "../Actions";
import CmIconButton from "../renderAction/CmIconButton";

import { fileIcon, isImage } from './filesGridUtils';
import {cmSetSelection} from "../redux/actions";
import { invokeContextualMenu } from "../contextualMenu/redux/actions";
import {connect} from "react-redux";
import {ellipsizeText} from "../utils";

const styles = theme => ({
    card: {
        display: 'flex',
        maxHeight: 300,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
            width: 24
        }
    },
    cardMedium: {
        display: 'flex',
        maxHeight: 150,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
            width: 24
        }
    },
    cardVertical: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 200,
        minHeight: 200,
        cursor: "pointer",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
            width: 24
        }
    },
    details: {
        display: 'flex',
        flexDirection: 'row',
    },
    verticalDetails: {
        display: "flex",
        position: "relative",
        "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
            width: 24
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
        backgroundColor: "rgb(250, 250, 250)",
        boxShadow: "1px 0px 15px 4px rgba(247,150,5,1)"
    },
    visibilityButton: {
        position:"absolute",
        top: "11",
        right: "10",
        color: theme.palette.background.default,
        padding: 0,
        '&:hover': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width:"18px",
            height:"18px"
        }
    },
    renewIcon: {
        color: theme.palette.background.default,
    },
    publishButton: {
        position:"absolute",
        top: "12",
        right: "35",
        color: theme.palette.background.default,
        '&:hover': {
            backgroundColor: "transparent"
        },
        '&:active': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width:"18px",
            height:"18px"
        }
    },
    publishButtonAlternate: {
        position:"absolute",
        top: "30",
        right: "10",
        color: "#fff",
        '&:hover': {
            backgroundColor: "transparent"
        },
        '&:active': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width:"18px",
            height:"18px"
        }
    },
    cardStyle: {
        marginLeft: 0,
        marginRight: 0,
        padding: 0,
        minHeight: 200,
        maxHeight: 200,
        backgroundColor: 'transparent'
    },
    cardContent: {
        marginLeft: theme.spacing.unit * 1,
        marginRight:'0!important',
        padding: '0!important',
    },
    textTypo: {
        color: theme.palette.background.default,
    },
    TypoBody:{
        fontSize: '0.800rem',
        fontWeight: '800',
        color: theme.palette.background.default,
        paddingBottom: theme.spacing.unit * 1,
    },
    TypoCaption: {
        color: theme.palette.background.default,
        fontSize: '0.872rem!important',
        fontStyle: 'italic!important'
    },
    typoCaptionLarge: {
        fontSize: '1rem!important',
        fontStyle: 'italic!important'
    },
    typoBodyLarge: {
        fontSize: '0.9rem!important',
        fontWeight: '800',
        paddingBottom: theme.spacing.unit * 1,
    },
    tooltip: {
        opacity: 0,
        color: theme.palette.background.default,
        backgroundColor : theme.palette.background.paper,
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
        const { cardType, node  } = this.props;

        if (isImage(node.path)) {
            //Media cards are used for images
            return this.regularMediaCard(cardType);
        }

        return this.fileCard(cardType);
    }

    regularMediaCard(cardType) {
        switch(cardType) {
            case 2 : return this.verticalMediaCard();
            case 6 :
            case 12 : return this.largeMediaCard();
            default : return this.mediumMediaCard();
        }
    }

    fileCard(cardType) {
        console.log(cardType);
        switch(cardType) {
            case 2 : return this.verticalFileCard(cardType);
            case 3 : return this.mediumFileCard();
            case 6 :
            case 12 : return this.largeFileCard();
            default : return this.mediumFileCard();
        }
    }

    largeMediaCard() {
        const { classes, t, node, dxContext, onContextualMenu, cardType } = this.props;
        
        return <Card className={ this.generateCardClass(node, classes.card) }
                     classes={{ root: classes.cardStyle}}
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_LARGE }/>
            <CardMedia
                className={ classes.coverLarge }
                image={ `${dxContext.contextPath}/files/default/${node.path}` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{ root: classes.cardContent}}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}

                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption"  className={classes.textTypo}>{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Tooltip title={cardType === 6 && node.name.length > MAX_LENGTH_MEDIA_LABELS_LARGE ? node.name : ''} classes={{tooltip:classes.tooltip}}>
                        <Typography classes={{body2: classes.typoBodyLarge}}  variant="body2" className={classes.textTypo}>{ cardType === 6 ? ellipsizeText(node.name, MAX_LENGTH_MEDIA_LABELS_LARGE) : node.name }</Typography>
                    </Tooltip>

                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>

                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.fileInfo") }</Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>{ `${node.width} x ${node.height}` }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    mediumMediaCard() {
        const { classes, t, node, dxContext, onContextualMenu, cardType } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardMedium) }
                     classes={{ root: classes.cardStyle}}
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_MED }/>
            <CardMedia
                className={ classes.coverMedium }
                image={ `${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content} classes={{ root: classes.cardContent}} style={{overflow: 'scroll', width: '100%'}}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Tooltip title={node.name.length > MAX_LENGTH_MEDIA_LABELS_MEDIUM ? node.name : ''} classes={{tooltip:classes.tooltip}}>
                        <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>{ ellipsizeText(node.name, MAX_LENGTH_MEDIA_LABELS_MEDIUM) }</Typography>
                    </Tooltip>

                    <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>
                </CardContent>
            </div>
        </Card>
    }

    verticalMediaCard() {
        const { classes, t, node, dxContext, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardVertical) }
                     classes={{ root: classes.cardStyle}}
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <CardMedia
                style={{ flex: 2 }}
                className={ classes.coverVertical }
                image={ `${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.verticalDetails} style={{ flex: 1.5, overflow: 'scroll' }}>
                <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_SMALL }/>
                <CardContent className={classes.content} classes={{ root: classes.cardContent}}>
                    {this.displayPublicationAction(classes.publishButtonAlternate)}
                    {this.displayVisibilityButton()}

                    <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Tooltip title={node.name.length > MAX_LENGTH_MEDIA_LABELS_VERTICAL ? node.name : ''} classes={{tooltip:classes.tooltip}}>
                        <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>{ ellipsizeText(node.name, MAX_LENGTH_MEDIA_LABELS_VERTICAL) }</Typography>
                    </Tooltip>
                </CardContent>
            </div>
        </Card>
    }

    largeFileCard() {
        const { classes, t, node, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     classes={{ root: classes.cardStyle}}

                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_LARGE }/>
            {
                fileIcon(node.path, '6x', {fontSize: "160px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}  classes={{ root: classes.cardContent}}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>{ node.name }</Typography>

                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>

                    <Typography classes={{caption: classes.typoCaptionLarge}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.fileInfo") }</Typography>
                    <Typography classes={{body2: classes.typoBodyLarge}} variant="body2" className={classes.textTypo}>{ `${node.width} x ${node.height}` }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    mediumFileCard() {
        const { classes, t, node, onContextualMenu, cardType } = this.props;
        return <Card className={ this.generateCardClass(node, classes.card) }
                     classes={{ root: classes.cardStyle}}
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_MED }/>
            {
                fileIcon(node.path, '6x', {fontSize: "110px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}  classes={{ root: classes.cardContent}}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Tooltip title={node.name.length > MAX_LENGTH_MEDIA_LABELS_VERTICAL && cardType === 3 ? node.name : ''} classes={{tooltip:classes.tooltip}}>
                        <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>{ cardType === 3 ? ellipsizeText(node.name, MAX_LENGTH_FILES_LABELS_VERTICAL) :
                            node.name}</Typography>
                    </Tooltip>

                    <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>
                </CardContent>
            </div>
        </Card>
    }

    verticalFileCard(cardType) {
        const { classes, t, node, onContextualMenu } = this.props;
        return <Card className={ this.generateCardClass(node, classes.cardVertical) }
                     classes={{ root: classes.cardStyle}}
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, menuId: "contextualMenuContentAction", ...node})}}
                     onClick={ () => this.props.onSelect([node]) }>
                {
                    fileIcon(node.path, '6x', {fontSize: "110px"})
                }
            <div className={classes.details} style={{overflow: 'scroll', height: '100%'}}>
                <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_SMALL }/>
                <CardContent className={classes.content}  classes={{ root: classes.cardContent}}>
                    {this.displayPublicationAction(classes.publishButtonAlternate)}
                    {this.displayVisibilityButton()}
                    <Typography classes={{caption: classes.TypoCaption}} variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Tooltip title={node.name.length > MAX_LENGTH_FILES_LABELS_VERTICAL ? node.name : ''} classes={{tooltip:classes.tooltip}}>
                        <Typography classes={{body2: classes.TypoBody}} variant="body2" color="textSecondary">{ ellipsizeText(node.name, MAX_LENGTH_FILES_LABELS_VERTICAL) }</Typography>
                    </Tooltip>

                    { cardType !== 2 && <React.Fragment>
                        <Typography classes={{caption: classes.TypoCaption}} variant="caption" className={classes.textTypo}>{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                        <Typography classes={{body2: classes.TypoBody}} variant="body2" className={classes.textTypo}>
                            { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                            <Moment format={"LLL"}>{node.created}</Moment>
                        </Typography>
                    </React.Fragment> }
                </CardContent>
            </div>
        </Card>
    }

    generateCardClass(node, baseClass) {
        const { classes } = this.props;
        return node.isSelected ? `${baseClass} ${classes.selectedCard}` : baseClass;
    }

    displayVisibilityButton() {
        let {classes, isHovered, handleShowPreview} = this.props;
        return isHovered ?<IconButton onClick={handleShowPreview}
                                      disableRipple={true}
                                      className={classes.visibilityButton}>
            <Visibility/>
        </IconButton> : null;
    }
    displayPublicationAction(publishButtonClass) {
        let {classes, node, isHovered, t} = this.props;
        return isHovered ? <Actions menuId={"thumbnailPublishMenu"} context={{
            uuid: node.uuid,
            path: node.path,
            displayName: node.name,
            nodeName: node.nodeName
        }}>
            {(props) => {
                return <CmIconButton
                    className={publishButtonClass ? publishButtonClass : classes.publishButton} {...props}
                    disableRipple={true}
                    cmRole={"file-grid-thumbnail-button-publish"}>
                    <Tooltip title={t('label.contentManager.filesGrid.publish')}><Autorenew className={classes.renewIcon}/></Tooltip>
                </CmIconButton>
            }}
        </Actions>: null;
    }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelect: (selection) => dispatch(cmSetSelection(selection)),
    onContextualMenu: (params) => {
        dispatch(invokeContextualMenu(params));
    }
});

const ComposedFileCard = compose(
    withStyles(styles),
    translate(),
    connect(null, mapDispatchToProps)
)(FileCard);

export default ComposedFileCard;