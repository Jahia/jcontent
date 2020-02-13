import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Badge, Checkbox, Table, TableBody, TableCell, TableRow, Tooltip, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {Lock} from '@material-ui/icons';
import {Folder, Wrench} from 'mdi-material-ui';
import ContentListHeader from './ContentListHeader';
import {ContextualMenu} from '@jahia/ui-extender';
import {iconButtonRenderer, Pagination} from '@jahia/react-material';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import * as _ from 'lodash';
import {useTranslation} from 'react-i18next';
import PublicationStatus from '../PublicationStatus';
import dayjs from 'dayjs';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths, cmSetMode} from '../../../JContent.redux';
import {allowDoubleClickNavigation, extractPaths, getDefaultLocale, isMarkedForDeletion} from '../../../JContent.utils';
import {connect} from 'react-redux';
import {compose} from '~/utils';
import UploadTransformComponent from '../UploadTransformComponent';
import classNames from 'classnames';
import {cmSetPreviewSelection} from '../../../preview.redux';
import {cmSetSort} from '../sort.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import JContentConstants from '../../../JContent.constants';
import ContentListEmptyDropZone from './ContentListEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';
import {DocumentIcon, FileIcon, ImageIcon, ZipIcon} from '../icons';
import {useKeyboardNavigation} from '../useKeyboardNavigation';

const allColumnData = [
    {
        id: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName'
    },
    {
        id: 'wip',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'lock',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'type',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName'
    },
    {
        id: 'createdBy',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value'
    },
    {
        id: 'lastModified',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value'
    }
];

const reducedColumnData = [
    {
        id: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName'
    },
    {
        id: 'wip',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'lock',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'createdBy',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value'
    },
    {
        id: 'lastModified',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value'
    }
];

const styles = theme => ({
    tableWrapper: {
        flex: '1 1 0%',
        maxWidth: '100%',
        overflow: 'auto',
        position: 'relative',
        outline: 'none'
    },
    row: {
        userSelect: 'none',
        cursor: 'default',
        '&&:nth-of-type(odd)': {
            backgroundColor: theme.palette.ui.alpha
        },
        '&&:hover': {
            backgroundColor: theme.palette.hover.row
        }
    },
    contextualMenuOpen: {
        '&&&': {
            backgroundColor: theme.palette.hover.row
        }
    },
    rowShowActions: {
        '&:hover $actionsDiv': {
            display: 'block'
        },
        '&:hover $lastModifiedTypography': {
            display: 'none'
        }
    },
    rowCursor: {
        '&&:hover': {
            cursor: 'pointer'
        }
    },
    selectedRow: {
        '&&&': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white
        },
        '& $badge': {
            color: theme.palette.brand.alpha,
            backgroundColor: theme.palette.invert.beta
        }
    },
    cell: {
        maxWidth: '2vw',
        textOverflow: 'ellipsis'
    },
    selectedCell: {
        '&&': {
            color: 'white'
        }
    },
    publicationCell: {
        position: 'relative'
    },
    nameCell: {
        padding: '4px 8px 4px 24px',
        maxWidth: '16vw',
        '& img': {
            marginRight: '6px',
            verticalAlign: 'sub'
        },
        '& > span': {
            width: '100%',
            '& > p': {
                marginRight: theme.spacing.unit * 2
            }
        }
    },
    nameCellPreviewOpened: {
        maxWidth: '11vw'
    },
    lastModifiedCell: {
        paddingRight: '8px',
        width: '200px'
    },
    lastModifiedTypography: {
        textAlign: 'right',
        paddingRight: theme.spacing.unit * 2
    },
    actionsDiv: {
        float: 'right',
        color: theme.palette.primary.dark,
        display: 'none',
        '& button': {
            margin: 0
        }
    },
    isDeleted: {
        textDecoration: 'line-through'
    },
    empty: {
        textAlign: 'center'
    },
    publicationStatusRoot: {
        top: 0,
        width: 6,
        '&:hover': {
            width: 640
        }
    },
    publicationStatusBorder: {
        '&:hover ~ $publicationInfoWrapper': {
            width: 640,
            minWidth: 640,
            maxWidth: 640
        }
    },
    publicationInfo: {
        minWidth: 640 - (theme.spacing.unit * 4) - 6
    },
    publicationInfoWrapper: {
        '&:hover': {
            width: 640,
            minWidth: 640,
            maxWidth: 640
        }
    },
    disabledSort: {
        cursor: 'initial'
    },
    subContentButton: {
        textDecoration: 'underline',
        margin: 0,
        padding: 0
    },
    badge: {
        marginTop: theme.spacing.unit,
        marginLeft: theme.spacing.unit,
        backgroundColor: theme.palette.brand.alpha,
        color: theme.palette.invert.beta
    },
    icon: {
        verticalAlign: 'bottom',
        marginRight: '3px'
    }
});

