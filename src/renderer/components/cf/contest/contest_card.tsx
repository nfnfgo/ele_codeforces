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
            className,
        )}>
        <FlexDiv className={classNames(
            'flex-col justify-start items-start',
            'mx-4 my-2',
        )}>
            <h2 className={classNames(
                'font-semibold text-xl'
            )}>
                {contestInfo.name}
            </h2>
            <p>
                {contestInfo.start}
            </p>
        </FlexDiv>
    </Container>);
}


export interface CFHistoryContestCardConfig {
    contestInfo: HistoryContestInfo;
    className?: string;
}

export function CFHistoryContestCard({
    contestInfo,
    className,
}: CFHistoryContestCardConfig) {
    return (<Container
        id='contestInfo'
        hasColor={true}
        hasHoverColor={true}
        hasHoverColorTrans={false}
        className={classNames(
            className,
        )}>
        <FlexDiv className={classNames(
            'flex-col justify-start items-start',
            'mx-4 my-2',
        )}>
            <h2 className={classNames(
                'font-semibold text-xl'
            )}>
                {contestInfo.name}
            </h2>
            <p>
                {contestInfo.start}
            </p>
        </FlexDiv>
    </Container>);
}