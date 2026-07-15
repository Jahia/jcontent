import {actionTargetAssignments} from './JContent.assignActionAndMenuTargets';

describe('accordionContentActions', () => {
    it('should include export, exportPage and import', () => {
        expect(actionTargetAssignments.accordionContentActions).toContain('export');
        expect(actionTargetAssignments.accordionContentActions).toContain('exportPage');
        expect(actionTargetAssignments.accordionContentActions).toContain('import');
    });
});
