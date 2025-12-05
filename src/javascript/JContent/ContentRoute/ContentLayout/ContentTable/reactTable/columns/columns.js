import {
    Cell,
    CellLastModified,
    CellName,
    CellPublicationStatus,
    CellSelection,
    CellStatus,
    CellType,
    CellVisibleActions,
    CellFileSize, CellNameBigIcon
} from '../components/cells';
import {Header, HeaderSelection} from '../components/headers';
import {CellUsages} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable/components/cells/CellUsages';

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
    width: '56px'
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
export const nameBigIcon = {
    id: 'nameBigIcon',
    accessor: 'displayName',
    label: 'jcontent:label.contentManager.listColumns.name',
    sortable: true,
    property: 'displayName',
    Cell: CellNameBigIcon,
    Header: Header,
    width: '300px'
};
export const status = {
    id: 'status',
    label: 'jcontent:label.contentManager.listColumns.status',
    sortable: false,
    Header: '',
    Cell: CellStatus,
    width: '200px'
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
export const fileSize = {
    id: 'fileSize',
    accessor: 'content.data.size',
    property: 'content.data.size',
    label: 'jcontent:label.contentManager.listColumns.size',
    sortable: true,
    Cell: CellFileSize,
    Header: Header,
    width: '120px'
};

const mediaType = {
    ...type,
    property: 'content.mimeType.value'
};

export const usages = {
    id: 'usages',
    accessor: 'usagesCount',
    label: 'jcontent:label.contentManager.listColumns.usages',
    sortable: true,
    property: 'usagesCount',
    Cell: CellUsages,
    Header: Header,
    width: '145px'
};

export const mainColumnData = [publicationStatus, selection, name, status, type, createdBy, lastModified, visibleActions];
export const mediaColumnData = [publicationStatus, selection, nameBigIcon, status, usages, fileSize, mediaType, createdBy, lastModified, visibleActions];
export const reducedColumnData = [publicationStatus, selection, name, status, createdBy, lastModified, visibleActions];
