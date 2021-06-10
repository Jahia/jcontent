import {Cell, CellLastModified, CellPublicationStatus, CellSelection, CellVisibleActions, CellName, CellStatus, CellType} from '../components/cells';
import {Header, HeaderSelection} from '../components/headers';

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
        Header: Header,
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
        Header: Header,
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value',
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
