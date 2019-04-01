import React from 'react';
import {FormControl, MenuItem} from '@material-ui/core';
import {Select} from '@jahia/ds-mui-theme';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMode, setSize} from '../../FilesGrid/FilesGrid.redux-actions';

export class FileModeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            select: 'thumbnail'
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        let selectedMode = e.target.value;
        let {onChange, setSize, mode, size} = this.props;
        this.setState({
            select: selectedMode
        });
        switch (selectedMode) {
            case 'list-view':
                onChange('list');
                break;
            case 'thumbnail':
                onChange('grid');
                if (size !== 1) {
                    setSize(1);
                }
                break;
            case 'detailed-view':
                onChange('grid');
                if (size !== 5) {
                    setSize(5);
                }
                break;
            default:
                if (mode === 'list') {
                    onChange('grid');
                }
        }
    }

    render() {
        let {t} = this.props;
        let {select} = this.state;
        return (
            <Select
                autoWidth
                value={select}
                variant="normal"
                onChange={this.handleChange}
            >
                <MenuItem value="thumbnail">{t('label.contentManager.filesGrid.selectThumbnailView')}</MenuItem>
                <MenuItem value="list-view">{t('label.contentManager.filesGrid.selectListView')}</MenuItem>
                <MenuItem value="detailed-view">{t('label.contentManager.filesGrid.selectDetailedView')}</MenuItem>
            </Select>
        );
    }
}

export default compose(
    connect(state => ({mode: state.filesGrid.mode, size: state.filesGrid.size}), dispatch => ({
        onChange: mode => dispatch(setMode(mode)),
        setSize: size => dispatch(setSize(size))
    })),
    translate(),
)(FileModeSelector);

