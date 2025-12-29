'use client';

import { useState, useEffect } from 'react';
import {
  mockProfiles,
  mockSeasons,
  mockOrganization,
  mockDonations,
  mockSignatures,
  mockSchedules,
  mockTimelineEvents,
  mockNotices,
  mockPosts,
  mockMediaContent,
  mockLiveStatus,
  getLiveMembersWithInfo,
  getRankingData,
} from '@/lib/mock/data';
import { USE_MOCK_DATA } from '@/lib/config';
import type {
  Profile,
  Season,
  Organization,
  Donation,
  Signature,
  Schedule,
  TimelineEvent,
  Notice,
  Post,
  MediaContent,
  LiveStatus,
} from '@/types/database';

// Generic hook for fetching mock data with loading state
function useMockDataLoader<T>(data: T, delay: number = 300): { data: T | null; loading: boolean; error: null } {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: null }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const timer = setTimeout(() => {
      setState({ data, loading: false, error: null });
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay]);

  return state;
}

// Profiles
export function useMockProfiles() {
  return useMockDataLoader<Profile[]>(mockProfiles);
}

// Seasons
export function useMockSeasons() {
  return useMockDataLoader<Season[]>(mockSeasons);
}

export function useMockActiveSeason() {
  const activeSeason = mockSeasons.find(s => s.is_active) || null;
  return useMockDataLoader<Season | null>(activeSeason);
}

// Organization
export function useMockOrganization(unit?: 'excel' | 'crew') {
  const filtered = unit
    ? mockOrganization.filter(m => m.unit === unit)
    : mockOrganization;
  return useMockDataLoader<Organization[]>(filtered);
}

// Donations
export function useMockDonations(seasonId?: number) {
  const filtered = seasonId
    ? mockDonations.filter(d => d.season_id === seasonId)
    : mockDonations;
  return useMockDataLoader<Donation[]>(filtered);
}

// Ranking
export function useMockRanking(seasonId?: number) {
  const ranking = getRankingData(seasonId);
  return useMockDataLoader(ranking);
}

// Signatures
export function useMockSignatures(unit?: 'excel' | 'crew') {
  const filtered = unit
    ? mockSignatures.filter(s => s.unit === unit)
    : mockSignatures;
  return useMockDataLoader<Signature[]>(filtered);
}

// Schedules
export function useMockSchedules(month?: number, year?: number) {
  // For now, return all schedules. Can filter by month/year if needed.
  return useMockDataLoader<Schedule[]>(mockSchedules);
}

// Timeline Events
export function useMockTimelineEvents() {
  return useMockDataLoader<TimelineEvent[]>(mockTimelineEvents);
}

// Notices
export function useMockNotices(category?: 'official' | 'excel' | 'crew') {
  const filtered = category
    ? mockNotices.filter(n => n.category === category)
    : mockNotices;
  return useMockDataLoader<Notice[]>(filtered);
}

// Posts
export function useMockPosts(boardType?: 'free' | 'vip') {
  const filtered = boardType
    ? mockPosts.filter(p => p.board_type === boardType)
    : mockPosts;
  return useMockDataLoader<Post[]>(filtered);
}

// Media Content
export function useMockShorts() {
  const shorts = mockMediaContent.filter(m => m.content_type === 'shorts');
  return useMockDataLoader<MediaContent[]>(shorts);
}

export function useMockVODs() {
  const vods = mockMediaContent.filter(m => m.content_type === 'vod');
  return useMockDataLoader<MediaContent[]>(vods);
}

// Live Status
export function useMockLiveStatus() {
  return useMockDataLoader<LiveStatus[]>(mockLiveStatus);
}

export function useMockLiveMembers() {
  const liveMembers = getLiveMembersWithInfo();
  return useMockDataLoader(liveMembers);
}

// Export mock data check function
export function shouldUseMockData() {
  return USE_MOCK_DATA;
}
