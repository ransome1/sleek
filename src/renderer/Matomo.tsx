import React, { useEffect } from 'react';

interface Props {
  settings: Settings;
}

const { store } = window.api;

const environment = process.env.NODE_ENV;

const MatomoComponent: React.FC<Props> = ({
  settings,
}) => {

  useEffect(() => {
    const anonymousUserId = (environment === 'development') ? 'Dev' : store.get('anonymousUserId');
    if(settings.matomo && anonymousUserId) {
      const matomoContainer: string = (environment === 'development') ? 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV_dev_a003c77410fd43f247329b3b.js' : 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV.js';
      const _mtm = window._mtm = window._mtm || [];
      _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
      if(anonymousUserId) _mtm.push({'anonymousUserId': anonymousUserId });
      const
        d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
      g.async = true;
      g.src = matomoContainer;
      s.parentNode?.insertBefore(g, s);
    }
  }, [settings.matomo]);

  return (<></>);
};

export default MatomoComponent;