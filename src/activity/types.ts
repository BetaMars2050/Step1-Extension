interface ActivityInfo {
    id: string;
    twId: string;
    activityName: string;
    chainName: string;
    tweetId: null | any;
    description: null | any;
    endTime: string;
    startTime: string;
    payStatus: number;
    chainHash: null | any;
    createTime: string;
    sendName: string;
    sendScreenName: string;
    completedNum: null | any;
    rewardNum: null | any;
}

interface Mission {
    id: number;
    activityId: string;
    retweet: boolean;
    support: boolean;
    follow: string;
    createTime: string;
}

export interface Gaming {
    id: number;
    activityId: string;
    question: string;
    answerOne: string;
    answerTwo: string;
    answerThree: string;
    answerOneFlag: boolean;
    answerTwoFlag: boolean;
    answerThreeFlag: boolean;
    createTime: string;
    answerStatus?: number
}

interface Eligibility {
    id: number;
    activityId: string;
    whitelist: string;
    totalScore: number;
    totalStatus: number;
    assetsScore: number;
    assetsStatus: number;
    luckyScore: number;
    luckyStatus: number;
    socialScore: number;
    socialStatus: number;
    activeScore: number;
    activeStatus: number;
}

interface UserScore {
    id: number;
    totalScore: number;
    totalStatus: number;
    assetsScore: number;
    assetsStatus: number;
    luckyScore: number;
    luckyStatus: number;
    socialScore: number;
    socialStatus: number;
    activeScore: number;
    activeStatus: number;
}

interface UserGame {
    [key: string]: number
}

interface UserRecord {
    isGaming: boolean;
    isScore: boolean;
    userReward: string;
    userMisson: any;
    isGetReward: boolean;
    userGame: UserGame;
    userScore: UserScore;
    whitelist: boolean;
    walletAddress: string;
    isMission: boolean;
    rewardStatus: number;
}

export interface Activity {
    reward: null | any;
    mission: Mission[];
    gaming: Gaming[];
    activity: ActivityInfo;
    participateUser: number;
    eligibility: Eligibility;
    userRecord: UserRecord;
    isParticipate: boolean
}