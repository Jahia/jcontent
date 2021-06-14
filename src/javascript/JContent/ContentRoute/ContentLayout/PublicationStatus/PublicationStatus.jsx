import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {InfoOutlined} from '@material-ui/icons';
import {publicationStatusByName} from './publicationStatusRenderer';
import {withTranslation} from 'react-i18next';
import classNames from 'classnames';

const styles = theme => ({
    root: {
        display: 'flex',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
        minWidth: 6
    },
    border: {
        width: 6,
        cursor: 'pointer',
        '&:hover ~ $publicationInfoWrapper': {
            width: '100%',
            maxWidth: '100%'
        }
    },
    publicationInfoWrapper: {
        display: 'flex',
        overflow: 'hidden',
        width: 0,
        minWidth: 0,
        maxWidth: 0,
        transition: 'width .2s, max-width .2s, min-width .2s',
        '&:hover': {
            width: '100%',
            maxWidth: '100%'
        }
    },
    publicationInfo: {
        display: 'flex',
        alignItems: 'center',
        margin: '0 ' + (theme.spacing.unit * 2) + 'px'
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

export class PublicationStatus extends Component {
    render() {
        const {classes, node, t, i18n} = this.props;
        const publicationStatus = publicationStatusByName.getStatus(node);
        const publicationStatusClass = publicationStatus.getContentClass(classes);
        if (node.operationsSupport.publication) {
            return (
                <div className={classes.root}>
                    <div className={classNames(classes.border, publicationStatusClass)}/>
                    <div className={classNames(classes.publicationInfoWrapper, publicationStatusClass)}>
                        <div className={classes.publicationInfo}
                             data-cm-role="publication-info"
                             data-cm-value={node.aggregatedPublicationInfo.publicationStatus}
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

        return false;
    }
}

PublicationStatus.propTypes = {
    node: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    i18n: PropTypes.object.isRequired
};

export default withTranslation()(withStyles(styles)(PublicationStatus));
