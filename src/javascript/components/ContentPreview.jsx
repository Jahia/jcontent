import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { translate } from 'react-i18next';
import { withStyles, Paper } from "@material-ui/core";
import { previewQuery } from "./gqlQueries";

const styles = theme => ({
    root: {
        paddingLeft: theme.spacing.unit * 1
    },
    previewPaper: {
        overflow: "auto",
        flex: 1
    },
    previewContainer: {
        overflow: "auto",
        padding: theme.spacing.unit * 2
    }
});

class ContentPreview extends React.Component {

    render() {
        const { path, classes } = this.props;

        return (
            <Paper className={ classes.previewPaper }>
                <Query fetchPolicy={'network-only'} query={ previewQuery } variables={{path: path}}>
                    {({loading, error, data}) => {
                        return <div className={ classes.root }>
                                { this.previewComponent(data) }
                        </div>
                    }}
                </Query>
            </Paper>
        );
    }

    previewComponent(data) {
        const { classes, t } = this.props;
        const displayValue = data && data.jcr ? data.jcr.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');
        return <div className={ classes.previewContainer } dangerouslySetInnerHTML={{__html: displayValue}} />
    }
}

export default translate()(withStyles(styles)(ContentPreview));

ContentPreview.propTypes = {
    path: PropTypes.string
};