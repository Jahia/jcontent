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
        width: theme.spacing.unit,
        '&:hover': {
            width: theme.spacing.unit * 2
        }
    },
    statusRoot: {
        zIndex: 1,
        display: 'flex',
        minHeight: theme.spacing.unit * 6,
        height: theme.spacing.unit * 6,
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
        backgroundColor: '#cecece'
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
        flex: 20,
        display: 'flex',
        alignItems: 'center',
        height: theme.spacing.unit * 6,
        backgroundColor: 'inherit',
        width: 0.01, // Safari doesn't take 0 for some strange reason
        opacity: 0,
        overflow: 'hidden',
        color: theme.palette.getContrastText(theme.palette.publish.main),
        transition: 'width 0.3s ease-in 0s',
        '&:hover': {
            opacity: 1,
            visibility: 'visible'
        }
    },
    infoIcon: {
        display: 'none'
    },
    infoButton: {
        flex: 'auto',
        display: 'flex',
        alignItems: 'center',
        minHeight: theme.spacing.unit * 6,
        maxHeight: theme.spacing.unit * 6,
        width: 6,
        backgroundColor: 'inherit',
        transition: 'width 0.2s ease-in 0s',
        overflow: 'hidden',
        cursor: 'pointer',
        color: theme.palette.getContrastText(theme.palette.publish.main),
        '&:hover ~ div.CM_PUBLICATION_INFO': {
            width: 0,
            marginLeft: 0,
            opacity: 1,
            visibility: 'visible'
        }
    },
    publicationSvg: {
        fontSize: '13px'
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
    constructor(props) {
        super(props);
        this.state = {
            publicationInfoWidth: 0
        };
    }

    setPublicationInfoWidth(width) {
        this.setState({
            publicationInfoWidth: width
        });
    }

    render() {
        const {classes, node, t, i18n} = this.props;
        const publicationStatus = publicationStatusByName.getStatus(node);
        const publicationStatusClass = publicationStatus.getContentClass(classes);

        return (
            <React.Fragment>
                <div className={`${publicationStatusClass} ${classes.root}`}/>
                <div className={`${classes.statusRoot} ${publicationStatusClass} CM_PUBLICATION_STATUS`}
                     onMouseLeave={() => this.setPublicationInfoWidth(0)}
                >
                    <div className={`${classes.infoButton} CM_PUBLICATION_INFO_BUTTON`}
                         onClick={() => this.setPublicationInfoWidth(this.state.publicationInfoWidth === 0 ? this.props.publicationInfoWidth : 0)}
                    >
                        <div className={classes.infoContainer}/>

                    </div>
                    <div className={`${classes.publicationInfo} CM_PUBLICATION_INFO`}
                         style={{width: this.state.publicationInfoWidth === 0 ? 0.01 : this.state.publicationInfoWidth, marginLeft: '-23px', fontSize: '14px'}}
                    >

                        <div className={classes.infoContainer}
                             style={{width: this.props.publicationInfoWidth, minWidth: this.props.publicationInfoWidth}}
                             data-cm-role="publication-info"
                             data-cm-value={node.publicationStatus}
                        >

                            <Typography color="inherit" variant="overline">
                                <InfoOutlined/>
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
    node: PropTypes.object.isRequired,
    publicationInfoWidth: PropTypes.number.isRequired
};

export default translate()(withStyles(styles)(PublicationStatusComponent));
