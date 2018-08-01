import React, { Component } from "react";
import PropTypes from 'prop-types';
import FileCard from './FileCard';
import Grid from '@material-ui/core/Grid';

class FilesGrid extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { size } = this.props;
        return <Grid container spacing={ 8 }>
            <Grid item xs={ size } >
                <FileCard cardType={ size } />
            </Grid>
            <Grid item xs={ size }>
                <FileCard cardType={ size } />
            </Grid>
            <Grid item xs={ size }>
                <FileCard cardType={ size } />
            </Grid>
            <Grid item xs={ size }>
                <FileCard cardType={ size } />
            </Grid>
            <Grid item xs={ size }>
                <FileCard cardType={ size } />
            </Grid>
            <Grid item xs={ size }>
                <FileCard cardType={ size } />
            </Grid>
        </Grid>
    }
}

FilesGrid.propTypes = {
    size: PropTypes.number.isRequired
};

export default FilesGrid;