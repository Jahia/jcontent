import React from 'react';
import PropTypes from 'prop-types';
import Pdf from 'react-pdf-js';
import {translate} from 'react-i18next';
import {IconButton, Paper, withStyles} from '@material-ui/core';
import styled from 'styled-components/dist/styled-components.js';
import {
    ChevronLeft,
    ChevronRight,
    MagnifyMinusOutline,
    MagnifyPlusOutline,
    StepBackward,
    StepForward
} from 'mdi-material-ui';

const PDFContainer = styled.div`
    height:100%;
    margin: 5px;
    display: flex;
    div {
        position:relative;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        margin: 0 auto;
    }
    canvas {
        max-height: 100%;
        max-width: 100%;
        max-width: 550px;
        width: 550px;
    }
    div > canvas {
        position:relative;
        width: 100%;
        height: auto !important;
        max-width: 100%;
        display: block;
        margin: 0 auto;
    }
`;
const PDFContainerFull = styled.div`
    div {
    max-height: 100%;
    }
    div > canvas {
        position:relative;
        display: block;
        margin: 0 auto;
    }
`;

const Controls = styled.div`
    z-index: 1;
    position: fixed;
    bottom: 120;
    width:100%;
    height: 48px;
    background: #f5f5f5;
    display: flex;
`;

const ControlsFullScreen = styled.div`
    width:100vw;
    height: 48px;
    z-index: 1;
    position: fixed;
    bottom: 125;
    background: #f5f5f5;
    display: flex;
`;

