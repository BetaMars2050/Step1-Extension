

export interface ObjType<T> {
    [key: string]: T
}

export interface TwUserInfo {
    name: string | null
}

export interface Score {
    [key: string]: { score: number, status: number }
}

export interface EbtForm {
    whitelist: string[],
    score: Score
}


export interface TokenReward {
    rewardId: number;
    type: number;
    distribution: number;
    tokenName: string;
    tokenNum: string;
    quantity: number;
    tokenInfo: {
        [key: string]: string
    }
}

export interface NftReward {
    rewardId: number;
    type: string;
    nftName: string;
    nftAddress: string;
    nftIds: number[] | string[];
}

export interface Question {
    question: string,
    questionErr?: string,
    answerOne: string,
    answerOneErr?: string,
    answerOneFlag: boolean,
    answerTwo: string,
    answerTwoErr?: string,
    answerTwoFlag: boolean,
    answerThree: string,
    answerThreeErr?: string,
    answerThreeFlag: boolean
}

export interface Mission {
    follow: TwUserInfo[],
    like: boolean,
    retweet: boolean
}

type Reward = TokenReward | NftReward;

interface Tools {
    reward?: Reward;
    eligibility?: EbtForm;
    mission?: Mission;
    gaming?: Question[];
}

export interface Activity {
    activityName: string;
    startTime: Date | string | number;
    endTime: Date | string | number;
    chainName: string;
    tools: Tools;
}

