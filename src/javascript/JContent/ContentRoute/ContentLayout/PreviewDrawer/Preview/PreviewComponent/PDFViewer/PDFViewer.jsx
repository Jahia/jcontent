import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {Tooltip, withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {
    ChevronLeft,
    ChevronRight,
    MagnifyMinusOutline,
    MagnifyPlusOutline,
    StepBackward,
    StepForward
} from 'mdi-material-ui';
import {compose} from '~/utils';
import classNames from 'classnames';
import clsx from 'clsx';

const styles = theme => ({
    pdfContainer: {
        flex: '1 1 0%',
        width: '100%',
        overflow: 'auto',
        '& canvas': {
            display: 'block',
            paddingTop: (theme.spacing.unit * 3) + 'px',
            paddingBottom: (theme.spacing.unit * 9) + 'px',
            margin: '0 auto'
        },
        '&$fullScreen': {
            maxWidth: '90%'
        }
    },
    fullScreen: {},
    controlsContainer: {
        height: (theme.spacing.unit * 6) + 'px',
        padding: 'var(--spacing-small)',
        width: '100%',
        background: theme.palette.background.paper
    },
    scale: {
        top: '38px !important'
    }
});

const scaleSizes = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

const Pdf = React.lazy(() => import(/* webpackChunkName: "reactPdfJs" */ 'react-pdf-js'));

export class PDFViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pages: null,
            scaleSize: 6,
            showScale: false
        };
        this.scaleTimeout = null;
        this.onDocumentComplete = this.onDocumentComplete.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
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

    render() {
        let {page, pages, scaleSize, showScale} = this.state;
        let {classes, file, fullScreen} = this.props;

        return (
            <React.Fragment>
                <Tooltip title={Math.floor(scaleSizes[this.state.scaleSize] * 100) + ' %'}
                         placement="top-end"
                         open={showScale}
                         classes={{popper: classes.scale}}
                >
                    <div className={classNames(classes.pdfContainer, fullScreen && classes.fullScreen)}>
                        <Pdf key={file}
                             file={file}
                             scale={scaleSizes[scaleSize]}
                             page={page}
                             onDocumentComplete={this.onDocumentComplete}
                        />
                    </div>
                </Tooltip>

                <div className={clsx('flexRow_between', classes.controlsContainer)}>
                    <div className={clsx('flexRow', 'alignCenter')}/>
                    <div className={clsx('flexRow', 'alignCenter')}>
                        <Button disabled={page === 1}
                                variant="ghost"
                                icon={<StepBackward/>}
                                onClick={event => {
                                    this.handleNavigation(event, 'first');
                                }}
                        />
                        <Button disabled={page === 1}
                                variant="ghost"
                                icon={<ChevronLeft/>}
                                onClick={event => {
                                    this.handleNavigation(event, 'previous');
                                }}
                        />
                        <Typography variant="caption">
                            {page}/{pages}
                        </Typography>
                        <Button disabled={page === pages}
                                variant="ghost"
                                icon={<ChevronRight/>}
                                onClick={event => {
                                    this.handleNavigation(event, 'next');
                                }}
                        />
                        <Button disabled={page === pages}
                                variant="ghost"
                                icon={<StepForward/>}
                                onClick={event => {
                                    this.handleNavigation(event, 'last');
                                }}
                        />
                    </div>
                    <div className={clsx('flexRow', 'alignCenter')}>
                        <Button disabled={scaleSize === 0}
                                variant="ghost"
                                icon={<MagnifyMinusOutline/>}
                                onClick={event => {
                                    this.handleZoom(event, 'out');
                                }}
                        />
                        <Button disabled={scaleSize === scaleSizes.length - 1}
                                variant="ghost"
                                icon={<MagnifyPlusOutline/>}
                                onClick={event => {
                                    this.handleZoom(event, 'in');
                                }}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

PDFViewer.propTypes = {
    classes: PropTypes.object.isRequired,
    file: PropTypes.string.isRequired,
    // eslint-disable-next-line react/boolean-prop-naming
    fullScreen: PropTypes.bool.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(PDFViewer);
