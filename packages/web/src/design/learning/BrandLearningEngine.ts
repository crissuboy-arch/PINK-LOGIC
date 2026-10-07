import { DesignMemory, type DesignMemoryRecord } from '../memory/DesignMemory'
import { detectPatterns, detectPatternsForProject, type DetectedPattern } from './PatternRecognition'
import { trackPreference, buildAdaptiveProfile, type AdaptiveBrandProfile } from './PreferenceTracker'
import { processFeedback, analyzeLearning, type LearningInsight, type FeedbackAction } from './FeedbackLoop'

export interface BrandLearningResult {
  profile: AdaptiveBrandProfile
  patterns: DetectedPattern[]
  insights: LearningInsight[]
  stats: ReturnType<typeof DesignMemory.getStats>
}

export class BrandLearningEngine {
  learn(projectId: string): BrandLearningResult {
    const records = DesignMemory.getByProject(projectId)
    const allRecords = DesignMemory.getAll()
    const { profile, patterns, insights } = analyzeLearning(records, projectId)
    return {
      profile,
      patterns,
      insights,
      stats: DesignMemory.getStats(),
    }
  }

  recordApproval(
    projectId: string,
    designId: string,
    data: Omit<DesignMemoryRecord, 'id' | 'timestamp' | 'projectId' | 'designId' | 'accepted' | 'rejected'>,
  ): DesignMemoryRecord {
    return DesignMemory.record({
      ...data,
      projectId,
      designId,
      accepted: true,
      rejected: false,
    })
  }

  recordRejection(
    projectId: string,
    designId: string,
    data: Omit<DesignMemoryRecord, 'id' | 'timestamp' | 'projectId' | 'designId' | 'accepted' | 'rejected'>,
  ): DesignMemoryRecord {
    return DesignMemory.record({
      ...data,
      projectId,
      designId,
      accepted: false,
      rejected: true,
    })
  }

  getRecommendations(projectId: string): LearningInsight[] {
    const records = DesignMemory.getByProject(projectId)
    const { insights } = analyzeLearning(records, projectId)
    return insights.filter((i) => i.recommendation)
  }

  getAllPatterns(): DetectedPattern[] {
    return detectPatterns(DesignMemory.getAccepted())
  }

  getProfile(projectId: string): AdaptiveBrandProfile {
    return buildAdaptiveProfile(projectId, DesignMemory.getByProject(projectId))
  }

  processFeedback(projectId: string, action: FeedbackAction) {
    const records = DesignMemory.getByProject(projectId)
    return processFeedback(records, projectId, action)
  }
}

export const brandLearning = new BrandLearningEngine()
