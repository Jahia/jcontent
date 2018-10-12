import React from 'react';
import PropTypes from 'prop-types';
import {Menu as ListIcon, ViewModule} from '@material-ui/icons';
import {Button, Tooltip, withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {lodash as _} from "lodash";

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
        const { classes, t} = this.props;
        return <Tooltip title={t( this.props.showList ? 'label.contentManager.filesGrid.toggleGridDisplay' : 'label.contentManager.filesGrid.toggleListDisplay')} placement="top-start" leaveDelay={200}>
            <Button onClick={ this.props.onChange }>
            {
                this.props.showList ? <ViewModule className={classes.iconSize} /> : <ListIcon className={classes.iconSize}/>
            }
            </Button>
        </Tooltip>;
    }
}

FilesGridModeSelector.propTypes = {
    showList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

FilesGridModeSelector = _.flowRight(
    translate(),
    withStyles(styles)
)(FilesGridModeSelector);

export default FilesGridModeSelector;