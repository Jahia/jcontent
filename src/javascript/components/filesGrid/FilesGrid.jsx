import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CmToolbar from '../CmToolbar';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import FileCard from './FileCard';
import {Grid} from '@material-ui/core';
import {Pagination} from '@jahia/react-material';
import {DxContext} from '../DxContext';
import {withStyles} from '@material-ui/core';
import UploadTransformComponent from '../fileupload/UploadTransformComponent';
import {valueToSizeTransformation} from './filesGridUtils';
import {connect} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../redux/actions';

const styles = theme => ({
    grid: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        maxHeight: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    gridEmpty: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        fontFamily: 'Nunito sans, sans-serif',
        height: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        maxHeight: 'calc(100vh - ' + (theme.contentManager.topBarHeight + theme.contentManager.toolbarHeight) + 'px)',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    centerGrid: {
        padding: theme.spacing.unit * 2
    },
    empty: {
        width: '100%',
        textAlign: 'center'
    }
});

class FilesGrid extends Component {
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
                <div>
                    <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                        <h3 className={classes.empty}>
                            { t('label.contentManager.contentNotFound') }
                        </h3>
                    </Grid>
                </div>
            );
        }

        if (!this.props.rows || this.props.rows.length === 0) {
            return (
                <div>
                    <CmToolbar/>
                    <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                        <h3 className={classes.empty}>
                            { t('label.contentManager.filesGrid.emptyMessage') }
                        </h3>
                    </Grid>
                </div>
            );
        }
        return (
            <div>
                <CmToolbar/>
                <div className={classes.grid} data-cm-role="grid-content-list">
                    <UploadTransformComponent container uploadTargetComponent={Grid} uploadPath={path}>
                        {
                        this.props.rows.map(node => (
                            <Grid key={node.uuid}
                                item
                                xs={size}
                                className={classes.centerGrid}
                                onMouseEnter={$event => this.onHoverEnter($event, node.path)}
                                onMouseLeave={$event => this.onHoverExit($event)}
                                >
                                <DxContext.Consumer>
                                    {
                                        dxContext => (
                                            <FileCard cardType={size}
                                                isHovered={node.path === hoveredCard}
                                                node={{...node, displayName: node.name}}
                                                dxContext={dxContext}/>
    )
                                    }
                                </DxContext.Consumer>
                            </Grid>
                        ))
                    }
                    </UploadTransformComponent>
                    <Pagination
                        totalCount={totalCount}
                        pageSize={pagination.pageSize}
                        currentPage={pagination.currentPage}
                        onChangeRowsPerPage={setPageSize}
                        onChangePage={setCurrentPage}
                    />
                </div>
            </div>
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

const ComposedFilesGrid = compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
    withStyles(styles, {withTheme: true}),
)(FilesGrid);

export default ComposedFilesGrid;
