export const codeforcesLevelsData: LevelInfo[] = [{
    "levelName": "Newbie",
    "lowestRatings": 0,
    "highestRatings": 1199,
    "color": "#808080",
}, {
    "levelName": "Pupil",
    "lowestRatings": 1200,
    "highestRatings": 1399,
    "color": '#008000',
}, {
    "levelName": "Specialist",
    "lowestRatings": 1400,
    "highestRatings": 1599,
    "color": '#03A89E',
}, {
    "levelName": "Expert",
    "lowestRatings": 1600,
    "highestRatings": 1899,
    "color": '#0000FF',
}, {
    "levelName": "Candidate Master",
    "lowestRatings": 1900,
    "highestRatings": 2099,
    "color": '#800080',
}, {
    "levelName": "Master",
    "lowestRatings": 2100,
    "highestRatings": 2299,
    "color": '#FFA500',
}, {
    "levelName": "International Master",
    "lowestRatings": 2300,
    "highestRatings": 2399,
    "color": '#FFA500',
}, {
    "levelName": "Grandmaster",
    "lowestRatings": 2400,
    "highestRatings": 2599,
    "color": '#FF0000',
}, {
    "levelName": "International Grandmaster",
    "lowestRatings": 2600,
    "highestRatings": 2999,
    "color": '#FF0000',
}, {
    "levelName": "Legendary Grandmaster",
    "lowestRatings": 3000,
    "highestRatings": 99999,
    "color": '#FF0000',
}]

export interface LevelInfo {
    levelName: string;
    lowestRatings: number;
    highestRatings: number;
    /**Represent color of this level, e.g.: `#808080` */
    color: string;
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