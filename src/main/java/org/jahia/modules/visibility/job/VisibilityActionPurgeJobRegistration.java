package org.jahia.modules.visibility.job;

import org.jahia.services.scheduler.SchedulerService;
import org.jahia.settings.SettingsBean;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.quartz.CronTrigger;
import org.quartz.JobDetail;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.ParseException;
import java.util.Set;

/**
 * Registration of the {@link VisibilityActionPurgeJob} background job via OSGi.
 * <p>
 * <b>NB:</b> This component only handles the registration of the job; the execution itself
 * (in {@link VisibilityActionPurgeJob}) does not have access to OSGi dependency injection.
 *
 * @see VisibilityActionPurgeJob
 */
@Component(immediate = true)
public class VisibilityActionPurgeJobRegistration {

    private static final Logger logger = LoggerFactory.getLogger(VisibilityActionPurgeJobRegistration.class);

    private static final String GROUP_NAME = "Maintenance";
    private static final String JOB_NAME = "visibilityActionPurgeJob";
    private static final String JOB_DESCRIPTION = "Cancels (unschedules) and removes orphaned visibility action jobs in case the corresponding node is no longer present";
    private static final String CRON_TRIGGER_NAME = "VisibilityActionPurgeJobTrigger";
    private static final String CRON_EXPRESSION = "0 5 * * * ?";
    private static final String JOB_GROUP_NAMES_KEY = "jobGroupNames";
    private static final Set<String> JOB_GROUP_NAMES = Set.of("ActionJob.startDateVisibilityAction", "ActionJob.endDateVisibilityAction",
                    "ActionJob.startDayOfWeekVisibilityAction", "ActionJob.endDayOfWeekVisibilityAction",
                    "ActionJob.startTimeOfDayVisibilityAction", "ActionJob.endTimeOfDayVisibilityAction");

    private SchedulerService schedulerService;
    private JobDetail jobDetail;

    @Activate
    public void start() throws VisibilityJobRegistrationException {
        // Fixed name -> can be retrieved after restart
        jobDetail = new JobDetail(JOB_NAME, GROUP_NAME, VisibilityActionPurgeJob.class, false, true, false);
        jobDetail.setDescription(JOB_DESCRIPTION);
        jobDetail.getJobDataMap().put(JOB_GROUP_NAMES_KEY, JOB_GROUP_NAMES);
        if (SettingsBean.getInstance().isProcessingServer()) {
            try {
                // Delete the old job at startup if exists
                schedulerService.getScheduler().deleteJob(JOB_NAME, GROUP_NAME);
                Trigger trigger = new CronTrigger(CRON_TRIGGER_NAME, jobDetail.getGroup(), CRON_EXPRESSION);
                schedulerService.getScheduler().scheduleJob(jobDetail, trigger);
                logger.info("Visibility action purge {} job registered", jobDetail.getName());
            } catch (SchedulerException | ParseException e) {
                throw new VisibilityJobRegistrationException("Unable to register the visibility action purge job", e);
            }
        }
    }

    @Deactivate
    public void stop() throws VisibilityJobRegistrationException {
        // If Jahia is shutting down, the scheduler is already stopped -> we do nothing.
        // The job will be cleaned at the next startup. It could be found with the fixed name
        if (schedulerService.getScheduler() == null) {
            return;
        }
        try {
            if (!schedulerService.getAllJobs(jobDetail.getGroup()).isEmpty() && SettingsBean.getInstance().isProcessingServer()) {
                schedulerService.getScheduler().deleteJob(jobDetail.getName(), jobDetail.getGroup());
                logger.info("Visibility action purge {} job unregistered", jobDetail.getName());
            }
        } catch (SchedulerException e) {
            throw new VisibilityJobRegistrationException("Unable to unregister the visibility action purge job", e);
        }
    }

    @Reference
    public void setSchedulerService(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

}