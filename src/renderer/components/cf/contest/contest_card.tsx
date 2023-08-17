// Components
import { Container, FlexDiv } from 'renderer/components/container';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';

export interface CFContestCardConfig {
    contestInfo: ContestInfo;
    className?: string;
}

export function CFContestCard({
    contestInfo,
    className,
}: CFContestCardConfig) {
    return (<Container
        id='contestInfo'
        hasColor={true}
        className={classNames(
            className ?? '',
        )}>
        <FlexDiv className={classNames(
            'flex-col justify-start items-start',
            'mx-4 my-2',
        )}>
            <h2 className={classNames(
                'font-semibold text-lg'
            )}>
                {contestInfo.name}
            </h2>
            <p className={classNames(
                'text-black/50 dark:text-white/50'
            )}>
                {contestInfo.start}
            </p>
        </FlexDiv>
    </Container>);
}


export interface CFHistoryContestCardConfig {
    contestInfo: HistoryContestInfo;
    selected?: boolean;
    className?: string;
}

export function CFHistoryContestCard({
    contestInfo,
    selected,
    className,
}: CFHistoryContestCardConfig) {
    if (selected === undefined) {
        selected = false;
    }
    return (<Container
        id='contestInfo'
        hasColor={selected ? false : true}
        hasHoverColor={selected ? false : true}
        hasHoverColorTrans={false}
        className={classNames(
            selected ? 'bg-primary text-white' : '',
            className ?? '',
        )}>
        <FlexDiv className={classNames(
            'flex-col justify-start items-start',
            'mx-4 my-2',
        )}>
            <h2 className={classNames(
                'font-semibold text-lg text-start'
            )}>
                {contestInfo.name}
            </h2>
            <p className={classNames(
                selected ? 'text-white/50' : 'text-black/50 dark:text-white/50'
            )}>
                {contestInfo.start}
            </p>
        </FlexDiv>
    </Container>);
}