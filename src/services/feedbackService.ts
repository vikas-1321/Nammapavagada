import { apiClient } from './apiClient';
import { FeedbackSubmissionPayload, FeedbackItem } from '../types/feedback';

export class FeedbackService {
  /**
   * Submit user feedback or contextual issue report
   */
  public async submitFeedback(payload: FeedbackSubmissionPayload): Promise<FeedbackItem> {
    // Basic sanitization
    const cleanPayload: FeedbackSubmissionPayload = {
      category: payload.category,
      message: payload.message.trim(),
      pagePath: payload.pagePath || (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.hash}` : '/'),
      name: payload.name ? payload.name.trim() : undefined,
      email: payload.email ? payload.email.trim() : undefined,
      relatedEntityType: payload.relatedEntityType ? payload.relatedEntityType.trim() : undefined,
      relatedEntityId: payload.relatedEntityId ? payload.relatedEntityId.trim() : undefined,
      relatedEntityName: payload.relatedEntityName ? payload.relatedEntityName.trim() : undefined,
      hp: payload.hp || undefined,
    };

    return await apiClient.post<FeedbackItem>('/feedback', cleanPayload);
  }
}

export const feedbackService = new FeedbackService();
