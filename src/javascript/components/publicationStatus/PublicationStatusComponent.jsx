import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Constants from '../constants';
import { InfoOutlined } from "@material-ui/icons";
import { publicationStatusByName } from "./publicationStatus";
import {translate} from "react-i18next";

const styles = theme => ({
    root: {
        zIndex:1,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        width: 8
    },
    statusRoot: {
        zIndex:1,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        position: "absolute",
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
        backgroundColor: "#cecece"
    },
    markedForDeletion: {
        backgroundColor: theme.palette.publicationStatus.markedForDeletion.main
    },
    noStatus: {
        backgroundColor: "#cecece"
    },
    publicationInfo: {
        flex: 20,
        display: "flex",
        alignItems: "center",
        backgroundColor: "inherit",
        width:0,
        opacity: 0,
        visibility: "hidden",
        overflow: "hidden",
        color: theme.palette.getContrastText(theme.palette.publish.main),
        transition: "width 0.3s ease-in 0s"
    },
    infoContainer: {
        overflow: "hidden"
    },
    infoButton: {
        flex: "auto",
        display: "flex",
        alignItems: "center",
        width: 0,
        backgroundColor: "inherit",
        transition: "width 0.2s ease-in 0s",
        overflow: "hidden",
        cursor: "pointer",
        color: theme.palette.getContrastText(theme.palette.publish.main),
        "&:hover ~ div.CM_PUBLICATION_INFO": {
            width: 0,
            opacity: 1,
            visibility: "visible"
        }
    }
});

/**
 * Note that publication status must live in a relatively positioned container with flex display and it must have this
 * hove functionality : "&:hover > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
 *           width: 24
 *       }
 */
class PublicationStatusComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            publicationInfoWidth: 0
        }

    }

    setPublicationInfoWidth(width) {
        this.setState({
            publicationInfoWidth: width
        });
    }

    render() {
        const { classes, node, t, i18n } = this.props;
        const publicationStatus = publicationStatusByName[node.publicationStatus];
        const publicationStatusClass = publicationStatus.getContentClass(classes);

        return <React.Fragment>
            <div className={ `${publicationStatusClass} ${classes.root}` } />
            <div className={ `${classes.statusRoot} ${publicationStatusClass} CM_PUBLICATION_STATUS`}>
                <div className={ `${classes.infoButton} CM_PUBLICATION_INFO_BUTTON` }>
                    <div className={ classes.infoContainer }
                         onClick={() => this.setPublicationInfoWidth(this.state.publicationInfoWidth === 0 ? this.props.publicationInfoWidth : 0)}
                         onMouseLeave={() => this.setPublicationInfoWidth(0)}>
                        <InfoOutlined/>
                    </div>
                </div>
                <div className={ `${classes.publicationInfo} CM_PUBLICATION_INFO` } style={{width: this.state.publicationInfoWidth}}>
                    <div className={ classes.infoContainer }
                         style={{paddingLeft: 20, width: this.props.publicationInfoWidth, minWidth: this.props.publicationInfoWidth}}
                         data-cm-role={'publication-info'}
                         data-cm-value={node.publicationStatus}>
                        { publicationStatus.geti18nDetailsMessage(node, t, i18n.language ) }
                    </div>
                </div>
            </div>
        </React.Fragment>
    }
}

PublicationStatusComponent.propTypes = {
    node: PropTypes.object.isRequired,
    publicationInfoWidth: PropTypes.number.isRequired
};


export default translate()(withStyles(styles)(PublicationStatusComponent));