const ZoomScaleDisplay = styled.div`
    position: fixed !important;
    z-index: 1300;
    top: 85px;
    right: 20px;
    background-color: # ;
    width: 60px !important;
    text-align: center;
    height: 30px;
    padding-top: 7px;
    color: #454545;
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
    colorPagination: {
        color: theme.palette.background.default
    },
    controlRight: {
        flex: 1,
        margin: 'auto',
        textAlign: 'end',
        background: 'transparent'
    },
    pdfPaper: {
        display: 'flex',
        justifyContent: 'center'
    },
    pdfPaperFull: {
        display: 'flex',
        justifyContent: 'center'
    },
    hideScale: {
        opacity: 0,
        transition: 'opacity 0.3s ease-out 0s'
    },
    showScale: {
        opacity: 1,
        transition: 'opacity 0.3s ease-in 0s'
    },
    paperPdf: {
        backgroundColor: theme.palette.common.white
    }
});

const scaleSizes = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

class PDFViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: null,
            pages: null,
            scaleSize: 7
        };
        this.scaleTimeout = null;
        this.onDocumentComplete = this.onDocumentComplete.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
        this.displayScaleSize = this.displayScaleSize.bind(this);
    }

    onDocumentComplete(pages) {
        this.setState({page: 1, pages});
    }

    handleNavigation(event, value) {
        this.setState(prevState => {
            let {page, pages} = prevState;
            let newPage = page;
            switch (value) {
                case 'first':
                    newPage = 1;
                    break;
                case 'last':
                    newPage = pages;
                    break;
                case 'next':
                    newPage = ++page;
                    break;
                case 'previous':
                    newPage = --page;
                    break;
                default:
                    break;
            }
            return {page: newPage};
        });
    }

    handleZoom(event, value) {
        this.setState(prevState => {
            let {scaleSize} = prevState;
            let newScaleSize = scaleSize;
            switch (value) {
                case 'in':
                    newScaleSize = ++scaleSize;
                    break;
                case 'out':
                    newScaleSize = --scaleSize;
                    break;
                default:
                    break;
            }
            clearTimeout(this.scaleTimeout);
            this.scaleTimeout = setTimeout(() => {
                this.setState({showScale: false});
            }, 1000);
            return {scaleSize: newScaleSize, showScale: true};
        });
    }

    renderPagination(fullScreen) {
        let {classes} = this.props;
        let {page, pages, scaleSize} = this.state;

        let firstPageButton = (
            <IconButton className={classes.colorPagination}
                        disabled={page === 1}
                        onClick={event => {
                            this.handleNavigation(event, 'first');
                        }}
            >
                <StepBackward/>
            </IconButton>
        );

        let lastPageButton = (
            <IconButton className={classes.colorPagination}
                        disabled={page === pages}
                        onClick={event => {
                            this.handleNavigation(event, 'last');
                        }}
            >
                <StepForward/>
            </IconButton>
        );

        let previousButton = (
            <IconButton className={classes.colorPagination}
                        disabled={page === 1}
                        onClick={event => {
                            this.handleNavigation(event, 'previous');
                        }}
            >
                <ChevronLeft/>
            </IconButton>
        );

        let nextButton = (
            <IconButton className={classes.colorPagination}
                        disabled={page === pages}
                        onClick={event => {
                            this.handleNavigation(event, 'next');
                        }}
            >
                <ChevronRight/>
            </IconButton>
        );

        let zoomInButton = (
            <IconButton
                className={classes.colorPagination}
                disabled={scaleSize === scaleSizes.length - 1}
                onClick={event => {
                            this.handleZoom(event, 'in');
                        }}
            >
                <MagnifyPlusOutline/>
            </IconButton>
        );

        let zoomOutButton = (
            <IconButton className={classes.colorPagination}
                        disabled={scaleSize === 0}
                        onClick={event => {
                            this.handleZoom(event, 'out');
                        }}
            >
                <MagnifyMinusOutline/>
            </IconButton>
        );

        return (
            <div>
                {fullScreen ?

                    <ControlsFullScreen>
                        <Paper className={classes.controlLeft} elevation={0}/>
                        <Paper className={classes.controlCenter} elevation={0}>
                            {firstPageButton}
                            {previousButton}
                            <span>
                                {page}/{pages}
                            </span>
                            {nextButton}
                            {lastPageButton}
                        </Paper>
                        <Paper className={classes.controlRight} elevation={0}>
                            {zoomOutButton}
                            {zoomInButton}
                        </Paper>
                    </ControlsFullScreen> :

                    <Controls>
                        <Paper className={classes.controlLeft} elevation={0}/>
                        <Paper className={classes.controlCenter} elevation={0}>
                            {firstPageButton}
                            {previousButton}
                            <span>
                                {page}/{pages}
                            </span>
                            {nextButton}
                            {lastPageButton}
                        </Paper>
                        <Paper className={classes.controlRight} elevation={0}>
                            {zoomOutButton}
                            {zoomInButton}
                        </Paper>
                    </Controls>
                }
            </div>
        );
    }

    displayScaleSize() {
        return Math.floor(scaleSizes[this.state.scaleSize] * 100) + ' %';
    }

    render() {
        let {page, scaleSize, showScale} = this.state;
        let {classes, file, fullScreen} = this.props;
        let pagination = this.renderPagination(fullScreen);

        return (
            <div>
                {pagination}
                <ZoomScaleDisplay className={showScale ? classes.showScale : classes.hideScale}>{this.displayScaleSize()}</ZoomScaleDisplay>

                {fullScreen ?

                    <PDFContainerFull>
                        <Paper elevation={0} className={classes.pdfPaper} classes={{root: classes.paperPdf}}>
                            <Pdf
                                file={file}
                                scale={scaleSizes[scaleSize]}
                                page={page}
                                onDocumentComplete={this.onDocumentComplete}
                                onPageComplete={this.onPageComplete}
                            />
                        </Paper>
                    </PDFContainerFull> :

                    <PDFContainer>
                        <Paper elevation={0} className={classes.pdfPaper} classes={{root: classes.paperPdf}}>
                            <Pdf
                                file={file}
                                scale={scaleSizes[scaleSize]}
                                page={page}
                                onDocumentComplete={this.onDocumentComplete}
                                onPageComplete={this.onPageComplete}
                            />
                        </Paper>
                    </PDFContainer>
                }
            </div>
        );
    }
}

PDFViewer.propTypes = {
    classes: PropTypes.object,
    file: PropTypes.string.isRequired,
    fullScreen: PropTypes.bool.isRequired
};

PDFViewer.defaultProps = {
    classes: null
};

export default translate()(withStyles(styles)(PDFViewer));
