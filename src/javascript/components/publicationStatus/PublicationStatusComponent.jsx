import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles, Typography} from '@material-ui/core';
import {InfoOutlined} from '@material-ui/icons';
import {publicationStatusByName} from './publicationStatus';
import {translate} from 'react-i18next';

const styles = theme => ({
    root: {
        zIndex: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        width: theme.spacing.unit
    },
    statusRoot: {
        zIndex: 1,
        display: 'flex',
        minHeight: theme.spacing.unit * 6,
        flexDirection: 'row',
        alignItems: 'stretch',
        position: 'absolute',
        top: 0,
        bottom: 0
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
    unPublished: {
        backgroundColor: theme.palette.publicationStatus.unpublished.main
    },
    markedForDeletion: {
        backgroundColor: theme.palette.publicationStatus.markedForDeletion.main
    },
    mandatoryLanguageUnpublishable: {
        backgroundColor: theme.palette.publicationStatus.mandatoryLanguageUnpublishable.main
    },
    mandatoryLanguageValid: {
        backgroundColor: theme.palette.publicationStatus.mandatoryLanguageValid.main
    },
    conflict: {
        backgroundColor: theme.palette.publicationStatus.conflict.main
    },
    unknown: {
        backgroundColor: theme.palette.publicationStatus.conflict.main
    },
    noStatus: {
        backgroundColor: '#cecece'
    },
    publicationInfo: {
        flex: 'auto',
        display: 'flex',
        alignItems: 'center',
        minHeight: theme.spacing.unit * 6,
        backgroundColor: 'inherit',
        width: 0.01, // Safari doesn't take 0 for some strange reason
        opacity: 1,
        overflow: 'hidden',
        color: theme.palette.getContrastText(theme.palette.publish.main),
        transition: 'width 0.3s cubic-bezier(0, 0, 0.2, 1)'
    },
    infoButton: {
        flex: 'auto',
        display: 'flex',
        alignItems: 'center',
        minHeight: theme.spacing.unit * 6,
        width: 6,
        backgroundColor: 'inherit',
        transition: 'width 0.3s cubic-bezier(0, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: 'pointer',
        color: theme.palette.getContrastText(theme.palette.publish.main),
        '&:hover ~ div.CM_PUBLICATION_INFO': {
            opacity: '1',
            visibility: 'visible',
            width: (theme.spacing.unit * 4) + 'vw'
        }
    },
    info: {
        minWidth: (theme.spacing.unit * 4) + 'vw'
    },
    infoIcon: {
        marginRight: theme.spacing.unit
    }
});

/**
 * Note that publication status must live in a relatively positioned container with flex display and it must have this
 * hove functionality : "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
 *           width: 24
 *       },
 *       "&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
 *           display: "block",
 *       }
 */
class PublicationStatusComponent extends Component {
    render() {
        const {classes, node, t, i18n} = this.props;
        const publicationStatus = publicationStatusByName.getStatus(node);
        const publicationStatusClass = publicationStatus.getContentClass(classes);

        return (
            <React.Fragment>
                <div className={`${publicationStatusClass} ${classes.root}`}/>
                <div className={`${classes.statusRoot} ${publicationStatusClass} CM_PUBLICATION_STATUS`}>
                    <div className={`${classes.infoButton} CM_PUBLICATION_INFO_BUTTON`}/>
                    <div className={`${classes.publicationInfo} CM_PUBLICATION_INFO`}>

                        <div className={classes.info}
                             data-cm-role="publication-info"
                             data-cm-value={node.publicationStatus}
                        >

                            <Typography color="inherit" variant="caption">
                                <InfoOutlined className={classes.infoIcon} fontSize="small"/>
                                { publicationStatus.geti18nDetailsMessage(node, t, i18n.language) }
                            </Typography>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

PublicationStatusComponent.propTypes = {
    node: PropTypes.object.isRequired
};

export default translate()(withStyles(styles)(PublicationStatusComponent));