const getCellClasses = (node, classes, column, isSelected, isPreviewOpened) => {
    let selected = isSelected && isPreviewOpened;
    return {
        root: classNames(
            classes.cell,
            classes[column + 'Cell'],
            {
                [classes.selectedCell]: selected,
                [classes[column + 'CellPreviewOpened']]: isPreviewOpened,
                [classes[column + 'CellSelected']]: selected,
                [classes.isDeleted]: isMarkedForDeletion(node)
            }
        )
    };
};

const isWip = (node, lang) => {
    if (node.wipStatus) {
        switch (node.wipStatus.value) {
            case 'ALL_CONTENT':
                return true;
            case 'LANGUAGES':
                return _.includes(node.wipLangs.values, lang);
            default:
                return false;
        }
    }

    return false;
};

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

const getMediaIcon = (node, classes) => {
    switch (node.primaryNodeType.displayName) {
        case 'Folder':
            return <Folder className={classes.icon}/>;
        case 'File':
            if (node.mixinTypes.length !== 0 && !_.isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:image'))) {
                return <ImageIcon className={classes.icon}/>;
            }

            if (node.name.match(/.zip$/g) || node.name.match(/.tar$/g) || node.name.match(/.rar$/g)) {
                return <ZipIcon className={classes.icon}/>;
            }

            if (node.mixinTypes.length !== 0 && !_.isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:document'))) {
                return <DocumentIcon className={classes.icon}/>;
            }

            return <FileIcon className={classes.icon}/>;
        default:
            return <img src={addIconSuffix(node.primaryNodeType.icon)}/>;
    }
};

