package org.jahia.modules.visibility.job;

import org.jahia.services.content.rules.OrphanedActionPurgeJob;
import org.quartz.JobDataMap;

import java.util.Set;

/**
 * Background task that purges orphaned visibility actions (in case the corresponding node was deleted).
 * <p>
 * <b>NB:</b> This job is instantiated directly by Quartz, so OSGi dependency injection is not available here.
 * Its scheduling (and unscheduling) is handled by the OSGi component {@link VisibilityActionPurgeJobRegistration}.
 *
 * @author Sergiy Shyrkov
 * @author Jerome Blanchard
 * @see VisibilityActionPurgeJobRegistration
 */
public class VisibilityActionPurgeJob extends OrphanedActionPurgeJob {

    @Override
    protected Set<String> getJobGroupNames(JobDataMap data) {
        Object val = data.get("visibilityJobGroupNames");
        if (val != null) {
            return val instanceof Set<?> ? (Set<String>) val : null;
        } else {
            return super.getJobGroupNames(data);
        }
    }
}
