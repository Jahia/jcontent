import React from 'react';
import { uploadFile } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Input, Button } from "@material-ui/core";

class Upload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {file:null}
    }

    render() {
        console.log(this.state.file);
        return (
            <Mutation mutation={uploadFile}>
                {(mutationCall, {called, loading, data, error}) =>
                    <div>
                        <Input type="file" onChange={
                            (event) => { this.setState({file:event.target.files[0]})}
                        } >File</Input>
                        <Button onClick={() => mutationCall({variables:{fileHandle:this.state.file}})}>Upload</Button>
                    </div>
                }
            </Mutation>
        )
    }
}

export default Upload;