import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles, Typography} from '@material-ui/core';
import {InfoOutlined} from '@material-ui/icons';
import {publicationStatusByName} from './publicationStatus';
import {translate} from 'react-i18next';

const styles = theme => ({
    root: {
        display: 'flex',
        height: 48,
        position: 'absolute',
        zIndex: 1,
        bottom: 0
    },
    publicationInfoWrapper: {
        display: 'flex',
        overflow: 'hidden',
        maxWidth: '0px',
        transitionDuration: '.2s'
    },
    publicationInfo: {
        display: 'flex',
        alignItems: 'center',
        opacity: 0,
        width: 0,
        minWidth: '0px',
        padding: 0,
        whiteSpace: 'nowrap',
        transition: 'min-width .3s ease 0s, opacity .2s ease 0s, padding .2s ease 0s'
    },
    border: {
        width: 6,
        cursor: 'pointer',
        '&:hover ~ $publicationInfoWrapper > $publicationInfo': {
            minWidth: '640px',
            opacity: 1,
            padding: '0 ' + (theme.spacing.unit * 2) + 'px'
        },
        '&:hover ~ $publicationInfoWrapper': {
            maxWidth: '640px'
        }
    },
    spacing: {
        marginRight: theme.spacing.unit
    },
    published: {
        backgroundColor: theme.palette.publicationStatus.published.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.published.main)
    },
    modified: {
        backgroundColor: theme.palette.publicationStatus.modified.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.modified.main)
    },
    notPublished: {
        backgroundColor: theme.palette.publicationStatus.notPublished.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.notPublished.main)
    },
    unPublished: {
        backgroundColor: theme.palette.publicationStatus.unpublished.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.unpublished.main)
    },
    markedForDeletion: {
        backgroundColor: theme.palette.publicationStatus.markedForDeletion.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.markedForDeletion.main)
    },
    mandatoryLanguageUnpublishable: {
        backgroundColor: theme.palette.publicationStatus.mandatoryLanguageUnpublishable.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.mandatoryLanguageUnpublishable.main)
    },
    mandatoryLanguageValid: {
        backgroundColor: theme.palette.publicationStatus.mandatoryLanguageValid.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.mandatoryLanguageValid.main)
    },
    conflict: {
        backgroundColor: theme.palette.publicationStatus.conflict.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.conflict.main)
    },
    unknown: {
        backgroundColor: theme.palette.publicationStatus.conflict.main,
        color: theme.palette.getContrastText(theme.palette.publicationStatus.conflict.main)
    },
    noStatus: {
        backgroundColor: '#cecece',
        color: theme.palette.getContrastText('#cecece')
    }
});

class PublicationStatusComponent extends Component {
    render() {
        const {classes, node, t, i18n} = this.props;
        const publicationStatus = publicationStatusByName.getStatus(node);
        const publicationStatusClass = publicationStatus.getContentClass(classes);

        return (
            <div className={classes.root}>
                <div className={`${classes.border} ${publicationStatusClass}`}/>
                <div className={`${classes.publicationInfoWrapper} ${publicationStatusClass}`}>
                    <div className={classes.publicationInfo}
                         data-cm-role="publication-info"
                         data-cm-value={node.publicationStatus}
                    >
                        <InfoOutlined className={classes.spacing} fontSize="small"/>

                        <Typography color="inherit" variant="caption" classes={{root: classes.spacing}}>
                            {publicationStatus.geti18nDetailsMessage(node, t, i18n.language)}
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }
}

PublicationStatusComponent.propTypes = {
    node: PropTypes.object.isRequired
};

export default translate()(withStyles(styles)(PublicationStatusComponent));
