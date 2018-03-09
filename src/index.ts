import * as akala from '@akala/server';
import { Service } from '@domojs/upnp'
import { meta } from '@domojs/service-discovery'

akala.injectWithName(['$master', '$isModule', '$http'], function (master: akala.worker.MasterRegistration, isModule: akala.worker.IsModule, http: akala.Http)
{
    if (isModule('@domojs/hue'))
    {
        akala.worker.createClient('zeroconf').then((c) =>
        {
            var client = meta.createClient(c)({
                add: function (service: Service)
                {
                    if (service.type == 'upnp:rootdevice' && typeof (service.headers['HUE-BRIDGEID']) != 'undefined')
                    {
                    }
                }, delete: function (service: Service)
                {

                }
            });
            client.$proxy().notify({ type: 'urn:schemas-upnp-org:device:Basic:1' });
            client.$proxy().get({ type: 'urn:schemas-upnp-org:device:Basic:1' }).then(function (services)
            {
                akala.each(services, function (service)
                {
                    client.add(service);
                })
            });
        })
    }
})();