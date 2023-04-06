import {
    Cell,
    CellLastModified,
    CellName,
    CellPublicationStatus,
    CellSelection,
    CellStatus,
    CellType,
    CellVisibleActions
} from '../components/cells';
import {Header, HeaderSelection} from '../components/headers';
import {CellUsages} from '../components/cells/CellUsages';

export const allColumnData = [
    {
        id: 'publicationStatus',
        sortable: false,
        Header: '',
        Cell: CellPublicationStatus,
        width: '15px'
    },
    {
        id: 'selection',
        sortable: false,
        Header: HeaderSelection,
        Cell: CellSelection,
        width: '50px'
    },
    {
        id: 'name',
        accessor: 'displayName',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        Cell: CellName,
        Header: Header,
        width: '300px'
    },
    {
        id: 'status',
        label: 'jcontent:label.contentManager.listColumns.status',
        sortable: false,
        Header: '',
        Cell: CellStatus,
        width: '115px'
    },
    {
        id: 'type',
        accessor: 'primaryNodeType.displayName',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName',
        Cell: CellType,
        Header: Header,
        width: '180px'
    },
    {
        id: 'createdBy',
        accessor: 'createdBy.value',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value',
        Header: Header,
        Cell: Cell,
        width: '150px'

    },
    {
        id: 'lastModified',
        accessor: 'lastModified.value',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value',
        Cell: CellLastModified,
        Header: Header,
        width: '290px'
    },
    {
        id: 'visibleActions',
        Header: '',
        Cell: CellVisibleActions,
        width: '60px'
    },
    {
        id: 'usages',
        label: 'jcontent:label.contentManager.deleteAction.infoTable.headerLabel',
        Header: Header,
        Cell: CellUsages,
        sortable: false,
        width: '100px'
    }
];

export const mainColumnData = allColumnData.filter(c => !['usages'].includes(c.id));
export const reducedColumnData = allColumnData.filter(c => !['type', 'usages'].includes(c.id));
export const deletionInfoColumnData = allColumnData.filter(c => ['name', 'status', 'type', 'publicationStatus', 'usages'].includes(c.id)).map(c => ({...c, sortable: false}));
