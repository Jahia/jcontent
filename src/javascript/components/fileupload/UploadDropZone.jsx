import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { uploadFile } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Input, Button, IconButton } from "@material-ui/core";
import { Close, ExpandMore, ExpandLess } from "@material-ui/icons";
import {connect} from "react-redux";
import UploadDrawer from './UploadDrawer';
import { panelStates, uploadsStatuses } from './constatnts';
import { setPanelState } from './redux/actions';
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

class Upload extends React.Component {

    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.dropZone = React.createRef();
    }

    render() {
        // console.log(this.state.file);
        const { classes } = this.props;
        return <div className={ classes.root }>
            <Dropzone ref={ this.dropZone }
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
        console.log(acceptedFiles, rejectedFiles);
    }
}


export default withStyles(styles)(Upload);