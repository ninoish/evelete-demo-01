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

const feedItems: FeedItem[] = [
  {
    id: "",
    url: "/users/123/activities/123",
    sharingWith: "followers",
    datetime: "2時間前",
    userImageUrl: "/dummy/images/profile2.webp",
    username: "Yamada Taro",
    category: "activity",
    activityTitle: "トレーニング",
    activityContent: "疲れたー!!",
    activityItems: [
      { name: "腕立て伏せ", value: "20回 3セット" },
      { name: "腹筋", value: "30回 3セット" },
      {
        name: "バーベルスクワット",
        value: "80kg 10回, 90kg 8回, 100kg 7回",
      },
      { name: "背筋", value: "30回 3セット" },
    ],
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "昨日",
    sharingWith: "public",
    userImageUrl: "/dummy/images/profile3.jpg",
    username: "Goto Hitori",
    teamnName: "秀華高校 陸上部",
    category: "activity",
    sports: ["100m", "三段跳び"],
    activityTitle: "練習",
    activityDuration: "1h30m",
    mediaUrl: "/dummy/images/taf.jpg",
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "昨日",
    sharingWith: "public",
    userImageUrl: "/dummy/images/profile4.jpg",
    username: "Goto Hitori",
    category: "activity",
    sports: ["ランニング"],
    activityTitle: "吉祥寺まで走った",
    activityDuration: "3h20m",
    records: [
      {
        name: "距離",
        value: "13km",
      },
      {
        name: "消費カロリー",
        value: "1000kcal",
      },
      {
        name: "体重",
        value: "43.4kg",
        diff: "-0.4kg",
      },
    ],
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/03/01",
    sharingWith: "public",
    userImageUrl: "/dummy/images/profile5.jpg",
    username: "Mashle Burndead",
    teamImageUrl: "/dummy/images/profile6.jpg",
    teamName: "チームX",
    category: "activity",
    sports: ["バレーボール"],
    activityTitle: "練習",
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/02/29",
    sharingWith: "followers",
    userImageUrl: "/dummy/images/profile6.jpg",
    username: "さいたま",
    category: "record",
    sports: ["陸上100m"],
    records: [
      {
        name: "自己最高記録を更新しました",
        value: "10.88",
        diff: "-0.10",
      },
    ],
    chartType: "line",
    chartValues: [
      { name: "2023/04/02 あいうえ記念", value: 11.2 },
      { name: "2023/06/02 総体", value: 11.04 },
      { name: "2023/08/02 ABC予選", value: 10.98 },
      { name: "2023/12/02 わわわわ大会", value: 10.88 },
    ],
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/02/20",
    sharingWith: "followers",
    userImageUrl: "/dummy/images/profile7.jpg",
    username: "霜降り明星 せいや",
    category: "event",
    sports: ["ランニング"],
    eventName: "東京マラソン 2024",
    records: [
      {
        name: "初めてのフルマラソンです",
        value: "6時間24分24秒",
      },
    ],
    likeCount: 20000,
    commentCount: 4000,
  },
  {
    id: "",
    datetime: "2024/02/20",
    sharingWith: "followers",
    userImageUrl: "/dummy/images/profile3.jpg",
    username: "クロちゃん (安田大サーカス)",
    category: "event",
    sports: ["ランニング"],
    eventName: "東京マラソン 2024",
    eventDivisionName: "男子一般フルマラソン",
    records: [
      {
        name: "3番目に早いタイムです!!",
        value: "4時間2分45秒",
      },
    ],
    likeCount: 1000,
    commentCount: 40,
  },

  {
    id: "",
    datetime: "2024/02/29",
    sharingWith: "followers",
    userImageUrl: "/dummy/images/profile4.jpg",
    username: "さいたま",
    category: "record",
    sports: ["陸上100m"],
    records: [
      {
        name: "自己最高記録を更新しました",
        value: "10.88",
        diff: "-0.10",
      },
    ],
    chartType: "line",
    chartValues: [
      { name: "2023/04/02 あいうえ記念", value: 11.2 },
      { name: "2023/06/02 総体", value: 11.04 },
      { name: "2023/08/02 ABC予選", value: 10.98 },
      { name: "2023/12/02 わわわわ大会", value: 10.88 },
    ],
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/02/29",
    sharingWith: "followers",
    userImageUrl: "/dummy/images/profile5.jpg",
    username: "さいたま",
    category: "record",
    records: [
      {
        name: "体重",
        value: "80.1",
        diff: "-0.7",
      },
    ],
    chartType: "line",
    chartValues: [
      { name: "2023/09/22", value: 84.2 },
      { name: "2023/10/22", value: 81.2 },
      { name: "2023/11/22", value: 80.2 },
      { name: "2023/12/22", value: 80.1 },
    ],
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/02/22",
    sharingWith: "followers",
    teamImageUrl: "/dummy/images/profile6.jpg",
    teamName: "もいもいズ",
    category: "team-activity",
    sports: ["バレーボール"],
    teamActivityFeedType: "ゲスト参加募集開始",
    teamActivityTitle: "練習",
    teamActivityItems: [
      {
        price: 500,
        datetime: "",
        place: "",
      },
    ],
    likeCount: 2,
    commentCount: 5,
  },
  {
    id: "",
    datetime: "2024/02/22",
    sharingWith: "followers",
    teamImageUrl: "/dummy/images/profile6.jpg",
    teamName: "Nine balls",
    category: "team-activity",
    teamActivityFeedType: "練習動画公開",
    teamActivityTitle: "練習動画を公開しました",
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/02/21",
    sharingWith: "members",
    teamImageUrl: "/dummy/images/profile6.jpg",
    teamName: "わいわいず",
    userImageUrl: "/dummy/images/profile6.jpg",
    username: "Vince Carter (管理者)",
    category: "team-activity",
    sports: ["バスケットボール"],
    teamActivityFeedType: "アクティビティ追加",
    teamActivityTitle: "アクティビティを追加しました",
    teamActivityContent: "3月の予定をアップしました!! 大会に向けて頑張ろう",
    teamActivityItems: [
      {
        category: "練習",
        datetime: "2024/03/01 16:00 - 19:00",
        place: "台東区立第四小学校",
        attendanceStatus: { going: 4, notGoing: 2, tbd: 1 },
      },
      {
        category: "大会",
        datetime: "2024/03/07 12:00 - ",
        place: "台東区立体育館",
        attendanceStatus: { going: 4, notGoing: 2, tbd: 1 },
      },
    ],

    likeCount: 2,
    commentCount: 0,
  },
  {
    id: "",
    datetime: "2024/03/21",
    sharingWith: "followers",
    teamImageUrl: "/dummy/images/profile4.jpg",
    teamName: "Wonders",
    category: "team-result",
    sports: ["バスケットボール"],
    eventName: "第28回 杉並区夏季大会 予選1日目",
    eventStyle: "tournament",
    teamResultPlace: "杉並区体育館",
    teamResultDate: "2024/03/21",
    teamResultItems: [
      {
        id: "",
        name: "1回戦",
        isHome: true,
        opponentTeamName: "永福町ファイターズ",
        result: "w",
        ourScore: 74,
        theirScore: 68,
      },
      {
        name: "2回戦",
        isHome: true,
        opponentTeamName: "ザーボンズ",
        result: "l",
        ourScore: 81,
        theirScore: 99,
      },
    ],
    likeCount: 24,
    commentCount: 5,
  },
].map((f, indx) => {
  f.id = `feedItemId-${indx}`;
  return f;
});

export default feedItems;
