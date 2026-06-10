package org.jahia.modules.visibility.job;

import org.jahia.exceptions.JahiaRuntimeException;
import org.jahia.services.content.rules.OrphanedActionPurgeJob;
import org.jahia.services.scheduler.BackgroundJob;
import org.jahia.services.scheduler.SchedulerService;
import org.jahia.settings.SettingsBean;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.quartz.*;

import java.text.ParseException;
import java.util.Set;

/**
 * Background task that purges orphaned visibility actions (in case the corresponding node was deleted).
 *
 * @author Sergiy Shyrkov
 * @author Jerome Blanchard
 */
@Component(immediate = true)
public class VisibilityActionPurgeJob extends OrphanedActionPurgeJob {

    private static final String JOB_DESCRIPTION = "Cancels (unschedules) and removes orphaned visibility action jobs in case the corresponding node is no longer present";
    private static final String JOB_GROUP = "Maintenance";
    private static final String CRON_TRIGGER_NAME = "VisibilityActionPurgeJobTrigger";
    private static final String CRON_EXPRESSION = "0 5 * * * ?";
    private static final String JOB_GROUP_NAMES_KEY = "jobGroupNames";
    private static final Set<String> JOB_GROUP_NAMES = Set.of("ActionJob.startDateVisibilityAction", "ActionJob.endDateVisibilityAction",
                    "ActionJob.startDayOfWeekVisibilityAction", "ActionJob.endDayOfWeekVisibilityAction",
                    "ActionJob.startTimeOfDayVisibilityAction", "ActionJob.endTimeOfDayVisibilityAction");

    private SchedulerService schedulerService;
    private JobDetail jobDetail;

    @Activate
    public void start() {
        jobDetail = BackgroundJob.createJahiaJob(JOB_DESCRIPTION, VisibilityActionPurgeJob.class);
        jobDetail.setGroup(JOB_GROUP);
        jobDetail.getJobDataMap().put(JOB_GROUP_NAMES_KEY, JOB_GROUP_NAMES);
        try {
            if (schedulerService.getAllJobs(jobDetail.getGroup()).isEmpty() && SettingsBean.getInstance().isProcessingServer()) {
                Trigger trigger = new CronTrigger(CRON_TRIGGER_NAME, jobDetail.getGroup(), CRON_EXPRESSION);
                schedulerService.getScheduler().scheduleJob(jobDetail, trigger);
            }
        } catch (SchedulerException | ParseException e) {
            throw new JahiaRuntimeException(e);
        }
    }

    @Deactivate
    public void stop() {
        try {
            if (!schedulerService.getAllJobs(jobDetail.getGroup()).isEmpty() && SettingsBean.getInstance().isProcessingServer()) {
                schedulerService.getScheduler().deleteJob(jobDetail.getName(), jobDetail.getGroup());
            }
        } catch (SchedulerException e) {
            throw new JahiaRuntimeException(e);
        }
    }

    @Reference
    public void setSchedulerService(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

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
