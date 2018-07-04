import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import { withStyles, Paper } from "@material-ui/core";
import { previewQuery } from "./gqlQueries";

const styles = theme => ({
    root: {
        height: "100%",
    },
});

class ContentPreview extends React.Component {

    render() {
        const { path, classes } = this.props;

        return (
            <Query fetchPolicy={'network-only'} query={ previewQuery } variables={{path: path}}>
                {({loading, error, data}) => {
                    return <Paper className={ classes.root }>
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