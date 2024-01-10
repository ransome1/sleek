import React, { useEffect } from 'react';

interface MatomoComponentProps {
  settings: Settings;
}

const environment = process.env.NODE_ENV;

const MatomoComponent: React.FC<MatomoComponentProps> = ({
  settings,
}) => {
  useEffect(() => {
    const anonymousUserId = (environment === 'development') ? 'Dev' : settings.anonymousUserId;
    if(anonymousUserId) {
      const matomoContainer: string = (environment === 'development') ? 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV_dev_a003c77410fd43f247329b3b.js' : 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV.js';
      const _mtm = window._mtm = window._mtm || [];
      const _paq = window._paq || [];
      
      _mtm.push({
        'mtm.startTime': (new Date().getTime()),
        'event': 'mtm.Start',
        'anonymousUserId': (anonymousUserId) ? anonymousUserId : null,
        'version': settings.__internal__.migrations.version,
      });
      _paq.push((settings.matomo) ? ['forgetUserOptOut'] : ['optUserOut']);
      
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