import React from 'react';
import PropTypes from 'prop-types';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';

class FilesGridModeSelector extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <IconButton onClick={ this.props.onChange }>
            {
                this.props.showList ? <GridIcon /> : <ListIcon />
            }
        </IconButton>;
    }
}

FilesGridModeSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    showList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export default FilesGridModeSelector;