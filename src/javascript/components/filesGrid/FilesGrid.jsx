import React, { Component } from "react";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import FileCard from './FileCard';
import { Grid } from '@material-ui/core';
import { Pagination } from "@jahia/react-material";
import { DxContext } from "../DxContext";
import {withStyles} from "@material-ui/core";

const styles = theme => ({
    grid: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - 140px)',
        maxHeight:  'calc(100vh - 140px)',
        margin: '0!important',
        backgroundColor: '#efefef',
        padding: theme.spacing.unit*3,
    },
    gridEmpty: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        fontFamily: 'Nunito sans, sans-serif',
        height: 'calc(100vh - 140px)',
        maxHeight:  'calc(100vh - 140px)',
        margin: '0!important',
        backgroundColor: '#efefef',
    },
    centerGrid: {
        padding: theme.spacing.unit * 2,
    },
    row : {
        backgroundColor: 'red',
    },
    rowPair: {
        backgroundColor: 'black',
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
        }
    }

    onHoverEnter($event, path) {
        this.setState({
            hoveredCard:path
        })
    }

    onHoverExit($event) {
        this.setState({
            hoveredCard: null
        })
    }

    render() {
        const { size, t, handleShowPreview, contentNotFound, classes } = this.props;
        const {hoveredCard} = this.state;

        if (contentNotFound) {
            return (
                <Grid container className={classes.gridEmpty}>
                    <h3 className={classes.empty}>
                        { t("label.contentManager.contentNotFound") }
                    </h3>
                </Grid>
            )
        }

        if (!this.props.rows || this.props.rows.length === 0) {
            return (
            <Grid container className={classes.gridEmpty}>
                <h3 className={classes.empty}>
                    { t('label.contentManager.filesGrid.emptyMessage') }
                </h3>
            </Grid>
            )
        }
        return <div className={classes.grid}><Grid container>
            {
                this.props.rows.map((node) => (
                    <Grid key={ node.uuid } item xs={ size }
                          className={classes.centerGrid}
                          onMouseEnter={($event) => this.onHoverEnter($event, node.path) }
                          onMouseLeave={($event) => this.onHoverExit($event)}>
                        <DxContext.Consumer>
                            {
                                dxContext => <FileCard cardType={ size }
                                                       isHovered={node.path === hoveredCard}
                                                       node={ {...node, displayName: node.name} }
                                                       dxContext={ dxContext }
                                                       handleShowPreview={handleShowPreview}/>
                            }
                        </DxContext.Consumer>
                    </Grid>
                ))
            }
            <Pagination totalCount={this.props.totalCount} pageSize={this.props.pageSize} currentPage={this.props.page} onChangeRowsPerPage={this.props.onChangeRowsPerPage} onChangePage={this.props.onChangePage}/>
        </Grid></div>
    }
}

FilesGrid.propTypes = {
    size: PropTypes.number.isRequired,
    rows: PropTypes.array.isRequired,
};

const ComposedFilesGrid = compose(
    translate(),
    withStyles(styles, {withTheme: true}),
)(FilesGrid);

export default ComposedFilesGrid;