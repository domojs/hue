import * as jsonrpc from '@akala/json-rpc-ws'
import * as akala from '@akala/server'
import { meta, Service } from './common';

var services: { byTypes: { [name: string]: Service }, byNames: { [name: string]: Service } } = { byTypes: {}, byNames: {} };
var rooms: { byTypes: jsonrpc.Connection[], byNames: jsonrpc.Connection[] } = { byTypes: [], byNames: [] };
akala.createServerFromMeta(meta)(akala.resolve('$router'), '/zeroconf', {
    add: function (service: Service)
    {
        akala.extend(service, { connection: this });
        services.byTypes[service.type] = services[service.type] || {};
        services.byTypes[service.type][service.name] = service;
        services.byNames[service.name] = service;

        rooms.byTypes.forEach(function (socket)
        {
            socket.sendMethod('Service-Add', { type: service.type, name: service.name });
        });
        rooms.byNames.forEach(function (socket)
        {
            socket.sendMethod('Service-Add', { type: service.type, name: service.name });
        });
    },
    delete: function (service: Service)
    {
        if (services.byTypes[service.type])
            delete services.byTypes[service.type][service.name];
        delete services.byNames[service.name];

        rooms.byTypes.forEach(function (socket)
        {
            socket.sendMethod('Service-Delete', { type: service.type, name: service.name });
        });
        rooms.byNames.forEach(function (socket)
        {
            socket.sendMethod('Service-Delete', { type: service.type, name: service.name });
        });
    },
    get: function (serviceQuery: Partial<Service>)
    {
        var queryable: { [name: string]: any };
        if (serviceQuery.type)
            queryable = services.byTypes;
        else
            queryable = services.byNames;

        if (serviceQuery.name)
            return akala.grep(queryable, function (service: Service, name: string)
            {
                return name.indexOf(serviceQuery.name) >= 0;
            });
        else
            return queryable;
    },
    notify: function (service: Partial<Service>, socket)
    {
        if (service.type)
            rooms.byTypes.push(socket);

        if (service.name)
            rooms.byNames.push(socket);
    }
});