import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography, Tab, Tabs, AppBar, Paper} from "@material-ui/core";


function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

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
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={value} onChange={this.handleChange}>
                        <Tab label="Preview"/>
                        <Tab label="Quick Edit"/>
                        <Tab label="Metadata" href="#basic-tabs"/>
                    </Tabs>
                </AppBar>
                {value === 0 && <TabContainer> <div>
                    <Paper className={classes.root} elevation={1}>
                        <Typography variant="headline" component="h3">
                            This could it be a preview
                        </Typography>
                        <Typography component="p">
                            But for now it is only some sample text.
                        </Typography>
                    </Paper>
                </div></TabContainer>}
                {value === 1 && <TabContainer><Paper className={classes.root} elevation={1}>
                    <Typography variant="headline" component="h3">
                        Maybe one day
                    </Typography>
                    <Typography component="p">
                        But not now ..
                    </Typography>
                </Paper></TabContainer>}
                {value === 2 && <TabContainer>Surprise !!</TabContainer>}
            </div>
        );
    }
}

export default withStyles(styles)(ContentPreview);