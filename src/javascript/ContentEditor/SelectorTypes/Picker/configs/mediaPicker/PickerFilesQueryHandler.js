import {FilesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export const PickerFilesQueryHandler = {
    ...FilesQueryHandler,

    getQueryVariables: options => ({
        ...FilesQueryHandler.getQueryVariables(options),
        fieldFilter: {
            multi: options.tableDisplayFilter ? 'ANY' : 'NONE',
            filters: (options.tableDisplayFilter ? options.tableDisplayFilter : [])
        }
    }),

    getFragments: () => [...FilesQueryHandler.getFragments()]
};
