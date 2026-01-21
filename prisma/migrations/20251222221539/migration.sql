-- CreateEnum
CREATE TYPE "SportRecordValue" AS ENUM ('Distance', 'Weight', 'Time', 'Score');

-- CreateEnum
CREATE TYPE "SportResultCriteria" AS ENUM ('Point', 'Judgement', 'Record', 'Survival', 'None');

-- CreateEnum
CREATE TYPE "SportGameEndFactor" AS ENUM ('Time', 'Count', 'Score', 'Survival');

-- CreateEnum
CREATE TYPE "SportAttributeType" AS ENUM ('Gender', 'NumberOfPlayers', 'Size', 'Rule', 'Experience', 'GroupCategory');

-- CreateEnum
CREATE TYPE "BiologicalGender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "FriendRequestState" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "UserFollowRequestState" AS ENUM ('APPROVED', 'PENDING', 'DENIED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UserPlaceType" AS ENUM ('Living', 'Working', 'Visiting', 'Favorite');

-- CreateEnum
CREATE TYPE "TeamJoinRequestState" AS ENUM ('APPROVED', 'PENDING', 'DENIED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TeamActivityVisibility" AS ENUM ('ADMINS', 'TEAM_GROUP', 'TEAM_INTERNAL', 'TEAM_FOLLOWERS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TeamActivityStatus" AS ENUM ('PUBLIC', 'CANCELED');

-- CreateEnum
CREATE TYPE "TeamActivityType" AS ENUM ('COMPETITION', 'RECORD', 'RESULT', 'PRACTICE', 'PRACTICAL_PRACTICE', 'EVENT');

-- CreateEnum
CREATE TYPE "TeamActivityPaymentMethod" AS ENUM ('FACE_TO_FACE');

-- CreateEnum
CREATE TYPE "TeamActivityParticipationRequirementType" AS ENUM ('Gender', 'MinAge', 'MaxAge', 'PlayerPosition', 'MinSchoolGrade', 'MaxSchoolGrade', 'MinPlayerExperience', 'MaxPlayerExperience', 'Qualification', 'MinRank', 'MaxRank', 'LivingArea', 'WorkingArea', 'AffiliationCategory');

-- CreateEnum
CREATE TYPE "TeamActivityAttendanceResponseType" AS ENUM ('GOING', 'NOT_GOING', 'MAYBE', 'CANCELED__USER_REASON', 'CANCELED__TEAM_REASON');

-- CreateEnum
CREATE TYPE "TeamChatChannelType" AS ENUM ('TEAM', 'TEAM_GROUP', 'TEAM_ACTIVITY', 'TEAM_ACTIVITY_INCLUDING_GUESTS', 'TEAM_MEMBER_INVITATION', 'TEAM_ACTIVITY_INVITATION', 'INSTANT_TEAM');

-- CreateEnum
CREATE TYPE "PersonalActivityStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'DELETED');

-- CreateEnum
CREATE TYPE "PersonalActivityVisibility" AS ENUM ('PRIVATE', 'FOLLOWERS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PersonalActivityType" AS ENUM ('WORKOUT', 'BODY_DATA', 'RECORD', 'RESULT', 'PRACTICE', 'PRACTICAL_PRACTICE', 'DROPIN', 'CLINIC', 'ENJOY', 'REHAB', 'TEAM_ACTIVITY', 'TEAM_PRACTICE', 'TEAM_EVENT', 'COMPETITION', 'RECORD_TRIAL');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KILOGRAM', 'YARD_POUND');

-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('METER', 'YARD_MILE');

-- CreateEnum
CREATE TYPE "EntryTypeEnum" AS ENUM ('Personal', 'Team');

-- CreateEnum
CREATE TYPE "EventEntryRequirementType" AS ENUM ('Gender', 'MinAge', 'MaxAge', 'MinSchoolGrade', 'MaxSchoolGrade', 'MinPlayerExperience', 'MaxPlayerExperience', 'Qualification', 'MinPoint', 'MaxPoint', 'MinRank', 'MaxRank', 'LivingArea', 'WorkingArea', 'AffiliationCategory');

-- CreateEnum
CREATE TYPE "RecordCriteria" AS ENUM ('Distance', 'Height', 'Speed', 'Weight', 'TimeLongerIsBetter', 'TimeShorterIsBetter', 'Time', 'CountMoreIsBetter', 'CountLessIsBetter', 'PointScore', 'Index', 'Percentage');

-- CreateEnum
CREATE TYPE "RecordUnitType" AS ENUM ('Centimeter', 'Meter', 'Kilometer', 'KmPerHour', 'KgAndCount', 'Kilogram', 'Time', 'Millisecond', 'None', 'Point', 'Times', 'Balls', 'Shots', 'Percent');

-- CreateEnum
CREATE TYPE "UserPostVisibility" AS ENUM ('PRIVATE', 'CONNECTIONS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TeamPostVisibility" AS ENUM ('INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "UserFocusValueType" AS ENUM ('LatestValue', 'BestValue', 'AverageValue', 'AverageValueInYear', 'TimesDone', 'CompoundBest', 'CompoundAverage', 'CompoundLatest');

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "alias" TEXT,
    "emoji" TEXT NOT NULL,
    "name_ja_JP" TEXT NOT NULL,
    "name_en_US" TEXT NOT NULL,
    "alias_ja_JP" TEXT NOT NULL,
    "alias_en_US" TEXT NOT NULL,
    "isUserPref" BOOLEAN NOT NULL,
    "isTeamPref" BOOLEAN NOT NULL,
    "isUserActivity" BOOLEAN NOT NULL,
    "isTeamActivity" BOOLEAN NOT NULL,
    "isOrgPref" BOOLEAN NOT NULL,
    "isPersonalEvent" BOOLEAN NOT NULL,
    "isPersonalEventEntryPoint" BOOLEAN NOT NULL,
    "isTeamEvent" BOOLEAN NOT NULL,
    "isTeamEventEntryPoint" BOOLEAN NOT NULL,
    "isEventResult" BOOLEAN NOT NULL,
    "isPersonalRecord" BOOLEAN NOT NULL,
    "resultCriteria" "SportResultCriteria"[],
    "gameEndFactor" "SportGameEndFactor"[],
    "recordValue" "SportRecordValue",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportAttribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "alias" TEXT,
    "attributeType" "SportAttributeType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "languages" TEXT[],
    "zoom" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" DOUBLE PRECISION,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" DOUBLE PRECISION,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "nameLanguage" TEXT,
    "code" TEXT,
    "type" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "zoom" DOUBLE PRECISION,
    "countryId" TEXT,
    "stateId" TEXT,
    "cityId" TEXT,
    "googleMapsPlaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointOfInterest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLanguage" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoom" DOUBLE PRECISION,
    "countryId" TEXT,
    "stateId" TEXT,
    "cityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointOfInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SportCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportPopularityByCountry" (
    "id" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "ageRange" INTEGER,
    "gender" "BiologicalGender",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportPopularityByCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'Credentials',
    "providerUserId" TEXT,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "coverImageUrl" TEXT,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "hasVerifiedEmail" BOOLEAN NOT NULL DEFAULT false,
    "hasSetupMinimumPrefs" BOOLEAN NOT NULL DEFAULT false,
    "birthday" TIMESTAMP(3),
    "biologicalGender" "BiologicalGender",
    "prefIsPrivateAccount" BOOLEAN NOT NULL DEFAULT false,
    "prefWeightUnit" "WeightUnit" NOT NULL DEFAULT 'KILOGRAM',
    "prefDistanceUnit" "DistanceUnit" NOT NULL DEFAULT 'METER',
    "prefDefaultActivityVisibility" "PersonalActivityVisibility" NOT NULL DEFAULT 'FOLLOWERS',
    "prefSlugLastUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAffiliationCategory" (
    "userId" TEXT NOT NULL,
    "affiliationCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAffiliationCategory_pkey" PRIMARY KEY ("userId","affiliationCategoryId")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "FriendRequestState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "cooldownUntil" TIMESTAMP(3),

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "UserFollowRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "requestStatus" "UserFollowRequestState" NOT NULL,
    "requestSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusChangedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFollowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSport" (
    "userId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSport_pkey" PRIMARY KEY ("userId","sportId")
);

-- CreateTable
CREATE TABLE "UserSportAttribute" (
    "userId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userSportUserId" TEXT,
    "userSportSportId" TEXT,

    CONSTRAINT "UserSportAttribute_pkey" PRIMARY KEY ("userId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "UserPlace" (
    "userId" TEXT NOT NULL,
    "placeType" "UserPlaceType" NOT NULL,
    "placeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlace_pkey" PRIMARY KEY ("userId","placeId")
);

-- CreateTable
CREATE TABLE "AffiliationCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "locale" TEXT,
    "sportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPlace" (
    "teamId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "placeType" TEXT NOT NULL,
    "specificPlace" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPlace_pkey" PRIMARY KEY ("teamId","placeId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "themeColor" TEXT,
    "establishedAt" TIMESTAMP(3),
    "canRequestToJoin" BOOLEAN NOT NULL,
    "canSearch" BOOLEAN NOT NULL,
    "canViewActivities" BOOLEAN NOT NULL,
    "canViewMembers" BOOLEAN NOT NULL,
    "acceptMembersAgeUnder18" BOOLEAN NOT NULL DEFAULT false,
    "minMemberSkillLevel" INTEGER,
    "maxMemberSkillLevel" INTEGER,
    "minMemberAge" INTEGER,
    "maxMemberAge" INTEGER,
    "averageActivityFrequency" INTEGER,
    "teamObjective" INTEGER[],
    "minJoinSkillLevel" INTEGER,
    "maxJoinSkillLevel" INTEGER,
    "minJoinAge" INTEGER,
    "maxJoinAge" INTEGER,
    "joinPlayerGender" "BiologicalGender"[],
    "recruitingMessage" TEXT,
    "youtubeChannelUrl" TEXT,
    "instagramUrl" TEXT,
    "externalLinkUrl" TEXT,
    "tiktokUrl" TEXT,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "prefSlugSetupDatetime" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "requestStatus" "TeamJoinRequestState" NOT NULL,
    "requestSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approverId" TEXT,
    "statusChangedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAffiliationCategory" (
    "teamId" TEXT NOT NULL,
    "affiliationCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamAffiliationCategory_pkey" PRIMARY KEY ("teamId","affiliationCategoryId")
);

-- CreateTable
CREATE TABLE "TeamMemberApplicationRequirement" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "levelRange" INTEGER[],
    "ageRange" INTEGER[],
    "gender" "BiologicalGender"[],
    "description" TEXT NOT NULL,
    "positions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMemberApplicationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSport" (
    "teamId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSport_pkey" PRIMARY KEY ("teamId","sportId")
);

-- CreateTable
CREATE TABLE "TeamSportAttribute" (
    "teamId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSportAttribute_pkey" PRIMARY KEY ("teamId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL,
    "role" TEXT,
    "relationship" TEXT,
    "isAdmin" BOOLEAN NOT NULL,
    "canManagePayment" BOOLEAN NOT NULL,
    "canManageTeamMember" BOOLEAN NOT NULL,
    "canManageEvent" BOOLEAN NOT NULL,
    "canManageResult" BOOLEAN NOT NULL,
    "canManageTeamActivity" BOOLEAN NOT NULL,
    "isPubliclyVisible" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamMemberInvitationId" TEXT,

    CONSTRAINT "TeamGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamGroupMember" (
    "role" TEXT,
    "teamGroupId" TEXT NOT NULL,
    "teamMemberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGroupMember_pkey" PRIMARY KEY ("teamGroupId","teamMemberId")
);

-- CreateTable
CREATE TABLE "TeamGroupSportAttribute" (
    "teamGroupId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGroupSportAttribute_pkey" PRIMARY KEY ("teamGroupId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "TeamActivity" (
    "id" TEXT NOT NULL,
    "recurringId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "teamActivityType" "TeamActivityType" NOT NULL,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "status" "TeamActivityStatus" NOT NULL DEFAULT 'PUBLIC',
    "visibility" "TeamActivityVisibility" NOT NULL DEFAULT 'TEAM_INTERNAL',
    "place" TEXT,
    "placeName" TEXT,
    "placeNameLanguage" TEXT,
    "placeLat" DOUBLE PRECISION,
    "placeLng" DOUBLE PRECISION,
    "placeGoogleMapsPlaceId" TEXT,
    "placeCityId" TEXT,
    "placeStateId" TEXT,
    "placeCountryId" TEXT,
    "placeDetails" TEXT,
    "priceForGuest" DOUBLE PRECISION,
    "priceForInvited" DOUBLE PRECISION,
    "priceForMember" DOUBLE PRECISION,
    "paymentMethod" "TeamActivityPaymentMethod"[],
    "isInvitationAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isGuestAllowed" BOOLEAN NOT NULL DEFAULT false,
    "maxInvitationAttendees" INTEGER,
    "maxGuestAttendees" INTEGER,
    "maxAttendees" INTEGER,
    "currentAttendees" INTEGER NOT NULL DEFAULT 0,
    "currentInvitationAttendees" INTEGER NOT NULL DEFAULT 0,
    "currentGuestAttendees" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sportId" TEXT,
    "eventId" TEXT,
    "teamId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "TeamActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTeamActivity" (
    "id" TEXT NOT NULL,
    "recurringType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTeamActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamActivityRevision" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamActivityParticipationRequirement" (
    "id" TEXT NOT NULL,
    "teamActivityId" TEXT NOT NULL,
    "type" "TeamActivityParticipationRequirementType" NOT NULL,
    "intValue" INTEGER,
    "stringValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityParticipationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamActivityAttendanceResponse" (
    "teamActivityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "isInvited" BOOLEAN NOT NULL DEFAULT false,
    "response" "TeamActivityAttendanceResponseType" NOT NULL,
    "responseComment" TEXT,
    "cancelReason" TEXT,
    "personalActivityId" TEXT,
    "responseChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityAttendanceResponse_pkey" PRIMARY KEY ("userId","teamActivityId")
);

-- CreateTable
CREATE TABLE "TeamActivityAttendanceGuestWaitlist" (
    "teamActivityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityAttendanceGuestWaitlist_pkey" PRIMARY KEY ("userId","teamActivityId")
);

-- CreateTable
CREATE TABLE "TeamActivityGroupAssignment" (
    "teamActivityId" TEXT NOT NULL,
    "teamGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityGroupAssignment_pkey" PRIMARY KEY ("teamGroupId","teamActivityId")
);

-- CreateTable
CREATE TABLE "TeamActivitySportAttribute" (
    "teamActivityId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivitySportAttribute_pkey" PRIMARY KEY ("teamActivityId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "TeamActivityEvaluation" (
    "teamActivityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamActivityEvaluation_pkey" PRIMARY KEY ("teamActivityId","userId")
);

-- CreateTable
CREATE TABLE "TeamFollow" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamFollow_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "TeamChatChannel" (
    "id" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "activityId" TEXT,
    "resultId" TEXT,
    "channelType" "TeamChatChannelType" NOT NULL,
    "isGuestAccessible" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamChatPost" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "isGuest" BOOLEAN NOT NULL,
    "postBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamChatPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMemberInvitation" (
    "id" TEXT NOT NULL,
    "uuidToken" TEXT NOT NULL,
    "emailForNonUser" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "teamId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "TeamMemberInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamActivityInvitation" (
    "id" TEXT NOT NULL,
    "uuidToken" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamActivityId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "TeamActivityInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSport" (
    "organizationId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSport_pkey" PRIMARY KEY ("organizationId","sportId")
);

-- CreateTable
CREATE TABLE "OrganizationSportAttribute" (
    "organizationId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSportAttribute_pkey" PRIMARY KEY ("organizationId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "PersonalActivity" (
    "id" TEXT NOT NULL,
    "recurringId" TEXT,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "activityType" "PersonalActivityType"[],
    "eventId" TEXT,
    "bodyDataId" TEXT,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "place" TEXT,
    "status" "PersonalActivityStatus" NOT NULL DEFAULT 'PUBLISHED',
    "visibility" "PersonalActivityVisibility" NOT NULL DEFAULT 'PRIVATE',
    "asGuest" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "sportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalActivitySportAttribute" (
    "personalActivityId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalActivitySportAttribute_pkey" PRIMARY KEY ("personalActivityId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "PersonalBodyData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "measurementDatetime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "personalActivityId" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bodyFatMass" DOUBLE PRECISION,
    "bodyFatPercentage" DOUBLE PRECISION,
    "bodyAge" INTEGER,
    "consumedCalories" INTEGER,
    "bodyWater" DOUBLE PRECISION,
    "proteinAmount" DOUBLE PRECISION,
    "mineralAmount" DOUBLE PRECISION,
    "muscleAmount" DOUBLE PRECISION,
    "abdominalCircumference" DOUBLE PRECISION,
    "chestCircumference" DOUBLE PRECISION,
    "waistCircumference" DOUBLE PRECISION,
    "hipCircumference" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalBodyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalActivityMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "durationSeconds" INTEGER,
    "setCount" INTEGER,
    "repetitionCount" INTEGER,
    "totalCount" INTEGER,
    "weight" DOUBLE PRECISION,
    "weightUnit" "WeightUnit",
    "durationPerRep" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "distanceUnit" "DistanceUnit",
    "personalActivityId" TEXT,
    "workoutAndDrillMenuId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalActivityMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalActivityMenuItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "setNumber" INTEGER,
    "repetitionCount" INTEGER,
    "weight" DOUBLE PRECISION,
    "weightUnit" "WeightUnit",
    "durationPerRep" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "distanceUnit" "DistanceUnit",
    "durationSeconds" INTEGER,
    "intervalSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalActivityMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "eventType" TEXT,
    "description" TEXT,
    "organizationId" TEXT,
    "imageUrl" TEXT,
    "entryCount" INTEGER,
    "likeCount" INTEGER,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEntryPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entryType" "EntryTypeEnum" NOT NULL,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "place" TEXT,
    "price" DOUBLE PRECISION,
    "maxAttendeeCount" INTEGER,
    "allowTempTeam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventEntryPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEntryRequirement" (
    "id" TEXT NOT NULL,
    "eventEntryPointId" TEXT NOT NULL,
    "type" "EventEntryRequirementType" NOT NULL,
    "intValue" INTEGER,
    "stringValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEntryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEntryPointSport" (
    "eventEntryPointId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEntryPointSport_pkey" PRIMARY KEY ("eventEntryPointId","sportId")
);

-- CreateTable
CREATE TABLE "EventEntryPointSportAttribute" (
    "eventEntryPointId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEntryPointSportAttribute_pkey" PRIMARY KEY ("eventEntryPointId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "PersonalEventEntry" (
    "entryPointId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalEventEntry_pkey" PRIMARY KEY ("userId","entryPointId")
);

-- CreateTable
CREATE TABLE "TeamEventEntry" (
    "entryPointId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamActivityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamEventEntry_pkey" PRIMARY KEY ("teamId","entryPointId")
);

-- CreateTable
CREATE TABLE "WorkoutAndDrillMenu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutAndDrillMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHighlighted" BOOLEAN NOT NULL,
    "highlightDisplayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "eventId" TEXT,
    "personalEventEntryPointId" TEXT,
    "personalEventEntryUserId" TEXT,
    "personalActivityId" TEXT,
    "sportId" TEXT NOT NULL,
    "formatVersion" INTEGER NOT NULL,
    "detailsJson" TEXT,

    CONSTRAINT "PersonalResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalResultSportAttribute" (
    "personalResultId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalResultSportAttribute_pkey" PRIMARY KEY ("personalResultId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "RecordMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "criteria" "RecordCriteria"[] DEFAULT ARRAY[]::"RecordCriteria"[],
    "unitValue" "RecordUnitType" NOT NULL DEFAULT 'None',
    "isAccumulative" BOOLEAN NOT NULL DEFAULT false,
    "isTeamRecord" BOOLEAN NOT NULL DEFAULT false,
    "canbeFocusIndex" BOOLEAN NOT NULL DEFAULT false,
    "isNotCompetitive" BOOLEAN NOT NULL DEFAULT false,
    "hasSportCompetition" BOOLEAN NOT NULL DEFAULT false,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "emoji" TEXT,
    "standardValue" DOUBLE PRECISION,
    "standardValueMargin" DOUBLE PRECISION,
    "unitValueSteps" DOUBLE PRECISION,

    CONSTRAINT "RecordMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordCollection" (
    "id" TEXT NOT NULL,

    CONSTRAINT "RecordCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHighlighted" BOOLEAN NOT NULL,
    "highlightDisplayOrder" INTEGER,
    "recordCategory" TEXT,
    "recordCategoryDetail" TEXT,
    "recordTarget" TEXT,
    "recordValue" DOUBLE PRECISION NOT NULL,
    "displayType" TEXT,
    "recordDatetime" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "media" TEXT,
    "resultId" TEXT,
    "eventId" TEXT,
    "personalActivityId" TEXT,
    "formatVersion" INTEGER NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "recordMasterId" TEXT NOT NULL,
    "personalEventEntryUserId" TEXT,
    "personalEventEntryEntryPointId" TEXT,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecordSport" (
    "personalRecordId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalRecordSport_pkey" PRIMARY KEY ("personalRecordId","sportId")
);

-- CreateTable
CREATE TABLE "PersonalRecordSportAttribute" (
    "personalRecordId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalRecordSportAttribute_pkey" PRIMARY KEY ("personalRecordId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "PersonalRecordMilestoneMaster" (
    "id" TEXT NOT NULL,

    CONSTRAINT "PersonalRecordMilestoneMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visibility" "UserPostVisibility" NOT NULL DEFAULT 'PRIVATE',
    "textForSearch" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summaryJson" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "personalActivityId" TEXT,
    "personalRecordId" TEXT,
    "personalResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPostLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPostId" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPostComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPostId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPost" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "visibility" "TeamPostVisibility" NOT NULL DEFAULT 'INTERNAL',
    "textForSearch" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summaryJson" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "teamActivityId" TEXT,
    "teamResultId" TEXT,
    "postedById" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPostLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamPostId" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPostComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamPostId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamResult" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "isHighlighted" BOOLEAN NOT NULL,
    "highlightDisplayOrder" INTEGER,
    "recordCategory" TEXT NOT NULL,
    "recordCategoryDetail" TEXT NOT NULL,
    "recordTarget" TEXT NOT NULL,
    "recordDatetime" TIMESTAMP(3) NOT NULL,
    "displayType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "media" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "eventId" TEXT,
    "teamEventEntryTeamId" TEXT NOT NULL,
    "teamEventEntryEntryPointId" TEXT NOT NULL,
    "teamActivityId" TEXT NOT NULL,
    "formatVersion" INTEGER NOT NULL,
    "detailsJson" TEXT,

    CONSTRAINT "TeamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamResultSport" (
    "name" TEXT NOT NULL,
    "teamResultId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamResultSport_pkey" PRIMARY KEY ("teamResultId","sportId")
);

-- CreateTable
CREATE TABLE "TeamResultSportAttribute" (
    "name" TEXT NOT NULL,
    "teamResultId" TEXT NOT NULL,
    "sportAttributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamResultSportAttribute_pkey" PRIMARY KEY ("teamResultId","sportAttributeId")
);

-- CreateTable
CREATE TABLE "InstantTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "InstantTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstantTeamMember" (
    "id" TEXT NOT NULL,
    "instantTeamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstantTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstantTeamChatPost" (
    "id" TEXT NOT NULL,
    "instantTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstantTeamChatPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstantTeamEventEntry" (
    "id" TEXT NOT NULL,
    "instantTeamId" TEXT NOT NULL,
    "eventEntryPointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstantTeamEventEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempPersonalActivitySummary" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempPersonalActivitySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFocus" (
    "userId" TEXT NOT NULL,
    "recordMasterId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "valueType" "UserFocusValueType" NOT NULL DEFAULT 'LatestValue',
    "valueDatetime" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFocus_pkey" PRIMARY KEY ("userId","recordMasterId")
);

-- CreateTable
CREATE TABLE "_SportToSportCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SportToSportCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SportToWorkoutAndDrillMenu" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SportToWorkoutAndDrillMenu_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sport_slug_key" ON "Sport"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_key" ON "UserAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_fromUserId_toUserId_key" ON "FriendRequest"("fromUserId", "toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamActivityAttendanceResponse_personalActivityId_key" ON "TeamActivityAttendanceResponse"("personalActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamActivityInvitation_teamActivityId_userId_key" ON "TeamActivityInvitation"("teamActivityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalActivity_bodyDataId_key" ON "PersonalActivity"("bodyDataId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamEventEntry_teamActivityId_key" ON "TeamEventEntry"("teamActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordMaster_name_key" ON "RecordMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecordMaster_nameJa_key" ON "RecordMaster"("nameJa");

-- CreateIndex
CREATE UNIQUE INDEX "TempPersonalActivitySummary_userId_key" ON "TempPersonalActivitySummary"("userId");

-- CreateIndex
CREATE INDEX "_SportToSportCategory_B_index" ON "_SportToSportCategory"("B");

-- CreateIndex
CREATE INDEX "_SportToWorkoutAndDrillMenu_B_index" ON "_SportToWorkoutAndDrillMenu"("B");

-- AddForeignKey
ALTER TABLE "SportAttribute" ADD CONSTRAINT "SportAttribute_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointOfInterest" ADD CONSTRAINT "PointOfInterest_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointOfInterest" ADD CONSTRAINT "PointOfInterest_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointOfInterest" ADD CONSTRAINT "PointOfInterest_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportPopularityByCountry" ADD CONSTRAINT "SportPopularityByCountry_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportPopularityByCountry" ADD CONSTRAINT "SportPopularityByCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAffiliationCategory" ADD CONSTRAINT "UserAffiliationCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAffiliationCategory" ADD CONSTRAINT "UserAffiliationCategory_affiliationCategoryId_fkey" FOREIGN KEY ("affiliationCategoryId") REFERENCES "AffiliationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowRequest" ADD CONSTRAINT "UserFollowRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowRequest" ADD CONSTRAINT "UserFollowRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSport" ADD CONSTRAINT "UserSport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSport" ADD CONSTRAINT "UserSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportAttribute" ADD CONSTRAINT "UserSportAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportAttribute" ADD CONSTRAINT "UserSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSportAttribute" ADD CONSTRAINT "UserSportAttribute_userSportUserId_userSportSportId_fkey" FOREIGN KEY ("userSportUserId", "userSportSportId") REFERENCES "UserSport"("userId", "sportId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlace" ADD CONSTRAINT "UserPlace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlace" ADD CONSTRAINT "UserPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlace" ADD CONSTRAINT "TeamPlace_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlace" ADD CONSTRAINT "TeamPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAffiliationCategory" ADD CONSTRAINT "TeamAffiliationCategory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAffiliationCategory" ADD CONSTRAINT "TeamAffiliationCategory_affiliationCategoryId_fkey" FOREIGN KEY ("affiliationCategoryId") REFERENCES "AffiliationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberApplicationRequirement" ADD CONSTRAINT "TeamMemberApplicationRequirement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberApplicationRequirement" ADD CONSTRAINT "TeamMemberApplicationRequirement_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSport" ADD CONSTRAINT "TeamSport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSport" ADD CONSTRAINT "TeamSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSportAttribute" ADD CONSTRAINT "TeamSportAttribute_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSportAttribute" ADD CONSTRAINT "TeamSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroup" ADD CONSTRAINT "TeamGroup_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroup" ADD CONSTRAINT "TeamGroup_teamMemberInvitationId_fkey" FOREIGN KEY ("teamMemberInvitationId") REFERENCES "TeamMemberInvitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroupMember" ADD CONSTRAINT "TeamGroupMember_teamGroupId_fkey" FOREIGN KEY ("teamGroupId") REFERENCES "TeamGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroupMember" ADD CONSTRAINT "TeamGroupMember_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroupSportAttribute" ADD CONSTRAINT "TeamGroupSportAttribute_teamGroupId_fkey" FOREIGN KEY ("teamGroupId") REFERENCES "TeamGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGroupSportAttribute" ADD CONSTRAINT "TeamGroupSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityRevision" ADD CONSTRAINT "TeamActivityRevision_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityParticipationRequirement" ADD CONSTRAINT "TeamActivityParticipationRequirement_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityAttendanceResponse" ADD CONSTRAINT "TeamActivityAttendanceResponse_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityAttendanceResponse" ADD CONSTRAINT "TeamActivityAttendanceResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityAttendanceResponse" ADD CONSTRAINT "TeamActivityAttendanceResponse_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityAttendanceGuestWaitlist" ADD CONSTRAINT "TeamActivityAttendanceGuestWaitlist_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityAttendanceGuestWaitlist" ADD CONSTRAINT "TeamActivityAttendanceGuestWaitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityGroupAssignment" ADD CONSTRAINT "TeamActivityGroupAssignment_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityGroupAssignment" ADD CONSTRAINT "TeamActivityGroupAssignment_teamGroupId_fkey" FOREIGN KEY ("teamGroupId") REFERENCES "TeamGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivitySportAttribute" ADD CONSTRAINT "TeamActivitySportAttribute_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivitySportAttribute" ADD CONSTRAINT "TeamActivitySportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityEvaluation" ADD CONSTRAINT "TeamActivityEvaluation_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityEvaluation" ADD CONSTRAINT "TeamActivityEvaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamFollow" ADD CONSTRAINT "TeamFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamFollow" ADD CONSTRAINT "TeamFollow_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChatChannel" ADD CONSTRAINT "TeamChatChannel_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "TeamActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChatPost" ADD CONSTRAINT "TeamChatPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChatPost" ADD CONSTRAINT "TeamChatPost_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChatPost" ADD CONSTRAINT "TeamChatPost_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "TeamChatChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberInvitation" ADD CONSTRAINT "TeamMemberInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberInvitation" ADD CONSTRAINT "TeamMemberInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberInvitation" ADD CONSTRAINT "TeamMemberInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityInvitation" ADD CONSTRAINT "TeamActivityInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityInvitation" ADD CONSTRAINT "TeamActivityInvitation_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityInvitation" ADD CONSTRAINT "TeamActivityInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivityInvitation" ADD CONSTRAINT "TeamActivityInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSport" ADD CONSTRAINT "OrganizationSport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSport" ADD CONSTRAINT "OrganizationSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSportAttribute" ADD CONSTRAINT "OrganizationSportAttribute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSportAttribute" ADD CONSTRAINT "OrganizationSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivity" ADD CONSTRAINT "PersonalActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivity" ADD CONSTRAINT "PersonalActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivity" ADD CONSTRAINT "PersonalActivity_bodyDataId_fkey" FOREIGN KEY ("bodyDataId") REFERENCES "PersonalBodyData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivity" ADD CONSTRAINT "PersonalActivity_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivitySportAttribute" ADD CONSTRAINT "PersonalActivitySportAttribute_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivitySportAttribute" ADD CONSTRAINT "PersonalActivitySportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalBodyData" ADD CONSTRAINT "PersonalBodyData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivityMenu" ADD CONSTRAINT "PersonalActivityMenu_workoutAndDrillMenuId_fkey" FOREIGN KEY ("workoutAndDrillMenuId") REFERENCES "WorkoutAndDrillMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivityMenu" ADD CONSTRAINT "PersonalActivityMenu_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalActivityMenuItem" ADD CONSTRAINT "PersonalActivityMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "PersonalActivityMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryPoint" ADD CONSTRAINT "EventEntryPoint_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryRequirement" ADD CONSTRAINT "EventEntryRequirement_eventEntryPointId_fkey" FOREIGN KEY ("eventEntryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryPointSport" ADD CONSTRAINT "EventEntryPointSport_eventEntryPointId_fkey" FOREIGN KEY ("eventEntryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryPointSport" ADD CONSTRAINT "EventEntryPointSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryPointSportAttribute" ADD CONSTRAINT "EventEntryPointSportAttribute_eventEntryPointId_fkey" FOREIGN KEY ("eventEntryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryPointSportAttribute" ADD CONSTRAINT "EventEntryPointSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalEventEntry" ADD CONSTRAINT "PersonalEventEntry_entryPointId_fkey" FOREIGN KEY ("entryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalEventEntry" ADD CONSTRAINT "PersonalEventEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEventEntry" ADD CONSTRAINT "TeamEventEntry_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEventEntry" ADD CONSTRAINT "TeamEventEntry_entryPointId_fkey" FOREIGN KEY ("entryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEventEntry" ADD CONSTRAINT "TeamEventEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResult" ADD CONSTRAINT "PersonalResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResult" ADD CONSTRAINT "PersonalResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResult" ADD CONSTRAINT "PersonalResult_personalEventEntryUserId_personalEventEntry_fkey" FOREIGN KEY ("personalEventEntryUserId", "personalEventEntryPointId") REFERENCES "PersonalEventEntry"("userId", "entryPointId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResult" ADD CONSTRAINT "PersonalResult_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResult" ADD CONSTRAINT "PersonalResult_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResultSportAttribute" ADD CONSTRAINT "PersonalResultSportAttribute_personalResultId_fkey" FOREIGN KEY ("personalResultId") REFERENCES "PersonalResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalResultSportAttribute" ADD CONSTRAINT "PersonalResultSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_recordMasterId_fkey" FOREIGN KEY ("recordMasterId") REFERENCES "RecordMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "PersonalResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecordSport" ADD CONSTRAINT "PersonalRecordSport_personalRecordId_fkey" FOREIGN KEY ("personalRecordId") REFERENCES "PersonalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecordSport" ADD CONSTRAINT "PersonalRecordSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecordSportAttribute" ADD CONSTRAINT "PersonalRecordSportAttribute_personalRecordId_fkey" FOREIGN KEY ("personalRecordId") REFERENCES "PersonalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecordSportAttribute" ADD CONSTRAINT "PersonalRecordSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_personalActivityId_fkey" FOREIGN KEY ("personalActivityId") REFERENCES "PersonalActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_personalRecordId_fkey" FOREIGN KEY ("personalRecordId") REFERENCES "PersonalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_personalResultId_fkey" FOREIGN KEY ("personalResultId") REFERENCES "PersonalResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostLike" ADD CONSTRAINT "UserPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostLike" ADD CONSTRAINT "UserPostLike_userPostId_fkey" FOREIGN KEY ("userPostId") REFERENCES "UserPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostComment" ADD CONSTRAINT "UserPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostComment" ADD CONSTRAINT "UserPostComment_userPostId_fkey" FOREIGN KEY ("userPostId") REFERENCES "UserPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPost" ADD CONSTRAINT "TeamPost_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPost" ADD CONSTRAINT "TeamPost_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPost" ADD CONSTRAINT "TeamPost_teamResultId_fkey" FOREIGN KEY ("teamResultId") REFERENCES "TeamResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPost" ADD CONSTRAINT "TeamPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPostLike" ADD CONSTRAINT "TeamPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPostLike" ADD CONSTRAINT "TeamPostLike_teamPostId_fkey" FOREIGN KEY ("teamPostId") REFERENCES "TeamPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPostComment" ADD CONSTRAINT "TeamPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPostComment" ADD CONSTRAINT "TeamPostComment_teamPostId_fkey" FOREIGN KEY ("teamPostId") REFERENCES "TeamPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResult" ADD CONSTRAINT "TeamResult_teamEventEntryTeamId_teamEventEntryEntryPointId_fkey" FOREIGN KEY ("teamEventEntryTeamId", "teamEventEntryEntryPointId") REFERENCES "TeamEventEntry"("teamId", "entryPointId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResult" ADD CONSTRAINT "TeamResult_teamActivityId_fkey" FOREIGN KEY ("teamActivityId") REFERENCES "TeamActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResult" ADD CONSTRAINT "TeamResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResultSport" ADD CONSTRAINT "TeamResultSport_teamResultId_fkey" FOREIGN KEY ("teamResultId") REFERENCES "TeamResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResultSport" ADD CONSTRAINT "TeamResultSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResultSportAttribute" ADD CONSTRAINT "TeamResultSportAttribute_teamResultId_fkey" FOREIGN KEY ("teamResultId") REFERENCES "TeamResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResultSportAttribute" ADD CONSTRAINT "TeamResultSportAttribute_sportAttributeId_fkey" FOREIGN KEY ("sportAttributeId") REFERENCES "SportAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantTeamMember" ADD CONSTRAINT "InstantTeamMember_instantTeamId_fkey" FOREIGN KEY ("instantTeamId") REFERENCES "InstantTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantTeamMember" ADD CONSTRAINT "InstantTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantTeamChatPost" ADD CONSTRAINT "InstantTeamChatPost_instantTeamId_fkey" FOREIGN KEY ("instantTeamId") REFERENCES "InstantTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantTeamEventEntry" ADD CONSTRAINT "InstantTeamEventEntry_instantTeamId_fkey" FOREIGN KEY ("instantTeamId") REFERENCES "InstantTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantTeamEventEntry" ADD CONSTRAINT "InstantTeamEventEntry_eventEntryPointId_fkey" FOREIGN KEY ("eventEntryPointId") REFERENCES "EventEntryPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempPersonalActivitySummary" ADD CONSTRAINT "TempPersonalActivitySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFocus" ADD CONSTRAINT "UserFocus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFocus" ADD CONSTRAINT "UserFocus_recordMasterId_fkey" FOREIGN KEY ("recordMasterId") REFERENCES "RecordMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToSportCategory" ADD CONSTRAINT "_SportToSportCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToSportCategory" ADD CONSTRAINT "_SportToSportCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SportCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToWorkoutAndDrillMenu" ADD CONSTRAINT "_SportToWorkoutAndDrillMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SportToWorkoutAndDrillMenu" ADD CONSTRAINT "_SportToWorkoutAndDrillMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkoutAndDrillMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
