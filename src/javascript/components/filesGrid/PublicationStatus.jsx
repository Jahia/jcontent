import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Constants from '../constants';

const styles = theme => ({
    published: {
        width: 8,
        backgroundColor: theme.palette.publicationStatus.published.main
    },
    modified: {
        width: 8,
        backgroundColor: theme.palette.publicationStatus.modified.main
    },
    notPublished: {
        width: 8,
        backgroundColor: theme.palette.publicationStatus.notPublished.main
    },
    markedForDeletion: {
        width: 8,
        backgroundColor: theme.palette.publicationStatus.markedForDeletion.main
    },
    noStatus: {
        width: 8,
        backgroundColor: "#cecece"
    }
});

class PublicationStatus extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className={ this.publicationStatusClass() } />
    }

    publicationStatusClass() {
        const { classes } = this.props;
        switch(this.props.node.publicationStatus) {
            case Constants.availablePublicationStatuses.PUBLISHED : return classes.published;
            case Constants.availablePublicationStatuses.NOT_PUBLISHED : return classes.notPublished;
            case Constants.availablePublicationStatuses.MODIFIED : return classes.modified;
            case Constants.availablePublicationStatuses.MARKED_FOR_DELETION : return classes.markedForDeletion;
            default : return classes.noStatus;
        }
    }
}

PublicationStatus.propTypes = {
    node: PropTypes.object.isRequired
};


export default withStyles(styles)(PublicationStatus);