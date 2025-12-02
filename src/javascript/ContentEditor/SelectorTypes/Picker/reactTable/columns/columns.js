import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {CellVisibleActions} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/CellVisibleActions';
import {FileSizeCell} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/FileSizeCell';
import {RelPathCell} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/RelPathCell';
import {LocationCell} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns/LocationCell';
import {CellUsages} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable/components/cells/CellUsages';
import {Header} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';

export const allColumnData = [
    {
        id: 'publicationStatus',
        sortable: false,
        Header: '',
        Cell: reactTable.CellPublicationStatus,
        width: '15px'
    },
    {
        id: 'selection',
        sortable: false,
        Header: reactTable.HeaderSelection,
        Cell: reactTable.CellSelection,
        width: '50px'
    },
    {
        id: 'name',
        accessor: 'displayName',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        Cell: reactTable.CellName,
        Header: reactTable.Header,
        width: '300px'
    },
    {
        id: 'nameBigIcon',
        accessor: 'displayName',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        Cell: reactTable.CellNameBigIcon,
        Header: reactTable.Header,
        width: '300px'
    },
    {
        id: 'type',
        accessor: 'primaryNodeType.displayName',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName',
        Cell: reactTable.CellType,
        Header: reactTable.Header,
        width: '180px'
    },
    {
        id: 'lastModified',
        accessor: 'lastModified.value',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value',
        Cell: reactTable.CellLastModified,
        Header: reactTable.Header,
        width: '290px'
    },
    {
        id: 'createdBy',
        accessor: 'createdBy.value',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value',
        Cell: reactTable.Cell
    },
    {
        id: 'fileSize',
        Cell: FileSizeCell,
        label: 'jcontent:label.contentManager.listColumns.size',
        sortable: true,
        accessor: 'content.data.size',
        property: 'content.data.size',
        Header: reactTable.Header,
        width: '120px'
    },
    {
        id: 'relPath',
        Cell: RelPathCell
    },
    {
        id: 'location',
        Cell: LocationCell,
        sortable: true,
        property: 'path',
        label: 'jcontent:label.contentEditor.edit.advancedOption.usages.path',
        Header: reactTable.Header,
        width: '300px'
    },
    {
        id: 'status',
        label: 'jcontent:label.contentManager.listColumns.status',
        sortable: false,
        Header: '',
        Cell: reactTable.CellStatus
    },
    {
        id: 'visibleActions',
        Header: '',
        Cell: CellVisibleActions,
        width: '60px',
        sortable: false
    },
    {
        id: 'usages',
        accessor: 'usagesCount',
        label: 'jcontent:label.contentManager.listColumns.usages',
        sortable: true,
        property: 'usagesCount',
        Cell: CellUsages,
        Header: Header,
        width: '120px'
    }
];
