import React from 'react';
import {Typography, withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import {Button} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        height: '80%'
    },
    dropZone: {
        width: '100%',
        textAlign: 'center',
        color: theme.palette.background.paper,
        border: '2px dashed transparent'
    },
    dropZoneActive: {
        border: '2px dashed ' + theme.palette.border.main
    }
});

export class UploadDropZone extends React.Component {
    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.dropZone = React.createRef();
    }

    render() {
        const {classes, acceptedFileTypes, t} = this.props;
        return (
            <div className={classes.root}>
                <Dropzone ref={this.dropZone}
                          accept={acceptedFileTypes}
                          className={classes.dropZone}
                          activeClassName={classes.dropZoneActive}
                          onDrop={this.onDrop}
                >
                    <Typography variant="h4" color="inherit">{t('label.contentManager.fileUpload.dropMessage')}</Typography>
                    <Typography variant="h5" color="inherit">{t('label.contentManager.fileUpload.or')}</Typography>
                </Dropzone>
                <Button disableRipple
                        variant="outlined"
                        onClick={() => this.dropZone.current.open()}
                >{t('label.contentManager.fileUpload.selectMessage')}
                </Button>
            </div>
        );
    }

    onDrop(acceptedFiles) {
        this.props.onFilesSelected(acceptedFiles);
    }
}

UploadDropZone.propTypes = {
    classes: PropTypes.object.isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    acceptedFileTypes: PropTypes.array
};

UploadDropZone.defaultProps = {
    acceptedFileTypes: null
};

export default compose(
    withStyles(styles),
    translate())(UploadDropZone);
