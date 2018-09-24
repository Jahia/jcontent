import React, { Component } from "react";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import FileCard from './FileCard';
import Grid from '@material-ui/core/Grid';
import { Pagination } from "@jahia/react-material";
import { DxContext } from "../DxContext";
import {withStyles} from "@material-ui/core";

const styles = theme => ({
    grid: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: '75vh',
        maxHeight: '75vh'
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
        const { size, t, handleShowPreview, classes } = this.props;
        const {hoveredCard} = this.state;

        if (this.props.rows.length === 0) {
            return <h3>
                { t('label.contentManager.filesGrid.emptyMessage') }
            </h3>
        }
        return <Grid container spacing={ 8 } className={classes.grid}>
            {
                this.props.rows.map((node) => (
                    <Grid key={ node.uuid } item xs={ size }
                          onMouseEnter={($event) => this.onHoverEnter($event, node.path) }
                          onMouseLeave={($event) => this.onHoverExit($event)}>
                        <DxContext.Consumer>
                            {
                                dxContext => <FileCard cardType={ size }
                                                       isHovered={node.path === hoveredCard}
                                                       node={ node }
                                                       dxContext={ dxContext }
                                                       handleShowPreview={handleShowPreview}/>
                            }
                        </DxContext.Consumer>
                    </Grid>
                ))
            }
            <Pagination totalCount={this.props.totalCount} pageSize={this.props.pageSize} currentPage={this.props.page} onChangeRowsPerPage={this.props.onChangeRowsPerPage} onChangePage={this.props.onChangePage}/>
        </Grid>
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