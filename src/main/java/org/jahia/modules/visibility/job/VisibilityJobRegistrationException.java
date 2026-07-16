package org.jahia.modules.visibility.job;

/**
 * Thrown when the {@link VisibilityActionPurgeJob} background job cannot be
 * registered or unregistered from the scheduler.
 *
 * @see VisibilityActionPurgeJobRegistration
 */
public class VisibilityJobRegistrationException extends Exception {

    public VisibilityJobRegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}