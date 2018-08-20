import React  from 'react';
import PropTypes from 'prop-types';
import FileViewer from 'react-file-viewer';
import {Paper} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components/dist/styled-components.js';
import {fileIcon} from '../../filesGrid/filesGridUtils';

const DocumentPreviewContainer = styled.div`
    width:500px;
    height:67%;
    display: flex;
    align-items: center;
    video {
        width:600px;    
        margin-left: 25px;
    }
    div.document-container {
        width:600px;
        margin-left: 25px;
        overflow-x: hidden;
    }
`;
const styles = theme => ({
    previewPaper: {
        flex:1,
        width: '650px'
    },
    defaultPaper: {
        flex:1,
        width: '650px',
        "marginLeft": "9vw"
    }
});
class DocumentViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let {file, type, classes} = this.props;
        switch(type) {
            case "docx":
            case "doc":
            case "avi":
            case "mp4":
            case "video":
                return <DocumentPreviewContainer>
                    <Paper className={classes.previewPaper} elevation={0}>
                        <FileViewer className={'test'}
                                    fileType={type}
                                    filePath={file}/>
                    </Paper>
                </DocumentPreviewContainer>;
            default:
                return <DocumentPreviewContainer>
                    <Paper className={classes.defaultPaper} elevation={0}>
                        {fileIcon(file, null, {"fontSize": "24em"})}
                    </Paper>
                </DocumentPreviewContainer>;
        }

    }
}

export default withStyles(styles)(DocumentViewer);