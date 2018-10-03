import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
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
        color: "#fff",
        padding: 0,
        '&:hover': {
            backgroundColor: "transparent"
        },
        '& svg': {
            width:"18px",
            height:"18px"
        }
    },
    publishButton: {
        position:"absolute",
        top: "12",
        right: "35",
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
    }

});

const PUBLICATION_INFO_WIDTH_LARGE = 400;
const PUBLICATION_INFO_WIDTH_MED = 300;
const PUBLICATION_INFO_WIDTH_SMALL = 150;

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
        switch(cardType) {
            case 2 :
            case 3 : return this.verticalFileCard(cardType);
            case 6 :
            case 12 : return this.largeFileCard();
            default : return this.mediumFileCard();
        }
    }

    largeMediaCard() {
        const { classes, t, node, dxContext, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_LARGE }/>
            <CardMedia
                className={ classes.coverLarge }
                image={ `${dxContext.contextPath}/files/default/${node.path}` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography variant="body2" color="textSecondary">
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.fileInfo") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ `${node.width} x ${node.height}` }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    mediumMediaCard() {
        const { classes, t, node, dxContext, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardMedium) }
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_MED }/>
            <CardMedia
                className={ classes.coverMedium }
                image={ `${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography variant="body2" color="textSecondary">
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
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <CardMedia
                style={{ flex: 2 }}
                className={ classes.coverVertical }
                image={ `${dxContext.contextPath}/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.verticalDetails} style={{ flex: 1.5 }}>
                <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_SMALL }/>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction(classes.publishButtonAlternate)}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    largeFileCard() {
        const { classes, t, node, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_LARGE }/>
            {
                fileIcon(node.path, '6x', {fontSize: "160px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography variant="body2" color="textSecondary">
                        { t("label.contentManager.filesGrid.author", { author: node.createdBy}) }
                        <Moment format={"LLL"}>{node.created}</Moment>
                    </Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.fileInfo") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ `${node.width} x ${node.height}` }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    mediumFileCard() {
        const { classes, t, node, onContextualMenu } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_MED }/>
            {
                fileIcon(node.path, '6x', {fontSize: "160px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction()}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                    <Typography variant="body2" color="textSecondary">
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
                     onContextMenu={(event) => {onContextualMenu({isOpen: true, event:event, path: node.path, uuid: node.uuid, displayName: node.name, nodeName: node.nodeName})}}
                     onClick={ () => this.props.onSelect([node]) }>
            <div style={{textAlign: "center", flex: 2}}>
                {
                    fileIcon(node.path, '6x', {fontSize: "100px"})
                }
            </div>
            <div className={classes.verticalDetails} style={{ flex: 2 }}>
                <PublicationStatus node={ node } publicationInfoWidth={ PUBLICATION_INFO_WIDTH_SMALL }/>
                <CardContent className={classes.content}>
                    {this.displayPublicationAction(classes.publishButtonAlternate)}
                    {this.displayVisibilityButton()}
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>

                    { cardType !== 2 && <React.Fragment>
                        <Typography variant="caption">{ t("label.contentManager.filesGrid.createdBy") }</Typography>
                        <Typography variant="body2" color="textSecondary">
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
        let {classes, node, isHovered} = this.props;
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
                    <Autorenew/>
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