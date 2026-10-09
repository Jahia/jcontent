import {PickerEditorialLinkQueryHandler} from './PickerEditorialLinkQueryHandler';

const options = viewType => ({
    path: '/sites/digitall',
    openPaths: [],
    sort: {orderBy: ''},
    tableView: {viewMode: 'structuredView', viewType}
});

describe('PickerEditorialLinkQueryHandler', () => {
    it('should open in the tree the types it declares for the view', () => {
        expect(PickerEditorialLinkQueryHandler.getTreeParams(options('pages')).openableTypes)
            .toEqual(PickerEditorialLinkQueryHandler.getOpenableTypes('pages'));
        expect(PickerEditorialLinkQueryHandler.getTreeParams(options('content')).openableTypes)
            .toEqual(PickerEditorialLinkQueryHandler.getOpenableTypes('content'));
    });

    it('should open in the tree the types of a handler that overrides them', () => {
        const queryHandler = {
            ...PickerEditorialLinkQueryHandler,
            getOpenableTypes: viewType => [...PickerEditorialLinkQueryHandler.getOpenableTypes(viewType), 'jmix:visibleInPagesTree']
        };

        expect(queryHandler.getTreeParams(options('pages')).openableTypes).toContain('jmix:visibleInPagesTree');
    });
});
