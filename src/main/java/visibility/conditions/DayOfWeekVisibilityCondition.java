package visibility.conditions;

import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.visibility.BaseVisibilityConditionRule;
import org.jahia.services.visibility.VisibilityConditionRule;
import org.jahia.utils.DateUtils;
import org.jahia.utils.i18n.Messages;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Defines the visibility condition, based on the day of the week. The content is considered visible if the current day of the week is among
 * the selected days.
 *
 * @author Sergiy Shyrkov
 */
@Component(service = {VisibilityConditionRule.class}, immediate = true)
public class DayOfWeekVisibilityCondition extends BaseVisibilityConditionRule {

    private static final Logger LOGGER = LoggerFactory.getLogger(DayOfWeekVisibilityCondition.class);

    public String getGWTDisplayTemplate(Locale locale) {
        return Messages.get(ServicesRegistry.getInstance().getJahiaTemplateManagerService().getTemplatePackage("Jahia Visibility"), "label.dayOfWeekCondition.xtemplate", locale);
    }

    public boolean matches(JCRNodeWrapper node) {
        boolean visible = true;
        Set<Integer> days = null;
        try {
            Value[] values = node.getProperty("dayOfWeek").getValues();
            days = new HashSet<>(7);
            for (Value value : values) {
                Integer dow = DateUtils.getDayOfWeek(value.getString());
                if (dow != null) {
                    days.add(dow);
                } else {
                    LOGGER.warn("Unknown day of week '{}' in a visibility condition for node {}. Skipping.", value.getString(), node.getPath());
                }
            }
        } catch (PathNotFoundException e) {
            LOGGER.debug("dayOfWeek is not defined for this condition on the node {}", node.getPath());
        } catch (RepositoryException e) {
            LOGGER.error("Error reading day of the week settings for the visibility condition node {} Cause: {}", node.getPath(), e.getMessage(), e);
        }

        if (days != null && !days.isEmpty()) {
            Calendar calendar = null;
            try {
                calendar = node.getSession().getPreviewDate();
            } catch (RepositoryException e) {
                // ignore it
            }
            if (calendar == null) {
                calendar = Calendar.getInstance();
            }

            visible = days.contains(calendar.get(Calendar.DAY_OF_WEEK));
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("Day of the week condition with days {} and node {} evaluated to {}", days, node.getPath(), visible);
            }
        }

        return visible;
    }

    @Override
    public String getAssociatedNodeType() {
        return "jnt:dayOfWeekCondition";
    }
}
