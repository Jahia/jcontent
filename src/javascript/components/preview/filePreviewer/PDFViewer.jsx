import React  from 'react';
import PropTypes from 'prop-types';
import PDF from 'react-pdf-js';
import { withStyles } from '@material-ui/core/styles';
import {translate} from "react-i18next";
import {IconButton, Paper} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/dist/styled-components.js';

const PDFContainer = styled.div`
    height:800;
    margin: 5px;
    display: flex;
    div {
        position:relative;
        width: 640px;
        overflow: auto;
        margin: 0 auto;
    }
    div > canvas {
        position:relative;
        display: block;
        margin: 0 auto;
    }
`;

const Controls = styled.div`
    width:100%;
    height: 48px;
    background: #eeeeee96;
    display: flex;
`;

const ZoomScaleDisplay = styled.div`
    position: fixed !important;
    z-index: 1300;
    top: 85px;
    right: 20px;
    background-color: #4c4c4ddb;
    width: 60px !important;
    text-align: center;
    height: 30px;
    padding-top: 7px;
    color: white;
    font-family: sans-serif;
    font-weight: 700;
    border-radius: 5px;
`;

const styles = theme => ({
    controlLeft: {
        flex: 1,
        margin: 'auto',
        background: 'transparent'
    },
    controlCenter: {
        alignSelf: 'center',
        margin: 'auto',
        background: 'transparent'
    },
    controlRight: {
        flex: 1,
        margin: 'auto',
        textAlign: 'end',
        background: 'transparent'
    },
    pdfPaper: {
        border: "1px solid #b0b5b6",
        flex:1,
        left: "50%",
        top: "50%",
        transform : "translate(-50%, -50%)"
    },
    hideScale: {
        opacity:0,
        transition: "opacity 0.3s ease-out 0s"
    },
    showScale: {
        opacity: 1,
        transition: "opacity 0.3s ease-in 0s"
    }
});

const scaleSizes = [.25, .33, .5, .67, .75, .8, .9, 1, 1.1, 1.25, 1.5, 1.75, 2];

class PDFViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: null,
            pages: null,
            file: props.file,
            scaleSize: 7
        };
        this.scaleTimeout = null;
    }

    onDocumentComplete = (pages) => {
        this.setState({ page: 1, pages });
    };

    handleNavigation = (event, value) => {
        this.setState((prevState, props) => {
            let {page, pages} = prevState;
            let newPage = page;
            switch(value) {
                case 'first':
                    newPage = 1;
                    break;
                case 'last':
                    newPage = pages;
                    break;
                case 'next':
                    newPage = ++page;
                    break;
                case 'previous' :
                    newPage = --page;
                    break;
            }
            return {page: newPage}
        });
    };

    handleZoom = (event, value) => {
        this.setState((prevState, props) => {
            let {scaleSize} = prevState;
            let newScaleSize = scaleSize;
            switch(value) {
                case 'in':
                    newScaleSize = ++scaleSize;
                    break;
                case 'out':
                    newScaleSize = --scaleSize;
                    break;
            }
            clearTimeout(this.scaleTimeout);
            this.scaleTimeout = setTimeout(() => {
                this.setState({showScale: false});
            }, 1000);
            return {scaleSize: newScaleSize, showScale: true}
        });
    };
    renderPagination = () => {
        let {classes} = this.props;
        let {page, pages, scaleSize} = this.state;
        let firstPageButton = <IconButton disabled={page === 1} onClick={(event) => {this.handleNavigation(event, 'first')}}>
            <FontAwesomeIcon size="xs" icon={"step-backward"}/>
        </IconButton>;
        let lastPageButton = <IconButton disabled={page === pages} onClick={(event) => {this.handleNavigation(event, 'last')}}>
            <FontAwesomeIcon size="xs" icon={"step-forward"}/>
        </IconButton>;
        let previousButton = <IconButton disabled={page === 1} onClick={(event) => {this.handleNavigation(event, 'previous')}}>
            <FontAwesomeIcon size="xs" icon={"chevron-left"}/>
        </IconButton>;
        let nextButton = <IconButton disabled={page === pages} onClick={(event) => {this.handleNavigation(event, 'next')}}>
            <FontAwesomeIcon size="xs" icon={"chevron-right"}/>
        </IconButton>;

        let zoomInButton = <IconButton disabled={scaleSize === scaleSizes.length-1} onClick={(event) => {this.handleZoom(event, 'in')}}>
            <FontAwesomeIcon size="xs" icon={"search-plus"}/>
        </IconButton>;
        let zoomOutButton = <IconButton disabled={scaleSize === 0} onClick={(event) => {this.handleZoom(event, 'out')}}>
            <FontAwesomeIcon size="xs" icon={"search-minus"}/>
        </IconButton>;
        return (
            <Controls>
                <Paper className={classes.controlLeft} elevation={0}/>
                <Paper className={classes.controlCenter} elevation={0}>
                    {firstPageButton}
                    {previousButton}
                    <span>{page}/{pages}</span>
                    {nextButton}
                    {lastPageButton}
                </Paper>
                <Paper className={classes.controlRight} elevation={0}>
                    {zoomOutButton}
                    {zoomInButton}
                </Paper>
            </Controls>
        )
    };

    displayScaleSize = () => {
      return Math.floor(scaleSizes[this.state.scaleSize] * 100) + " %"
    };

    render() {
        let {page, file, scaleSize, showScale} = this.state;
        let {classes} = this.props;
        let pagination = this.renderPagination();
        return <div>
                <ZoomScaleDisplay className={showScale ? classes.showScale : classes.hideScale}>{this.displayScaleSize()}</ZoomScaleDisplay>
                <PDFContainer>
                    <Paper elevation={0} className={classes.pdfPaper}>
                        <PDF
                            file={file}
                            scale={scaleSizes[scaleSize]}
                            onDocumentComplete={this.onDocumentComplete}
                            onPageComplete={this.onPageComplete}
                            page={page}
                        />
                    </Paper>
                </PDFContainer>
                {pagination}
            </div>
    }
}

PDFViewer.propTypes = {
    file: PropTypes.string.isRequired
};

export default translate()(withStyles(styles)(PDFViewer));

