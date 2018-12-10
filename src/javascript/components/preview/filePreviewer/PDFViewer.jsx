import React from 'react';
import PropTypes from 'prop-types';
import Pdf from 'react-pdf-js';
import {translate} from 'react-i18next';
import {IconButton, Paper, Tooltip, withStyles, withTheme} from '@material-ui/core';
import styled from 'styled-components/dist/styled-components.js';
import {
    ChevronLeft,
    ChevronRight,
    MagnifyMinusOutline,
    MagnifyPlusOutline,
    StepBackward,
    StepForward
} from 'mdi-material-ui';
import {compose} from 'react-apollo';

const PDFContainer = styled.div`
    height: calc(100% - 48px);
    display: flex;
    div {
        position: relative;
        max-height: 100%;
        width: 550px;
        margin: 0 auto;
    }
    canvas {
        position: relative;
        display: block;
        margin: 48px auto 96px;
    }
`;

const PDFContainerFull = styled.div`
    div {
        max-height: 100%;
    }
    canvas {
        position: relative;
        display: block;
        margin: 0 auto 48px;
    }
`;

const Controls = styled.div`
    position: fixed;
    bottom: 193px;
    z-index: 1;
    height: 48px;
    width:100%;
    background: ${props => props.backgroundColor};
    display: flex;
`;

const styles = () => ({
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
    scale: {
        top: '38px !important'
    }
});

const scaleSizes = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

class PDFViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: null,
            pages: null,
            scaleSize: 5,
            showScale: false
        };
        this.scaleTimeout = null;
        this.onDocumentComplete = this.onDocumentComplete.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
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

    renderPagination() {
        let {classes, theme} = this.props;
        let {page, pages, scaleSize} = this.state;

        return (
            <Controls backgroundColor={theme.palette.background.paper}>
                <Paper className={classes.controlLeft} elevation={0}/>
                <Paper className={classes.controlCenter} elevation={0}>
                    <IconButton disabled={page === 1}
                                onClick={event => {
                                    this.handleNavigation(event, 'first');
                                }}
                    >
                        <StepBackward/>
                    </IconButton>
                    <IconButton disabled={page === 1}
                                onClick={event => {
                                    this.handleNavigation(event, 'previous');
                                }}
                    >
                        <ChevronLeft/>
                    </IconButton>
                    <span>
                        {page}/{pages}
                    </span>
                    <IconButton disabled={page === pages}
                                onClick={event => {
                                    this.handleNavigation(event, 'next');
                                }}
                    >
                        <ChevronRight/>
                    </IconButton>
                    <IconButton disabled={page === pages}
                                onClick={event => {
                                    this.handleNavigation(event, 'last');
                                }}
                    >
                        <StepForward/>
                    </IconButton>
                </Paper>
                <Paper className={classes.controlRight} elevation={0}>
                    <IconButton disabled={scaleSize === 0}
                                onClick={event => {
                                    this.handleZoom(event, 'out');
                                }}
                    >
                        <MagnifyMinusOutline/>
                    </IconButton>
                    <IconButton disabled={scaleSize === scaleSizes.length - 1}
                                onClick={event => {
                                    this.handleZoom(event, 'in');
                                }}
                    >
                        <MagnifyPlusOutline/>
                    </IconButton>
                </Paper>
            </Controls>
        );
    }

    render() {
        let {page, scaleSize, showScale} = this.state;
        let {classes, file, fullScreen} = this.props;
        let pagination = this.renderPagination();

        const pdf = (
            <Pdf file={file}
                 scale={scaleSizes[scaleSize]}
                 page={page}
                 onDocumentComplete={this.onDocumentComplete}
            />
        );

        return (
            <React.Fragment>
                {pagination}

                <Tooltip title={Math.floor(scaleSizes[this.state.scaleSize] * 100) + ' %'}
                         placement="top-end"
                         open={showScale}
                         classes={{popper: classes.scale}}
                >
                    {fullScreen ?
                        <PDFContainerFull>
                            {pdf}
                        </PDFContainerFull> :
                        <PDFContainer>
                            {pdf}
                        </PDFContainer>
                    }
                </Tooltip>
            </React.Fragment>
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

export default compose(
    translate(),
    withTheme(),
    withStyles(styles)
)(PDFViewer);
