import React from 'react';
import PropTypes from 'prop-types';
import {Menu as ListIcon, ViewModule} from '@material-ui/icons';
import {Tooltip, withStyles, Button} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';

const styles = ({
    iconSize: {
        fontSize: '1.5em'
    }
});

class FilesGridModeSelector extends React.Component {
    render() {
        const {showList, onChange, classes, t} = this.props;
        return (
            <Tooltip
                title={t(showList ? 'label.contentManager.filesGrid.toggleGridDisplay' : 'label.contentManager.filesGrid.toggleListDisplay')}
                leaveDelay={200}
                >
                <Button onClick={onChange}>
                    {showList ? <ViewModule className={classes.iconSize}/> : <ListIcon className={classes.iconSize}/>}
                </Button>
            </Tooltip>
        );
    }
}

FilesGridModeSelector.propTypes = {
    showList: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(FilesGridModeSelector);
