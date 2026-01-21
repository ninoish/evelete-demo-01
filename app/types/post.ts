// 個人のアクティビティに紐づいた投稿ができる。
// 紐づかなくても、写真や動画の投稿だけもできる。
// アクティビティに関連した情報までサマった綺麗な内容を投稿
// 他人に共有する用途。Feedに表示。
// パフォーマンス重視。データがJSONで含まれている感じ。

export interface Post {
  id: string;
  activityId?: string;
  activity?: PersonalActivity;
  userId: string;
  user: User;
  body: string;
  media: Media[];
  postedAt: Date;
  postedBy: User;
}

export interface FeedItem {
  id: string;
  url?: string;
  datetime: string;
  category: string;
  sharingWith: string;
  username?: string;
  userImageUrl?: string;
  teamName?: string;
  teamImageUrl?: string;
  activityTitle?: string;
  activityContent?: string;
  activityDuration?: string;
  activityItems?: {
    name?: string;
    value?: string;
    diff?: string;
  }[];
  records?: {
    name?: string;
    value?: string;
    diff?: string;
  }[];
  eventName?: string;
  eventStyle?: string;
  teamActivityTitle?: string;
  teamActivityFeedType?: string;
  teamActivityContent?: string;
  teamActivityItems?: {
    category?: string;
    price?: number;
    datetime: string;
    place: string;
    attendanceStatus?: { going: number; notGoing: number; tbd: number };
  }[];
  teamResultPlace?: string;
  teamResultDate?: string;
  teamResultItems?: {
    id?: string;
    name?: string;
    isHome?: boolean;
    opponentTeamName?: string;
    ourScore?: number;
    theirScore?: number;
  }[];
  chartType?: string;
  chartValues?: { name: string; value: number }[];
  mediaUrl?: string;
  sports?: string[];
  likeCount?: number;
  commentCount?: number;
}
