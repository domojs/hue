import * as jsonrpc from '@akala/json-rpc-ws'
import { Connection } from '@akala/json-rpc-ws'
import * as akala from '@akala/server'

import { Metadata, Proxy } from '@akala/server'

export interface Service
{
    type: string;
    name: string;
    connection?: jsonrpc.Connection;
}

export var meta = new Metadata()
    .connection<Connection>()
    .clientToServerOneWay<Service>()({ add: true, delete: true, notify: true })
    .clientToServer<Partial<Service>, { [name: string]: Service }>()({ get: true })
    .serverToClientOneWay<Service>()({ add: true, delete: true });