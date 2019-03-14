import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ToolBar from '../ToolBar';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {Pagination} from '@jahia/react-material';
import DxContext from '../../DxContext';
import UploadTransformComponent from '../UploadTransformComponent';
import {valueToSizeTransformation} from './FilesGrid.utils';
import {connect} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux-actions';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';

const styles = theme => ({
    grid: {
        flex: '1 1 0%',
        overflowY: 'auto',
        overflowX: 'hidden',
        margin: '0!important',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    gridEmpty: {
        flex: '1 1 0%',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    centerGrid: {
        padding: theme.spacing.unit * 2
    },
    empty: {
        textAlign: 'center',
        margin: theme.spacing.unit * 3
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
        const {size, t, contentNotFound, classes, path, totalCount, pagination, setPageSize, setCurrentPage, rows, loading} = this.props;
        const {hoveredCard} = this.state;

        if ((!rows || rows.length === 0) && loading) {
            return null;
        }

        if (contentNotFound) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                        <Typography variant="epsilon" className={classes.empty}>
                            {t('label.contentManager.contentNotFound')}
                        </Typography>
                    </Grid>
                </React.Fragment>
            );
        }

        if ((!rows || rows.length === 0) && !loading) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <FilesGridEmptyDropZone mode="browse-files" path={path}/>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <ToolBar/>
                <div className={classes.grid} data-cm-role="grid-content-list">
                    <UploadTransformComponent container uploadTargetComponent={Grid} uploadPath={path} mode="browse-files">
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
                                            node={node}
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

let mapStateToProps = state => ({
    path: state.path,
    pagination: state.pagination,
    size: valueToSizeTransformation(state.filesGrid.size)
});

let mapDispatchToProps = dispatch => ({
    setCurrentPage: page => dispatch(cmSetPage(page)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize))
});

FilesGrid.propTypes = {
    classes: PropTypes.object.isRequired,
    contentNotFound: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    size: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired
};

FilesGrid.defaultProps = {
    contentNotFound: undefined
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
    withStyles(styles, {withTheme: true}),
)(FilesGrid);
