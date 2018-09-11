import React from 'react';
import {withApollo} from 'react-apollo';
import * as _ from "lodash";
import ContentListTable from "./list/ContentListTable";
import ContentPreview from "./preview/ContentPreview";
import PreviewDrawer from "./preview/PreviewDrawer";
import {Grid, IconButton, Paper, withStyles} from "@material-ui/core";
import {Visibility, VisibilityOff, List, Add} from "@material-ui/icons";
import ContentTrees from "./ContentTrees";
import {withNotifications} from '@jahia/react-material';
import {translate} from "react-i18next";
import ContentBreadcrumbs from "./breadcrumb/ContentBreadcrumbs";
import CmRouter from './CmRouter';
import {DxContext} from "./DxContext";
import Actions from "./Actions";
import CmButton from "./renderAction/CmButton";

//Files grid
import FilesGrid from './filesGrid/FilesGrid';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import {valueToSizeTransformation} from './filesGrid/filesGridUtils';
import {ContentData} from "./ContentData";
import CMTopBar from "./CMTopBar";

const styles = theme => ({
    topBar: {
        background: theme.palette.background.paper,
        color: theme.palette.primary.contrastText
    }
});

const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 1;
const TREE_SIZE = 3;

class ContentLayout extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            showTree: true,
            showPreview: false,
            selectedRow: null,
            filesGridSizeValue: 4,
            showList: false,
            page: 0,
            rowsPerPage: 25
        };
    }

    handleShowTree = () => {
        this.setState((prevState, props) => {
            return {
                showTree: !prevState.showTree
            }
        })
    };

    handleShowPreview = () => {
        if (this.state.selectedRow) {
            this.setState((prevState, props) => {
                return {
                    showPreview: !prevState.showPreview
                }
            })
        }
    };

    handleRowSelection = (row) => {
        //Remove selection and close preview panel if it is open
        if (this.state.selectedRow && row.path === this.state.selectedRow.path) {
            this.setState({
                selectedRow: null,
                showPreview: this.state.showPreview ? false : this.state.showPreview
            });
        }
        //Store selection
        else {
            this.setState({
                selectedRow: row
            });
        }
    };

    handleChangePage = newPage => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = value => {
        if (value != this.state.rowsPerPage) {
            this.setState({
                page: 0,
                rowsPerPage: value
            });
        }
    };

    isBrowsing() {
        let {contentSource} = this.props;
        return (contentSource === "browsing" || contentSource === "files")
    }

    render() {

        const {showPreview, selectedRow, showTree: showTree} = this.state;
        const {contentSource, contentTreeConfigs, mode, classes} = this.props;

        return <DxContext.Consumer>{dxContext => {
            const rootPath = '/sites/' + dxContext.siteKey;
            return <CmRouter render={({path, params, goto}) => {
                let computedTableSize = GRID_SIZE - (this.isBrowsing() && showTree ? TREE_SIZE : 0);
                return <React.Fragment>
                    <Grid container spacing={0}>
                        <Grid item xs={GRID_SIZE} className={classes.topBar}>
                            <CMTopBar dxContext={dxContext} mode={mode}/>
                        </Grid>
                        <Grid container xs={GRID_SIZE} direction="row" alignItems="center">
                            <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                                <ContentBreadcrumbs dxContext={dxContext} lang={dxContext.lang} rootPath={rootPath}/>
                            </Grid>
                            <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.buttonPanel}>
                                {this.isBrowsing() && path != rootPath &&
                                <Actions menuId={"createMenu"} context={{path: path}}>
                                    {(props) => <CmButton {...props}><Add/></CmButton>}
                                </Actions>
                                }
                                {this.isBrowsing() &&
                                <IconButton onClick={this.handleShowTree}><List/></IconButton>
                                }
                                {contentSource === "files" &&
                                <FilesGridModeSelector showList={this.state.showList} onChange={() => this.setState({showList: !this.state.showList})}/>
                                }
                                {showPreview &&
                                <IconButton onClick={this.handleShowPreview}><VisibilityOff/></IconButton>
                                }
                                {!showPreview &&
                                <IconButton onClick={this.handleShowPreview}><Visibility/></IconButton>
                                }
                                {contentSource === "files" &&
                                <FilesGridSizeSelector initValue={4} onChange={(value) => this.setState({filesGridSizeValue: value})}/>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <ContentData contentSource={contentSource} rootPath={rootPath} page={this.state.page} rowsPerPage={this.state.rowsPerPage}>
                        {({rows, totalCount, layoutQuery, layoutQueryParams}) => {
                            console.log("return data", totalCount, contentSource);
                            return <React.Fragment>
                                <Paper elevation={0}>
                                    <Grid container spacing={0}>
                                        {contentTreeConfigs && showTree &&
                                        <Grid item xs={TREE_SIZE} className={classes.tree}>
                                            <ContentTrees
                                                contentTreeConfigs={contentTreeConfigs}
                                                path={path}
                                                rootPath={rootPath}
                                                lang={dxContext.lang}
                                                user={dxContext.userName}
                                            />
                                        </Grid>
                                        }
                                        <Grid item xs={computedTableSize}>
                                            {contentSource === "files" && !this.state.showList
                                                ? <FilesGrid
                                                    size={valueToSizeTransformation(this.state.filesGridSizeValue)}
                                                    totalCount={totalCount}
                                                    rows={rows}
                                                    pageSize={this.state.rowsPerPage}
                                                    selectedRow={this.state.selectedRow}
                                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                    onChangePage={this.handleChangePage}
                                                    onRowSelected={this.handleRowSelection}
                                                    page={this.state.page}
                                                    lang={dxContext.lang}
                                                />
                                                : <ContentListTable
                                                    totalCount={totalCount}
                                                    rows={rows}
                                                    pageSize={this.state.rowsPerPage}
                                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                                    onChangePage={this.handleChangePage}
                                                    onRowSelected={this.handleRowSelection}
                                                    page={this.state.page}
                                                    lang={dxContext.lang}
                                                    selectedRow={this.state.selectedRow}
                                                />
                                            }
                                        </Grid>
                                    </Grid>
                                </Paper>
                                <PreviewDrawer open={showPreview} onClose={this.handleShowPreview}>
                                    {/*Always get row from query not from state to be up to date*/}
                                    <ContentPreview
                                        selection={rows.find((row) => {return selectedRow !== null && row.path === selectedRow.path})}
                                        layoutQuery={layoutQuery}
                                        layoutQueryParams={layoutQueryParams}
                                        rowSelectionFunc={this.handleRowSelection}
                                        dxContext={dxContext}
                                    />
                                </PreviewDrawer>
                            </React.Fragment>
                        }}
                    </ContentData>
                </React.Fragment>
            }}/>
        }}</DxContext.Consumer>;
    }
}

ContentLayout = _.flowRight(
    withNotifications(),
    translate(),
    withStyles(styles),
    withApollo
)(ContentLayout);

export {ContentLayout};