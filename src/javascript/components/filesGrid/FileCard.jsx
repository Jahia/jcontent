import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import PublicationStatus from './PublicationStatus';
import Moment from 'react-moment';
import 'moment-timezone';

import { fileIcon, isImage } from './filesGridUtils';

const styles = theme => ({
    card: {
        display: 'flex',
        maxHeight: 300,
        cursor: "pointer"
    },
    cardMedium: {
        display: 'flex',
        maxHeight: 150,
        cursor: "pointer"
    },
    cardVertical: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 200,
        minHeight: 200,
        cursor: "pointer"
    },
    details: {
        display: 'flex',
        flexDirection: 'row',
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
    }
});

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
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onClick={ () => this.props.onSelect(node) }>
            <PublicationStatus node={ node }/>
            <CardMedia
                className={ classes.coverLarge }
                image={ `/files/default/${node.path}` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
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
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardMedium) }
                     onClick={ () => this.props.onSelect(node) }>
            <PublicationStatus node={ node }/>
            <CardMedia
                className={ classes.coverMedium }
                image={ `/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
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
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardVertical) }
                     onClick={ () => this.props.onSelect(node) }>
            <CardMedia
                style={{ flex: 2 }}
                className={ classes.coverVertical }
                image={ `/files/default/${node.path}?t=thumbnail2` }
                title={ node.name }
            />
            <div className={classes.details} style={{ flex: 1.5 }}>
                <PublicationStatus node={ node }/>
                <CardContent className={classes.content}>
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    largeFileCard() {
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onClick={ () => this.props.onSelect(node) }>
            <PublicationStatus node={ node }/>
            {
                fileIcon(node.path, '6x', {fontSize: "160px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}>
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
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.card) }
                     onClick={ () => this.props.onSelect(node) }>
            <PublicationStatus node={ node }/>
            {
                fileIcon(node.path, '6x', {fontSize: "160px"})
            }
            <div className={classes.details}>
                <CardContent className={classes.content}>
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
        const { classes, t, node } = this.props;

        return <Card className={ this.generateCardClass(node, classes.cardVertical) }
                     onClick={ () => this.props.onSelect(node) }>
            <div style={{textAlign: "center", flex: 2}}>
                {
                    fileIcon(node.path, '6x', {fontSize: "100px"})
                }
            </div>
            <div className={classes.details} style={{ flex: 2 }}>
                <PublicationStatus node={ node }/>
                <CardContent className={classes.content}>
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
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
};

const ComposedFileCard = compose(
    withStyles(styles),
    translate()
)(FileCard);

export default ComposedFileCard;