export const ContentListTable = ({
    setPath,
    mode,
    siteKey,
    setMode,
    rows,
    selection,
    removeSelection,
    contentNotFound,
    pagination,
    sort,
    setCurrentPage,
    setPageSize,
    onPreviewSelect,
    previewSelection,
    totalCount,
    classes,
    uilang,
    setSort,
    path,
    previewState,
    lang,
    switchSelection,
    addSelection,
    loading}) => {
    const {t} = useTranslation();
    const [contextualMenuOpen, setContextualMenuOpen] = useState(null);

    const {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    } = useKeyboardNavigation({
        listLength: rows.length,
        onSelectionChange: index => onPreviewSelect(rows[index].path)
    });

    useEffect(() => {
        if (selection.length > 0) {
            const paths = rows.map(node => node.path);
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }, [rows, selection, removeSelection]);

    const doubleClickNavigation = node => {
        let newMode = mode;
        if (mode === JContentConstants.mode.SEARCH) {
            if (node.path.indexOf('/files') !== -1) {
                newMode = JContentConstants.mode.MEDIA;
            } else if (node.path.indexOf('/contents') !== -1) {
                newMode = JContentConstants.mode.CONTENT_FOLDERS;
            } else {
                newMode = JContentConstants.mode.PAGES;
            }

            setMode(newMode);
        }

        setPath(siteKey, node.path, newMode, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'});
    };

    let columnData = previewState === CM_DRAWER_STATES.SHOW ? reducedColumnData : allColumnData;
    let isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;

    const onContextualMenuExit = ctx => {
        if (ctx.actionKey === 'contentMenu' || ctx.actionKey === 'selectedContentMenu') {
            setContextualMenuOpen(null);
        }
    };

    return (
        <>
            <div ref={mainPanelRef}
                 className={classes.tableWrapper}
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                    <ContentListHeader
                            order={sort.order}
                            orderBy={sort.orderBy}
                            columnData={columnData}
                            classes={classes}
                            setSort={setSort}
                            anySelected={selection.length > 0 && rows.reduce((acc, node) => acc || selection.indexOf(node.path) !== -1, false)}
                            allSelected={selection.length > 0 && rows.reduce((acc, node) => acc && selection.indexOf(node.path) !== -1, true)}
                            selectAll={() => addSelection(rows.map(node => node.path))}
                            unselectAll={() => removeSelection(rows.map(node => node.path))}
                        />
                    {
                            contentNotFound ? (
                                <ContentNotFound columnData={columnData} t={t} className={classes.empty}/>
                                ) :
                                (
                                    (_.isEmpty(rows) && !loading) ? (
                                            (mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH) ?
                                                <EmptyTable columnData={columnData} t={t}/> :
                                                <ContentListEmptyDropZone mode={mode} path={path}/>
                                        ) :
                                        (
                                            <UploadTransformComponent uploadTargetComponent={TableBody}
                                                                      uploadPath={path}
                                                                      mode={mode}
                                            >
                                                {rows.map((node, index) => {
                                                    let isSelected = node.path === previewSelection && isPreviewOpened;
                                                    let icon = getMediaIcon(node, classes);
                                                    let showActions = !isPreviewOpened && selection.length === 0;
                                                    let contextualMenu = React.createRef();
                                                    let showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;

                                                    const openContextualMenu = event => {
                                                        contextualMenu.current.open(event);
                                                        setContextualMenuOpen(contextualMenu.current.props.context.path ? [contextualMenu.current.props.context.path] : contextualMenu.current.props.context.paths);
                                                    };

                                                    return (
                                                        <TableRow
                                                            key={node.uuid}
                                                            hover
                                                            classes={{
                                                                root: classNames(classes.row, {
                                                                    [classes.rowCursor]: isPreviewOpened,
                                                                    [classes.rowShowActions]: showActions,
                                                                    [classes.contextualMenuOpen]: contextualMenuOpen && contextualMenuOpen.indexOf(node.path) > -1
                                                                }),
                                                                selected: classes.selectedRow
                                                            }}
                                                            data-cm-node-path={node.path}
                                                            data-cm-role="table-content-list-row"
                                                            selected={isSelected}
                                                            onClick={() => {
                                                                if (!node.notSelectableForPreview) {
                                                                    setSelectedItemIndex(index);
                                                                    onPreviewSelect(node.path);
                                                                }
                                                            }}
                                                            onContextMenu={event => {
                                                                event.stopPropagation();
                                                                openContextualMenu(event);
                                                            }}
                                                            onDoubleClick={allowDoubleClickNavigation(
                                                                node.primaryNodeType.name,
                                                                node.subNodes ? node.subNodes.pageInfo.totalCount : null,
                                                                () => {
                                                                    doubleClickNavigation(node);
                                                                })}
                                                        >
                                                            <ContextualMenu
                                                                ref={contextualMenu}
                                                                actionKey={selection.length === 0 || selection.indexOf(node.path) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                                                                context={selection.length === 0 || selection.indexOf(node.path) === -1 ? {path: node.path, onExit: onContextualMenuExit} : {paths: selection, onExit: onContextualMenuExit}}
                                                            />
                                                            <TableCell
                                                                padding="none"
                                                                classes={{root: classes.publicationCell}}
                                                                data-cm-role="table-content-list-cell-publication"
                                                            >
                                                                <PublicationStatus
                                                                    node={node}
                                                                    classes={{
                                                                        root: classes.publicationStatusRoot,
                                                                        border: classes.publicationStatusBorder,
                                                                        publicationInfo: classes.publicationInfo,
                                                                        publicationInfoWrapper: classes.publicationInfoWrapper
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                padding="checkbox"
                                                                classes={getCellClasses(node, classes, 'checkbox', isSelected, isPreviewOpened)}
                                                            >
                                                                <Checkbox
                                                                    checked={selection.indexOf(node.path) !== -1}
                                                                    onClick={() => {
                                                                        switchSelection(node.path);
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            {columnData.map(column => {
                                                                if (column.id === 'name') {
                                                                    return (
                                                                        <TableCell
                                                                            key={column.id}
                                                                            classes={getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                            data-cm-role="table-content-list-cell-name"
                                                                        >
                                                                            {showSubNodes ?
                                                                                <Badge
                                                                                    badgeContent={node.subNodes.pageInfo.totalCount}
                                                                                    invisible={node.subNodes.pageInfo.totalCount === 0}
                                                                                    classes={{badge: classes.badge}}
                                                                                    data-cm-role="sub-contents-count"
                                                                                >
                                                                                    <Typography noWrap
                                                                                                variant="iota"
                                                                                                color="inherit"
                                                                                    >
                                                                                        {icon}
                                                                                        {_.get(node, column.property)}
                                                                                    </Typography>
                                                                                </Badge> :
                                                                                <Typography noWrap
                                                                                            variant="iota"
                                                                                            color="inherit"
                                                                                >
                                                                                    {icon}
                                                                                    {_.get(node, column.property)}
                                                                                </Typography>}
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                if (column.id === 'wip') {
                                                                    return (
                                                                        <TableCell
                                                                            key={column.id}
                                                                            classes={getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                            padding="none"
                                                                        >
                                                                            {isWip(node, lang) &&
                                                                            <Tooltip
                                                                                title={node.wipLangs ? t('jcontent:label.contentManager.workInProgress', {wipLang: node.wipLangs.values}) : t('jcontent:label.contentManager.workInProgressAll')}
                                                                            >
                                                                                <Wrench fontSize="small"
                                                                                        color="inherit"/>
                                                                            </Tooltip>}
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                if (column.id === 'lock') {
                                                                    return (
                                                                        <TableCell
                                                                            key={column.id}
                                                                            classes={getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                            padding="none"
                                                                        >
                                                                            {node.lockOwner !== null &&
                                                                            <Tooltip
                                                                                title={t('jcontent:label.contentManager.locked')}
                                                                            >
                                                                                <Lock fontSize="small" color="inherit"/>
                                                                            </Tooltip>}
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                if (column.id === 'lastModified') {
                                                                    return (
                                                                        <TableCell
                                                                            key={column.id}
                                                                            classes={getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                            data-cm-role={'table-content-list-cell-' + column.id}
                                                                            padding={showActions ? 'checkbox' : 'default'}
                                                                        >
                                                                            <Typography noWrap
                                                                                        variant="iota"
                                                                                        color="inherit"
                                                                                        className={classes.lastModifiedTypography}
                                                                            >
                                                                                <time>{dayjs(_.get(node, column.property)).locale(getDefaultLocale(uilang)).format('ll')}</time>
                                                                            </Typography>
                                                                            {showActions &&
                                                                            <div key="actions"
                                                                                 className={classes.actionsDiv}
                                                                                 data-cm-role="table-content-list-cell-actions"
                                                                            >
                                                                                <DisplayActions
                                                                                    target="contentActions"
                                                                                    filter={value => {
                                                                                        return _.includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                                                                                    }}
                                                                                    context={{path: node.path}}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        size: 'compact',
                                                                                        disableRipple: true
                                                                                    }, true, true)}
                                                                                />
                                                                                <DisplayAction
                                                                                    actionKey="contentMenu"
                                                                                    context={{
                                                                                        path: node.path,
                                                                                        menuFilter: value => {
                                                                                            return !_.includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                                                                                        }
                                                                                    }}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        size: 'compact',
                                                                                        disableRipple: true
                                                                                    }, true)}
                                                                                />
                                                                            </div>}
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        data-cm-role={'table-content-list-cell-' + column.id}
                                                                    >
                                                                        <Typography noWrap
                                                                                    variant="iota"
                                                                                    color="inherit"
                                                                        >
                                                                            {_.get(node, column.property)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })}
                                            </UploadTransformComponent>
                                        )
                                )
                        }
                </Table>
            </div>
            <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    labels={{
                      labelRowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                      of: t('jcontent:label.pagination.of')
                    }}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
        </>
    );
};

const mapStateToProps = state => ({
    mode: state.jcontent.mode,
    previewSelection: state.jcontent.previewSelection,
    uilang: state.uilang,
    siteKey: state.site,
    path: state.jcontent.path,
    lang: state.language,
    params: state.jcontent.params,
    searchTerms: state.jcontent.params.searchTerms,
    searchContentType: state.jcontent.params.searchContentType,
    sql2SearchFrom: state.jcontent.params.sql2SearchFrom,
    sql2SearchWhere: state.jcontent.params.sql2SearchWhere,
    pagination: state.jcontent.pagination,
    sort: state.jcontent.sort,
    previewState: state.jcontent.previewState,
    selection: state.jcontent.selection
});

const mapDispatchToProps = dispatch => ({
    onPreviewSelect: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    setPath: (siteKey, path, mode, params) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path, params}));
    },
    setMode: mode => dispatch(cmSetMode(mode)),
    setCurrentPage: page => dispatch(cmSetPage(page)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize)),
    setSort: state => dispatch(cmSetSort(state)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: JContentConstants.mode.CONTENT_FOLDERS, params: params}));
    },
    switchSelection: path => dispatch(cmSwitchSelection(path)),
    addSelection: path => dispatch(cmAddSelection(path)),
    removeSelection: path => dispatch(cmRemoveSelection(path))
});

ContentListTable.propTypes = {
    addSelection: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    contentNotFound: PropTypes.bool,
    lang: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    mode: PropTypes.string.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    pagination: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    removeSelection: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired,
    selection: PropTypes.array.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired,
    setMode: PropTypes.func.isRequired,
    setSort: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    sort: PropTypes.object.isRequired,
    switchSelection: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    uilang: PropTypes.string.isRequired
};

export default compose(
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);
