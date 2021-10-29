import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ErrorScreen } from 'components';
import { useEventListener, useMKEventListener, useSettings } from 'hooks';

/**
 * This will be used to connect to the Apple Music API.
 * @see https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEVELOPER_TOKEN: string | undefined = undefined;

export interface MusicKitState {
  musicKit: typeof MusicKit;
  isConfigured: boolean;
  hasDevToken: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export type MusicKitHook = MusicKitState & {
  music: MusicKit.MusicKitInstance;
  signIn: () => Promise<void>;
  signOut: () => void;
};

export const useMusicKit = (): MusicKitHook => {
  const musicKit = window.MusicKit;
  const { setIsAppleAuthorized, isSpotifyAuthorized, setService } =
    useSettings();
  const { isConfigured, hasDevToken } = useContext(MusicKitContext);
  const music = useMemo(() => {
    // if (!isConfigured || !hasDevToken) {
    //   return {} as MusicKit.MusicKitInstance;
    // }

    return window.MusicKit.getInstance();
  }, [hasDevToken, isConfigured]);

  const signIn = useCallback(async () => {
    if (!music.isAuthorized) {
      await music.authorize();
    }

    setService('apple');
  }, [music, setService]);

  const signOut = useCallback(() => {
    music.unauthorize();
    setIsAppleAuthorized(false);

    // Change to Spotify if available.
    setService(isSpotifyAuthorized ? 'spotify' : undefined);
  }, [isSpotifyAuthorized, music, setIsAppleAuthorized, setService]);

  return {
    isConfigured,
    hasDevToken,
    musicKit,
    music,
    signIn,
    signOut,
  };
};

interface Props {
  children: React.ReactNode;
}

export const MusicKitProvider = ({ children }: Props) => {
  const musicKit = window.MusicKit;
  const [hasDevToken, setHasDevToken] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const { setIsAppleAuthorized, setService: setStreamingService } =
    useSettings();

  const handleConfigure = useCallback(async () => {
    try {
      setIsAppleAuthorized(true);
      setHasDevToken(true);

    } catch (e) {
      setHasDevToken(false);
    }
  }, [musicKit, setIsAppleAuthorized]);

  useEffect(() => {
    if (!isConfigured) {
      handleConfigure();
    }
  }, [handleConfigure, isConfigured]);

  useMKEventListener('userTokenDidChange', (e) => {
    setStreamingService('spotify')
    // if (e.userToken) {
    //   setIsAppleAuthorized(true);
    //   setStreamingService('apple');
    // } else {
    //   setIsAppleAuthorized(false);
    //   setStreamingService(undefined);
    // }
  });

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured, hasDevToken }}>
      {isConfigured ? (
        children
      ) : (
        <ErrorScreen message={'Missing Apple developer token'} />
      )}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
