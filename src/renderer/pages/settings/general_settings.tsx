

// Components
import { Background } from 'renderer/components/general/background';
import { FlexDiv, Container } from 'renderer/components/container';
import { } from './setting_tile';

// Stores
import { useSettingsStore, useSettingsStoreConfig } from 'renderer/stores/setting_store';


/**
 * React UI block for general settings
 */
export function GeneralSettingsBlock() {
    return (<>
        {/* Automatically change the background and text color based on settings */}
        <Background>
            <FlexDiv>

            </FlexDiv>
        </Background>
    </>);
}