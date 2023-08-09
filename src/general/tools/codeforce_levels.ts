export const codeforcesLevelsData: LevelInfo[] = [{
    "levelName": "Newbie",
    "lowestRatings": 0,
    "highestRatings": 1199
}, {
    "levelName": "Pupil",
    "lowestRatings": 1200,
    "highestRatings": 1399
}, {
    "levelName": "Specialist",
    "lowestRatings": 1400,
    "highestRatings": 1599
}, {
    "levelName": "Expert",
    "lowestRatings": 1600,
    "highestRatings": 1899
}, {
    "levelName": "Candidate Master",
    "lowestRatings": 1900,
    "highestRatings": 2099
}, {
    "levelName": "Master",
    "lowestRatings": 2100,
    "highestRatings": 2299
}, {
    "levelName": "International Master",
    "lowestRatings": 2300,
    "highestRatings": 2399
}, {
    "levelName": "Grandmaster",
    "lowestRatings": 2400,
    "highestRatings": 2599
}, {
    "levelName": "International Grandmaster",
    "lowestRatings": 2600,
    "highestRatings": 2999
}, {
    "levelName": "Legendary Grandmaster",
    "lowestRatings": 3000,
    "highestRatings": 99999
}]

export interface LevelInfo {
    levelName: string;
    lowestRatings: number;
    highestRatings: number;
}

export interface getLevelInfoByRatingsReturns {
    /**
     * The previous level info, could be `undefined` if current level is `Newbie`
     */
    previous?: LevelInfo;
    current: LevelInfo;
    /**
     * The next level info, could be `undefined` if current level is `Legendary Grandmaster`
     */
    next?: LevelInfo;

}

export function getLevelInfoByRatings(ratings: number): getLevelInfoByRatingsReturns {
    let levelCnt = codeforcesLevelsData.length;
    let i: number;
    let current: LevelInfo | undefined = undefined;
    for (i = 0; i < levelCnt; ++i) {
        let curLevel = codeforcesLevelsData[i];
        if (ratings >= curLevel.lowestRatings && ratings <= curLevel.highestRatings) {
            current = codeforcesLevelsData[i];
            break;
        }
    }
    // previous
    let previous: LevelInfo | undefined;
    if (i === 0) {
        previous = undefined;
    }
    else {
        previous = codeforcesLevelsData[i - 1];
    }
    // next
    let next: LevelInfo | undefined;
    if (i === levelCnt - 1) {
        next = undefined;
    }
    else {
        next = codeforcesLevelsData[i + 1];
    }
    return {
        current: current as LevelInfo,
        previous: previous,
        next: next,
    };
}