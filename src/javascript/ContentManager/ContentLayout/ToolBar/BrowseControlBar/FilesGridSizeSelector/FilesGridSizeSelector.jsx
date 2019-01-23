import React from 'react';
import {Tooltip, withStyles} from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import connect from 'react-redux/es/connect/connect';
import {setSize} from '../../../FilesGrid/FilesGrid.redux-actions';

const styles = theme => ({
    root: {
        width: 105,
        padding: 5,
        marginRight: theme.spacing.unit
    }
});

const totalsValues = 5;
const step = 1;

export class FilesGridSizeSelector extends React.Component {
    render() {
        const {classes, t, setSize, size, visible} = this.props;

        return visible && (
            <Tooltip title={t('label.contentManager.filesGrid.fileSizeSelector')}>
                <Slider
                    color="inherit"
                    value={size}
                    classes={{root: classes.root}}
                    min={1}
                    max={totalsValues}
                    step={step}
                    onChange={(event, value) => {
                        setSize(value);
                    }}
                />
            </Tooltip>
        );
    }
}

export default compose(
    connect(state => ({size: state.filesGrid.size, visible: state.filesGrid.mode === 'grid'}), dispatch => ({setSize: size => dispatch(setSize(size))})),
    translate(),
    withStyles(styles)
)(FilesGridSizeSelector);
