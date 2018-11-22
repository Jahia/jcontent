import React from 'react';
import {translate} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import Moment from 'react-moment';
import 'moment-timezone';
import Constants from '../constants';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {isMarkedForDeletion} from '../utils';
import {compose} from 'react-apollo';

// TODO Here as well as in ContentListTable unpublished status is not clear

const styles = theme => ({
    publicationInfoModified: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.modified.main,
        padding: theme.spacing.unit
    },
    publicationInfoNotPublished: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.notPublished.main,
        padding: theme.spacing.unit
    },
    publicationInfoPublished: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.published.main,
        padding: theme.spacing.unit
    },
    publicationInfoMarkedForDeletion: {
        borderLeft: '5px solid ' + theme.palette.publicationStatus.markedForDeletion.main,
        color: theme.palette.publicationStatus.markedForDeletion.main,
        padding: theme.spacing.unit
    },
    publicationInfoUnpublished: {
        borderLeft: '5px solid #cecece',
        padding: theme.spacing.unit
    }
});

const component = ({selection, t, classes, uiLang}) => {
    if (_.isEmpty(selection)) {
        return null;
    }
    const selectedItem = selection[0];
    // Special handling for marked for deletion content
    if (Constants.availablePublicationStatuses.MARKED_FOR_DELETION === selectedItem.publicationStatus || isMarkedForDeletion(selectedItem)) {
        return (
            <div className={classes.publicationInfoMarkedForDeletion}>
                {t('label.contentManager.contentPreview.markedForDeletionBy', {userName: selectedItem.deletedBy})}
            &nbsp;
                <Moment format="LLL" locale={uiLang}>{selectedItem.deleted}</Moment>
            </div>
        );
    }
    switch (selectedItem.publicationStatus) {
        case Constants.availablePublicationStatuses.MODIFIED:
            return (
                <div className={classes.publicationInfoModified}>
                    {t('label.contentManager.contentPreview.modifiedBy', {userName: selectedItem.lastModifiedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastModified}</Moment>
                </div>
            );
        case Constants.availablePublicationStatuses.PUBLISHED:
            return (
                <div className={classes.publicationInfoPublished}>
                    {t('label.contentManager.contentPreview.publishedBy', {userName: selectedItem.lastPublishedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastPublished}</Moment>
                </div>
            );
        case Constants.availablePublicationStatuses.NOT_PUBLISHED:
            return (
                <div className={classes.publicationInfoNotPublished}>
                    {t('label.contentManager.contentPreview.notPublished')}
                </div>
            );
        case Constants.availablePublicationStatuses.UNPUBLISHED:
            return (
                <div className={classes.publicationInfoUnpublished}>
                    {t('label.contentManager.contentPreview.unPublishedBy', {userName: selectedItem.lastModifiedBy})}
                &nbsp;
                    <Moment format="LLL" locale={uiLang}>{selectedItem.lastModified}</Moment>
                </div>
            );
        default:
            return null;
    }
};

const mapStateToProps = state => ({
    selection: state.selection,
    uiLang: state.uiLang
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps)
)(component);
