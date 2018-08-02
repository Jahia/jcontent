import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PublicationStatus from './PublicationStatus';
import Moment from 'react-moment';
import 'moment-timezone';

import { fileIcon } from './filesGridUtils';

const styles = theme => ({
    card: {
        display: 'flex',
    },
    cardVertical: {
        display: 'flex',
        flexDirection: 'column'
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
    }
});

const VERTICAL_CARD_TYPE = 2;

class FileCard extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { classes, cardType  } = this.props;

        return cardType === VERTICAL_CARD_TYPE ? this.verticalCard() : this.regularCard(cardType);
    }

    regularCard(cardType) {
        switch(cardType) {
            case 12 :
            case 6 : return this.largeCard();
            default : return this.mediumCard();
        }
    }

    largeCard() {
        const { classes, t, node } = this.props;
        console.log(node);

        return <Card className={ classes.card }>
            <PublicationStatus status={{}}/>
            <CardMedia
                className={ classes.coverLarge }
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

                    <Typography variant="caption">{ t("label.contentManager.filesGrid.fileInfo") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ `${node.width} x ${node.height}` }</Typography>
                </CardContent>
            </div>
        </Card>
    }

    mediumCard() {
        const { classes, t, node } = this.props;
        console.log(node);

        return <Card className={ classes.card }>
            <PublicationStatus status={{}}/>
            <CardMedia
                className={ classes.coverMedium }
                image={ `/files/default/${node.path}?t=thumbnail` }
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

    verticalCard() {
        const { classes, t, node } = this.props;

        return <Card className={ classes.cardVertical }>
            <CardMedia
                className={ classes.coverVertical }
                image={ `/files/default/${node.path}?t=thumbnail` }
                title={ node.name }
            />
            <div className={classes.details}>
                <div className={ classes.publicationStatus }>
                    <PublicationStatus status={{}}/>
                </div>
                <CardContent className={classes.content}>
                    <Typography variant="caption">{ t("label.contentManager.filesGrid.name") }</Typography>
                    <Typography variant="body2" color="textSecondary">{ node.name }</Typography>
                </CardContent>
            </div>
        </Card>
    }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired
};

const ComposedFileCard = compose(
    withStyles(styles),
    translate()
)(FileCard);

export default ComposedFileCard;