import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Constants from '../constants';
import { InfoOutline } from "@material-ui/icons";

const styles = theme => ({
    root: {
        zIndex:1,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        width: 8
    },
    published: {
        backgroundColor: theme.palette.publicationStatus.published.main
    },
    modified: {
        backgroundColor: theme.palette.publicationStatus.modified.main
    },
    notPublished: {
        backgroundColor: theme.palette.publicationStatus.notPublished.main
    },
    markedForDeletion: {
        backgroundColor: theme.palette.publicationStatus.markedForDeletion.main
    },
    noStatus: {
        backgroundColor: "#cecece"
    },
    infoButton: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        width: 0,
        backgroundColor: "inherit",
        transition: "width 0.2s ease-in 0s",
        "&:hover ~ div.CM_PUBLICATION_INFO": {
            width: 200,
            opacity: 1,
            visibility: "visible"
        }
    },
    publicationInfo: {
        flex: 20,
        display: "flex",
        alignItems: "center",
        backgroundColor: "inherit",
        width:0,
        opacity: 0,
        visibility: "hidden",
        transition: "width 0.3s ease-in 0s"
    },
    infoContainer: {
        overflow: "hidden"
    }
});

class PublicationStatus extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;
        return <div className={ `${this.publicationStatusClass()} CM_PUBLICATION_STATUS` }>
            <div className={ `${classes.infoButton} CM_PUBLICATION_INFO_BUTTON` }>
                <div className={ classes.infoContainer }>
                    <InfoOutline/>
                </div>
            </div>
            <div className={ `${classes.publicationInfo} CM_PUBLICATION_INFO` }>
                <div className={ classes.infoContainer }>
                    Publication status here
                </div>
            </div>
        </div>
    }

    publicationStatusClass() {
        const { classes } = this.props;
        switch(this.props.node.publicationStatus) {
            case Constants.availablePublicationStatuses.PUBLISHED : return `${classes.published} ${classes.root}`;
            case Constants.availablePublicationStatuses.NOT_PUBLISHED : return `${classes.notPublished}  ${classes.root}`;
            case Constants.availablePublicationStatuses.MODIFIED : return `${classes.modified}  ${classes.root}`;
            case Constants.availablePublicationStatuses.MARKED_FOR_DELETION : return `${classes.markedForDeletion}  ${classes.root}`;
            default : return classes.noStatus;
        }
    }
}

PublicationStatus.propTypes = {
    node: PropTypes.object.isRequired
};


export default withStyles(styles)(PublicationStatus);