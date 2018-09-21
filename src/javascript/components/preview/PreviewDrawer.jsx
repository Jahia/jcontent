import React from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {Drawer, Paper, Button} from '@material-ui/core';
import {connect} from "react-redux";
import {cmSetPreviewMode} from "../redux/actions";

const styles = theme => ({
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    previewModePaper: {
        background:"transparent"
    },
    liveButton: {
        '&:disabled': {
            opacity: ".6",
            color: "#F5F5F5",
            backgroundColor: "#E67D3A"
        },
        borderRadius: "0 18px 18px 0",
        margin:"0 0",
        boxShadow: "none"
    },
    editButton: {
        borderRadius: "18px 0 0 18px",
        margin:"0 0",
        boxShadow: "none"
    }
});

class PreviewDrawer extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        const { classes, previewMode, previewModes, setPreviewMode, t } = this.props;
        return (
            <Drawer anchor="right"
                    style={{position: "initial"}}
                    open={ this.props.open }>
                <div className={classes.drawerHeader}>
                    <IconButton onClick={ this.props.onClose }>
                         <ChevronRightIcon />
                    </IconButton>
                    <Paper elevation={0} className={classes.previewModePaper}>
                        <Button
                            className={classes.editButton}
                            variant="contained"
                            size="medium"
                            color={previewMode === 'edit' ? 'primary' : 'secondary'}
                            onClick={() => setPreviewMode('edit')}
                        >{t('label.contentManager.contentPreview.staging')}</Button>
                        <Button
                            className={classes.liveButton}
                            variant="contained"
                            size="medium"
                            color={previewMode === 'live' ? 'primary' : 'secondary'}
                            disabled={_.find(previewModes, (mode) => {return mode === 'live'}) === undefined}
                            onClick={() => setPreviewMode('live')}
                        >{t('label.contentManager.contentPreview.live')}</Button>
                    </Paper>
                </div>
                { this.props.children }
            </Drawer>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selection: state.selection,
        previewMode: state.previewMode,
        previewModes: state.previewModes
    }
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPreviewMode: (mode) => {
        dispatch(cmSetPreviewMode(mode));
    }
});

PreviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};
PreviewDrawer = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
export default PreviewDrawer;