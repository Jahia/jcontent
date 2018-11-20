import React  from 'react';
import PropTypes from 'prop-types';
import FileViewer from 'react-file-viewer';
import {Paper} from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import styled from 'styled-components/dist/styled-components.js';
import {fileIcon} from '../../filesGrid/filesGridUtils';

const DocumentPreviewContainer = styled.div`
    width:100%;
    height:700px;
    display: flex;
    justify-content: space-around;
    -webkit-flex-flow: row wrap;
    video {
        width: 100%;
    }
    div.document-container {
        position:absolute;
        height: 700px;
        width:100%;
        overflow: hidden auto;
        margin: 0 auto;
    }
`;
const styles = theme => ({
    documentPaper: {
        flex:1,
        width: '100%'
    },
    defaultPaper: {
        width: '550',
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoPaper: {
        width: '550',
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paperChange: {
        background: theme.palette.common.white,
    },
});
class DocumentViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderViewer() {
        let {file, type, classes} = this.props;
        switch(type) {
            case "docx":
            case "doc":
                return <Paper className={classes.documentPaper} classes={{root: classes.paperChange}} elevation={0}>
                    <FileViewer fileType={type}
                        filePath={file}/>
                </Paper>;
            case "avi":
            case "mp4":
            case "video":
                return <Paper className={classes.videoPaper} classes={{root: classes.paperChange}}  elevation={0}>
                    <FileViewer fileType={type}
                        filePath={file}/>
                </Paper>;
            default:
                return <Paper className={classes.defaultPaper} classes={{root: classes.paperChange}}    elevation={0}>
                    {fileIcon(file, null, {"fontSize": "24em"})}
                </Paper>;
        }
    };

    render() {
        return <DocumentPreviewContainer>
            {this.renderViewer()}
        </DocumentPreviewContainer>
    }
}

DocumentViewer.propTypes = {
    file: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
};

export default withStyles(styles)(DocumentViewer);
