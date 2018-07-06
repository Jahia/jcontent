import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography, Tab, Tabs, AppBar, Paper} from "@material-ui/core";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tabContainer: {
        padding: theme.spacing.unit * 3
    }
});

class TabContainer extends React.Component {

    render() {
        const {classes} = this.props;
        return (
            <Typography component="div" classes={{root: classes.tabContainer}}>
                {this.props.children}
            </Typography>
        );
    };
}

class ContentPreview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0,
        };
    }

    handleTabChange = (event, tabIndex) => {
        this.setState({
            tabIndex: tabIndex
        });
    };

    render() {

        const {classes, t} = this.props;
        const {tabIndex} = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={tabIndex} onChange={this.handleTabChange}>
                        <Tab label={t('label.contentManager.preview.tabs.preview')}/>
                        <Tab label={t('label.contentManager.preview.tabs.quickEdit')}/>
                        <Tab label={t('label.contentManager.preview.tabs.metadata')}/>
                    </Tabs>
                </AppBar>
                {tabIndex === 0 && <TabContainer> <div>
                    <Paper className={classes.root} elevation={1}>
                        <Typography variant="headline" component="h3">
                            This could it be a preview
                        </Typography>
                        <Typography component="p">
                            But for now it is only some sample text.
                        </Typography>
                    </Paper>
                </div></TabContainer>}
                {tabIndex === 1 && <TabContainer><Paper className={classes.root} elevation={1}>
                    <Typography variant="headline" component="h3">
                        Maybe one day
                    </Typography>
                    <Typography component="p">
                        But not now ..
                    </Typography>
                </Paper></TabContainer>}
                {tabIndex === 2 && <TabContainer>Surprise !!</TabContainer>}
            </div>
        );
    }
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

TabContainer = withStyles(styles)(TabContainer);

ContentPreview = compose(
    withStyles(styles),
    translate()
)(ContentPreview);

export default ContentPreview;