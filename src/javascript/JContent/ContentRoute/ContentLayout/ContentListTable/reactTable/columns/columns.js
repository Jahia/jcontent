import {Cell, CellLastModified, CellPublicationStatus, CellSelection, CellVisibleActions, CellName, CellStatus, CellType} from '../components/cells';
import {Header, HeaderSelection} from '../components/headers';

export const allColumnData = [
    {
        id: 'publicationStatus',
        sortable: false,
        Header: '',
        width: 50,
        Cell: CellPublicationStatus
    },
    {
        id: 'selection',
        sortable: false,
        width: 50,
        Header: HeaderSelection,
        Cell: CellSelection
    },
    {
        id: 'name',
        accessor: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        width: 300,
        Cell: CellName,
        Header: Header
    },
    {
        id: 'status',
        label: 'jcontent:label.contentManager.listColumns.status',
        sortable: false,
        width: 100,
        Header: Header,
        Cell: CellStatus
    },
    {
        id: 'type',
        accessor: 'type',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName',
        width: 150,
        Cell: CellType,
        Header: Header
    },
    {
        id: 'createdBy',
        accessor: 'createdBy',
        Header: Header,
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        width: 100,
        property: 'createdBy.value',
        Cell: Cell
    },
    {
        id: 'lastModified',
        accessor: 'lastModified',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value',
        width: 200,
        Cell: CellLastModified,
        Header: Header
    },
    {
        id: 'visibleActions',
        Header: '',
        width: 40,
        Cell: CellVisibleActions
    }
];

export const reducedColumnData = allColumnData.filter(c => c.id !== 'type');
