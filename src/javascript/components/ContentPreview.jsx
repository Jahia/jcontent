import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import { withStyles, Paper } from "@material-ui/core";
import { previewQuery } from "./gqlQueries";

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
});

class ContentPreview extends React.Component {
    state = {
        value: 0,
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { path } = this.props;

        return (
            <Query fetchPolicy={'network-only'} query={ previewQuery } variables={{path: path}}>
                {({loading, error, data}) => {
                    return <Paper>
                        { data.jcr ? data.jcr.nodeByPath.renderedContent.output : "Generating ..." }
                    </Paper>
                }}
            </Query>
        );
    }
}

export default withStyles(styles)(ContentPreview);

ContentPreview.propTypes = {
    path: PropTypes.string
};