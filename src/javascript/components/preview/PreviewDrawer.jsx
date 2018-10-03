import React from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import classNames from 'classnames'
import ContentPreview from "../preview/ContentPreview";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {Drawer, Paper, Button, Table, TableCell, TableHead, TableBody, TableRow, Typography, Toolbar} from '@material-ui/core';
import {connect} from "react-redux";
import {cmSetPreviewMode} from "../redux/actions";

const styles = theme => ({
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.common.white,
        justifyContent: 'space-between',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    previewModePaper: {
        background: "transparent"
    },
    liveButton: {
        '&:disabled': {
            opacity: ".4",
            color: "#F5F5F5",
            backgroundColor: "#686c6f"
        },
        margin: "0 0",
        boxShadow: "none"
    },
    editButton: {
        margin: "0 0",
        boxShadow: "none"
    },
    inactiveButton: {
        backgroundColor: "#686c6f",
        color: "#F5F5F5",
        '&:hover': {
            backgroundColor: "#686c6f"
        }
    },
    modalWidth: {
        width: 0,
        position: 'unset',
        overflow: 'hidden!important',
    },
    modalTransition: {
        transition: '.23s cubic-bezier(0, 0, 0.2, 1) 0ms!important',
        width: 550,
        top: '140px!important',
        right: '24px!important',
    },
    drawerTableHead: {
        maxHeight: '28px',
        minHeight: '28px',
        color: '#585757',
        height: '28px'
    },
    drawerTableCell: {
        maxWidth: '50px',
        padding: 0,
    },
    insideCell : {
        display: 'inline',
        flexGrow: 1

    },
    drawerWidth: {
        overflow: 'hidden!important',
        transitionDuration: '.3s',
        // transition: 'inherit!important',
        boxShadow: 'none',
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.common.white,
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)',
    },
    drawerFullScreen: {
        top: '0px!important',
        transitionDuration: '.3s',
        width: '100%',
        boxShadow: 'none',
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.common.white,
        right: '0px!important',
        height: '100vh',
        maxHeight: '100vh'
    },
    grow: {
        flexGrow: 1
    },
    buttonStyle: {
        padding: '0px',
        margin: '0px',
        fontSize: '0.875rem',
        height: '22px!important',
        minHeight: '22px!important',
        maxHeight: '22px!important',
    }
});

class PreviewDrawer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fullScreen: false,
        };

    }

    handleFullScreen = (value) => {
        this.setState({
            fullScreen: value
        });
    };

    render() {
        const {classes, previewMode, previewModes, setPreviewMode, t,
            layoutQuery, layoutQueryParams, dxContext} = this.props;
        return (
            <Drawer anchor="right"
                    classes={{
                        paper: this.state.fullScreen ? classes.drawerFullScreen : classes.drawerWidth,
                        paperAnchorRight: classes.modalTransition,
                        modal: classes.modalWidth
                    }}
                    className={classes.drawerRoot}
                    open={this.props.open}>
                <Table>
                    <TableHead>
                        <TableRow className={classes.drawerTableHead}>
                            <TableCell className={classes.drawerTableCell}>
                                <Toolbar disableGutters>
                                    <Typography className={classes.insideCell}>
                                        Preview
                                    </Typography>
                                    <div style={{display: 'inline', textAlign: 'right', marginRight: '5px'}}>
                                        <Button
                                            variant="contained"
                                            className={classNames(classes.editButton, {
                                                [classes.inactiveButton]: previewMode !== 'edit'
                                            })}

                                            classes={{
                                                root: classes.buttonStyle
                                            }}
                                            color={previewMode === 'edit' ? 'primary' : 'default'}
                                            onClick={() => setPreviewMode('edit')}
                                        >{t('label.contentManager.contentPreview.staging')}</Button>
                                        <Button
                                            className={classNames(classes.liveButton, {
                                                [classes.inactiveButton]: previewMode !== 'live'
                                            })}
                                            classes={{
                                                root: classes.buttonStyle
                                            }}
                                            variant="contained"
                                            color={previewMode === 'live' ? 'primary' : 'default'}
                                            disabled={_.find(previewModes, (mode) => {
                                                return mode === 'live'
                                            }) === undefined}
                                            onClick={() => setPreviewMode('live')}
                                        >{t('label.contentManager.contentPreview.live')}</Button>
                                    </div>
                                </Toolbar>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell padding='none'>
                                <div className={classes.drawerHeader}>
                                    <IconButton onClick={this.props.onClose} color={'inherit'}>
                                        <ChevronRightIcon/>
                                    </IconButton>
                                </div>
                                <ContentPreview
                                    layoutQuery={layoutQuery}
                                    layoutQueryParams={layoutQueryParams}
                                    dxContext={dxContext}
                                    handleFullScreen={this.handleFullScreen}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
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
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};
PreviewDrawer = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
export default PreviewDrawer;