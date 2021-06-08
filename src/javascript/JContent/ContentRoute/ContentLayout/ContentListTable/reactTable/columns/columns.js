import {Cell, CellLastModified, CellPublicationStatus, CellSelection, CellVisibleActions} from '../components/cells';
import {Header, HeaderSelection} from '../components/headers';

export const allColumnData = [
    {
        id: 'publicationStatus',
        Header: '',
        Cell: CellPublicationStatus
    },
    {
        id: 'selection',
        Header: HeaderSelection,
        Cell: CellSelection
    },
    {
        id: 'name',
        accessor: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName',
        Cell: Cell,
        Header: Header
    },
    // {
    //     id: 'wip',
    //     label: '',
    //     sortable: false,
    //     property: ''
    // },
    // {
    //     id: 'lock',
    //     label: '',
    //     sortable: false,
    //     property: ''
    // },
    {
        id: 'type',
        accessor: 'type',
        label: 'jcontent:label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName',
        Cell: Cell,
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
