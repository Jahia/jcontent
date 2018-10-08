import React from 'react';
import PropTypes from 'prop-types';
import ListIcon from '@material-ui/icons/Menu';
import ViewModule from '@material-ui/icons/ViewModule';
import Button from '@material-ui/core/Button';
import {withStyles} from "@material-ui/core/styles/index";

const styles = ({
    iconSize: {
        fontSize: '1.5em'
    },
});

class FilesGridModeSelector extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this.props;
        return <Button onClick={ this.props.onChange }>
            {
                this.props.showList ? <ViewModule className={classes.iconSize} /> : <ListIcon className={classes.iconSize}/>
            }
        </Button>;
    }
}

FilesGridModeSelector.propTypes = {
    showList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(FilesGridModeSelector);