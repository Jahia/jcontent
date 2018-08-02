import React, { Component } from "react";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import FileCard from './FileCard';
import Grid from '@material-ui/core/Grid';

class FilesGrid extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { size, t } = this.props;

        if (this.props.rows.length === 0) {
            return <h3>
                { t('label.contentManager.filesGrid.emptyMessage') }
            </h3>
        }
        return <Grid container spacing={ 8 }>
            {
                this.props.rows.map((node) => (
                    <Grid key={ node.uuid } item xs={ size } >
                        <FileCard cardType={ size } node={ node }/>
                    </Grid>
                ))
            }
        </Grid>
    }
}

FilesGrid.propTypes = {
    size: PropTypes.number.isRequired,
    rows: PropTypes.array.isRequired
};

const ComposedFilesGrid = compose(
    translate()
)(FilesGrid);

export default ComposedFilesGrid;