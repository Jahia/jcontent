import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { withStyles } from "@material-ui/core";
import Moment from 'react-moment';
import 'moment-timezone';
import Constants from './constants';

//TODO Here as well as in ContentListTable unpublished status is not clear

const styles = theme => ({
    publicationInfoModified: {
        borderLeft: "5px solid " + theme.palette.publicationStatus.modified.main,
        padding: theme.spacing.unit
    },
    publicationInfoNotPublished: {
        borderLeft: "5px solid " + theme.palette.publicationStatus.notPublished.main,
        padding: theme.spacing.unit
    },
    publicationInfoPublished: {
        borderLeft: "5px solid " + theme.palette.publicationStatus.published.main,
        padding: theme.spacing.unit
    },
    publicationInfoMarkedForDeletion: {
        borderLeft: "5px solid " + theme.palette.publicationStatus.markedForDeletion.main,
        padding: theme.spacing.unit
    }
});

const component = ({ selection, t, classes }) => {
    switch (selection.publicationStatus) {
        case Constants.availablePublicationStatuses.MARKED_FOR_DELETION :
            return <div className={classes.publicationInfoMarkedForDeletion}>
                {t('label.contentManager.contentPreview.markedForDeletionBy', {userName: selection.deletedBy})}
                <Moment format={"LLL"}>{selection.deleted}</Moment>
            </div>;
        case Constants.availablePublicationStatuses.MODIFIED :
            return <div className={classes.publicationInfoModified}>
                {t('label.contentManager.contentPreview.modifiedBy', {userName: selection.lastModifiedBy})}
                <Moment format={"LLL"}>{selection.lastModified}</Moment>
            </div>;
        case Constants.availablePublicationStatuses.PUBLISHED :
            return <div className={classes.publicationInfoPublished}>
                {t('label.contentManager.contentPreview.publishedBy', {userName: selection.lastPublishedBy})}
                <Moment format={"LLL"}>{selection.lastPublished}</Moment>
            </div>;
        case Constants.availablePublicationStatuses.NOT_PUBLISHED :
            return <div className={classes.publicationInfoUnpublished}>
                {t('label.contentManager.contentPreview.notPublished')}
            </div>;
    }
    return null;
};

export default translate()(withStyles(styles)(component));

component.propTypes = {
    selection: PropTypes.object.isRequired
};