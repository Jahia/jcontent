import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { uploadFile } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Input, Button, IconButton, ListItem, ListItemText, Avatar, ListItemSecondaryAction } from "@material-ui/core";
import { Close, ExpandMore, ExpandLess, Delete } from "@material-ui/icons";
import {connect} from "react-redux";
import UploadDrawer from './UploadDrawer';
import { panelStates, uploadsStatuses } from './constatnts';
import { setPanelState, removeUpload } from './redux/actions';
import UploadDropZone from './UploadDropZone';
import mimetypes from 'mime-types';

const styles = theme => ({});

class UploadItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {file:null}
    }

    render() {
        // console.log(this.state.file);
        const { classes, dispatch, id } = this.props;
        return <ListItem button className={classes.listItem} >
            <Avatar alt="Remy Sharp" src={ id } />
            <ListItemText primary={ id } />
            <ListItemSecondaryAction >
                <Button component={"a"} onClick={() => dispatch(removeUpload(id))} >
                    Don't upload
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
        // return (
        //     <Mutation mutation={uploadFile}>
        //         {(mutationCall, {called, loading, data, error}) =>
        //             <div>
        //                 <Input type="file" onChange={
        //                     (event) => { this.setState({file:event.target.files[0]})}
        //                 } >File</Input>
        //                 <Button onClick={() => mutationCall({variables:{fileHandle:this.state.file}})}>Upload</Button>
        //             </div>
        //         }
        //     </Mutation>
        // )
    }
}

UploadItem.propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return state.fileUpload.uploads[ownProps.index]
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch
    }
};

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(UploadItem)
);