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

export const publicationStatus = {
    id: 'publicationStatus',
    sortable: false,
    Header: '',
    Cell: CellPublicationStatus,
    width: '15px'
};
export const selection = {
    id: 'selection',
    sortable: false,
    Header: HeaderSelection,
    Cell: CellSelection,
    width: '50px'
};
export const name = {
    id: 'name',
    accessor: 'displayName',
    label: 'jcontent:label.contentManager.listColumns.name',
    sortable: true,
    property: 'displayName',
    Cell: CellName,
    Header: Header,
    width: '300px'
};
export const status = {
    id: 'status',
    label: 'jcontent:label.contentManager.listColumns.status',
    sortable: false,
    Header: '',
    Cell: CellStatus,
    width: '115px'
};
export const type = {
    id: 'type',
    accessor: 'primaryNodeType.displayName',
    label: 'jcontent:label.contentManager.listColumns.type',
    sortable: true,
    property: 'primaryNodeType.displayName',
    Cell: CellType,
    Header: Header,
    width: '180px'
};
export const createdBy = {
    id: 'createdBy',
    accessor: 'createdBy.value',
    label: 'jcontent:label.contentManager.listColumns.createdBy',
    sortable: true,
    property: 'createdBy.value',
    Header: Header,
    Cell: Cell,
    width: '150px'

};
export const lastModified = {
    id: 'lastModified',
    accessor: 'lastModified.value',
    label: 'jcontent:label.contentManager.listColumns.lastModified',
    sortable: true,
    property: 'lastModified.value',
    Cell: CellLastModified,
    Header: Header,
    width: '290px'
};
export const visibleActions = {
    id: 'visibleActions',
    Header: '',
    Cell: CellVisibleActions,
    width: '60px'
};
export const usages = {
    id: 'usages',
    label: 'jcontent:label.contentManager.deleteAction.infoTable.headerLabel',
    Header: Header,
    Cell: CellUsages,
    sortable: false,
    width: '100px'
};

export const mainColumnData = [publicationStatus, selection, name, status, type, createdBy, lastModified, visibleActions];
export const reducedColumnData = [publicationStatus, selection, name, status, createdBy, lastModified, visibleActions];
export const deletionInfoColumnData = [publicationStatus, name, status, type, usages];
