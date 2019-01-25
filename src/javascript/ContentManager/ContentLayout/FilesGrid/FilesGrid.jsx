import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ToolBar from '../ToolBar';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import FileCard from './FileCard';
import {Grid} from '@material-ui/core';
import {Pagination} from '@jahia/react-material';
import DxContext from '../../DxContext';
import {Typography, withStyles} from '@material-ui/core';
import UploadTransformComponent from '../UploadTransformComponent';
import {valueToSizeTransformation} from './FilesGrid.utils';
import {connect} from 'react-redux';
import {cmSetPage} from '../pagination.redux-actions';
import {cmSetPageSize} from '../pagination.redux-actions';
import {CloudUpload} from '@material-ui/icons';

const styles = theme => ({
    grid: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        maxHeight: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight + theme.contentManager.paginationHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    gridEmpty: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        maxHeight: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    centerGrid: {
        padding: theme.spacing.unit * 2
    },
    empty: {
        textAlign: 'center',
        margin: theme.spacing.unit * 3
    },
    dragZoneRoot: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: theme.spacing.unit * 4
    },
    dropZone: {
        border: '2px dashed ' + theme.palette.border.main,
        color: theme.palette.text.disabled,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'inherit',
        height: 'inherit',
        boxSizing: 'border-box',
        transitionDuration: '.1s'
    }
});

export class FilesGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredCard: null
        };
    }

    onHoverEnter($event, path) {
        this.setState({
            hoveredCard: path
        });
    }

    onHoverExit() {
        this.setState({
            hoveredCard: null
        });
    }

    render() {
        const {size, t, contentNotFound, classes, path, totalCount, pagination, setPageSize, setCurrentPage} = this.props;
        const {hoveredCard} = this.state;

        if (contentNotFound) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                        <Typography variant="subtitle1" className={classes.empty}>
                            {t('label.contentManager.contentNotFound')}
                        </Typography>
                    </Grid>
                </React.Fragment>
            );
        }

        if (!this.props.rows || this.props.rows.length === 0) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <UploadTransformComponent container uploadTargetComponent={Grid} uploadPath={path}>
                        <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                            <div className={classes.dragZoneRoot}>
                                <div className={classes.dropZone}>
                                    <Typography variant="h6" color="inherit">{t('label.contentManager.fileUpload.dropMessage')}</Typography>
                                    <CloudUpload/>
                                </div>
                            </div>
                        </Grid>
                    </UploadTransformComponent>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <ToolBar/>
                <div className={classes.grid} data-cm-role="grid-content-list">
                    <UploadTransformComponent container uploadTargetComponent={Grid} uploadPath={path}>
                        {this.props.rows.map((node, index) => (
                            <Grid
                                key={node.uuid}
                                item
                                xs={size}
                                className={classes.centerGrid}
                                onMouseEnter={$event => this.onHoverEnter($event, node.path)}
                                onMouseLeave={$event => this.onHoverExit($event)}
                            >
                                <DxContext.Consumer>
                                    {dxContext => (
                                        <FileCard
                                            cardType={size}
                                            index={index}
                                            isHovered={node.path === hoveredCard}
                                            node={{...node, displayName: node.name}}
                                            dxContext={dxContext}
                                        />
                                    )}
                                </DxContext.Consumer>
                            </Grid>
                        ))}
                    </UploadTransformComponent>
                </div>
                <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
            </React.Fragment>
        );
    }
}

FilesGrid.propTypes = {
    size: PropTypes.number.isRequired,
    rows: PropTypes.array.isRequired
};

let mapStateToProps = state => ({
    path: state.path,
    pagination: state.pagination,
    size: valueToSizeTransformation(state.filesGrid.size)
});

let mapDispatchToProps = dispatch => ({
    setCurrentPage: page => dispatch(cmSetPage(page)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
    withStyles(styles, {withTheme: true}),
)(FilesGrid);
