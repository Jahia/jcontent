import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PublicationStatus from './PublicationStatus';

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
    cover: {
        width: 160,
        height: 160,
    },
    coverVertical: {
        height: 160,
    }
});

const VERTICAL_CARD_TYPE = 2;

class FileCard extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { classes, cardType  } = this.props;

        return cardType === VERTICAL_CARD_TYPE ? this.verticalCard() : this.regularCard();
    }

    regularCard() {
        const { classes } = this.props;
        return <Card className={ classes.card }>
            <PublicationStatus status={{}}/>
            <CardMedia
                className={ classes.cover }
                image="https://media.gettyimages.com/photos/moraine-lake-reflections-banff-national-park-canada-picture-id908178828"
                title="Live from space album cover"
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography variant="headline">Amazing content</Typography>
                    <Typography variant="subheading" color="textSecondary">
                        by Alexander Karmanov
                    </Typography>
                </CardContent>
            </div>
        </Card>
    }

    verticalCard() {
        const { classes } = this.props;

        return <Card className={ classes.cardVertical }>
            <CardMedia
                className={ classes.coverVertical }
                image="https://media.gettyimages.com/photos/moraine-lake-reflections-banff-national-park-canada-picture-id908178828"
                title="Live from space album cover"
            />
            <div className={classes.details}>
                <div className={ classes.publicationStatus }>
                    <PublicationStatus status={{}}/>
                </div>
                <CardContent className={classes.content}>
                    <Typography variant="headline">Amazing content</Typography>
                    <Typography variant="subheading" color="textSecondary">
                        by Alexander Karmanov
                    </Typography>
                </CardContent>
            </div>
        </Card>
    }
}

FileCard.propTypes = {
    cardType: PropTypes.number.isRequired
};


export default withStyles(styles)(FileCard);