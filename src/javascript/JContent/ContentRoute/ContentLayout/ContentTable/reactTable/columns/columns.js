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

export const columnWidths = {
    publicationStatus: '15px',
    selection: '50px',
    name: '300px',
    status: '115px',
    type: '180px',
    createdBy: '150px',
    lastModified: '220px',
    visibleActions: '60px'
};

export const allColumnData = [
    {
        id: 'publicationStatus',
        sortable: false,
        Header: '',
        Cell: CellPublicationStatus
    },
    {
        id: 'selection',
        sortable: false,
        Header: HeaderSelection,
        Cell: CellSelection
    },
    {
        id: 'name',
        accessor: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        Cell: CellName,
        Header: Header
    },
    {
        id: 'status',
        label: 'jcontent:label.contentManager.listColumns.status',
        sortable: false,
        Header: '',
        Cell: CellStatus
    },
    {
        id: 'type',
        accessor: 'type',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName',
        Cell: CellType,
        Header: Header
    },
    {
        id: 'createdBy',
        accessor: 'createdBy',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value',
        Header: Header,
        Cell: Cell
    },
    {
        id: 'lastModified',
        accessor: 'lastModified',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value',
        Cell: CellLastModified,
        Header: Header
    },
    {
        id: 'visibleActions',
        Header: '',
        Cell: CellVisibleActions
    }
];

export const reducedColumnData = allColumnData.filter(c => c.id !== 'type');
