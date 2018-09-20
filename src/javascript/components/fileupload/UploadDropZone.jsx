import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { UploadDropZoneFile } from './gqlMutations';
import { Button } from "@material-ui/core";
import { UploadDropZonesStatuses } from './constatnts';
import Dropzone from 'react-dropzone';

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "80%",
        height: "70%"
    },
    dropZone: {
        width: "100%",
        textAlign: "center",
        color: "whitesmoke",
        border: "2px dashed transparent",
        flex: 3
    },
    dropZoneHeader: {
        marginTop: 120
    },
    dropZoneActive: {
        border: "2px dashed #cecece",
    },
    button: {
        flex: 1
    }
});

class UploadDropZone extends React.Component {

    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.dropZone = React.createRef();
    }

    render() {
        // console.log(this.state.file);
        const { classes, acceptedFileTypes } = this.props;
        return <div className={ classes.root }>
            <Dropzone ref={ this.dropZone }
                      accept={ acceptedFileTypes }
                      className={ classes.dropZone }
                      activeClassName={ classes.dropZoneActive }
                      onDrop={ this.onDrop }>
                <h2 className={ classes.dropZoneHeader }>Drop files here to upload</h2>
                <h3>or</h3>
            </Dropzone>
            <Button className={ classes.button }
                    onClick={ () => this.dropZone.current.open() }>Select file from my computer</Button>
        </div>
    }

    onDrop(acceptedFiles, rejectedFiles) {
        this.props.onFilesSelected(acceptedFiles, rejectedFiles);
    }
}

UploadDropZone.propTypes = {
    classes: PropTypes.object.isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    acceptedFileTypes: PropTypes.array
};

export default withStyles(styles)(UploadDropZone);