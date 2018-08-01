import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    published: {
        width: 8,
        height: 160,
        backgroundColor: theme.palette.publicationStatus.published.main
    }
});

class PublicationStatus extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;

        return <div className={ classes.published }>

        </div>
    }
}

PublicationStatus.propTypes = {
    status: PropTypes.object.isRequired
};


export default withStyles(styles)(PublicationStatus);