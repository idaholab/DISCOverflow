// Copyright 2021, Battelle Energy Alliance, LLC

import { SNodeSchema } from 'sprotty';
import {Base64} from 'js-base64';

export type RID_T = string;

export interface OServer {
    version: string
    build: string
    osName: string
    osVersion: string
    osArch: string
    javaVendor: string
    javaVersion: string
}

export interface OProperty {
    name: string
    type: string
    mandatory: boolean
    readonly: boolean
    notNull: boolean
    min: number | null
    max: number | null
    regexp: null | string
    collate: string
    defaultValue: null | string | number
}

export interface OClass {
    name: string
    superClass: string
    superClasses: string[]
    alias: string | null
    abstract: string
    strictmode: boolean
    clusters: number[]
    defaultCluster: number
    clusterSelection: string
    records: number
    properties?: OProperty[]
}

export interface MetaData {
    server: OServer
    classes: OClass[]
    clusters: any[]
    indexes: any[]
    config: any[]
}

export interface CommandQuery {
    command: string,
    mode?: string,
    parameters: string[]
}

export interface QueryResultRecord {
    "@type"?: string
    "@rid": RID_T
    "@version"?: number
    "@class": string
    "@fieldTypes"?: string
    in?: RID_T
    out?: RID_T
    name?: string
    [key: string]: any
}

export interface DiscoLibrary extends QueryResultRecord {
    analyzed: boolean;
    arch: string;
    base: string;
    hash: string;
    name: string;
    path_to_file: string;
    version: string;
}

export interface DiscoFunction extends QueryResultRecord {
    address: number;
    analyzed: boolean;
    library: RID_T;
    name: string;
    num_blocks: number;
}

export interface DiscoBlock extends QueryResultRecord {
    address: number;
    block_id: number;
    function: RID_T;
    library: RID_T;
    name: string;
}

export type DiscoNodeType = DiscoLibrary | DiscoFunction | DiscoBlock;

export interface GraphResult {
    edges: DiscoEdge[];
    vertices: DiscoNodeType[];
}

export interface QueryResult {
    result?: QueryResultRecord[]
    // graph?: GraphResult
}

export interface GraphQueryResult {
    graph: {
        vertices: DiscoNodeType[]
        edges: DiscoEdge[]
    }
}


export interface DiscoEdge extends QueryResultRecord {
    in: string
    out: string
}

export async function DBFactory(dbhost: string, user: string, password: string): Promise<AngrDB> {
    let ret = new AngrDB(dbhost, user, password);
    ret.metadata = await ret.getMetadata()
    return ret
}


export class AngrDB {
    dbhost: string;
    commandurl: string;
    baseurl: string;
    metadata: MetaData;
    dbname: string;
    user: string;
    password: string;
    authorization: { Authorization: string; "Content-Type": string; };

    constructor(dbhost: string, user: string, password: string) {
        this.dbhost = dbhost;
        // this.commandurl = '/command/bgraph_test/sql/-/-1'
        this.baseurl = `http://${dbhost}:2480`
        this.user = user;
        this.password = password;
        const authString = Base64.encode(`${this.user}:${this.password}`)
        this.authorization = {
            "Authorization": `Basic ${authString}`,
            "Content-Type": "application/json;charset=utf-8",
        }
    }

    connect(dbname: string) {
        this.dbname = dbname;
        this.commandurl = `http://${this.dbhost}:2480/command/${this.dbname}/sql/-/-1`;
    }


    public async getLibraries(): Promise<DiscoLibrary[]> {
        const query: CommandQuery = {
            command: `select from library`,
            parameters: []
        };
        const results = await this.doGraphQuery(query);
        let ret: DiscoLibrary[] = [];
        results.graph.vertices.forEach(l => ret.push(l as DiscoLibrary));
        return ret;
    }

    public async getFunctions(librid: RID_T): Promise<DiscoFunction[]> {
        const query: CommandQuery = {
            command: 'select from function where library=?',
            parameters: [librid]
        };
        const results = await this.doGraphQuery(query);
        let ret: DiscoFunction[] = [];
        results.graph.vertices.forEach(l => ret.push(l as DiscoFunction));
        return ret;
    }

    public async traverseFromFunction(funcrid: RID_T): Promise<GraphQueryResult> {
        // const q = "traverse out('has_block', 'block_edge', 'callgraph_edge') from ?"
        const q = "traverse in('block_edge', 'has_block', 'has_function') from (traverse out('block_edge', 'callgraph_edge', 'has_block', 'has_function') from ?) limit 5000";
        const query: CommandQuery = {
            command: q,
            parameters: [funcrid]
        };
        const results = await this.doGraphQuery(query);
        return results;
    }

    public async getMetadata(): Promise<MetaData> {
        try {
            let metadata: Promise<MetaData>
            let url = this.baseurl + '/database/' + this.dbname;
            let response = await fetch(url, {
                method: 'get',
                mode: "cors",
                headers: this.authorization
            })
            metadata = response.json()
            return await metadata
        } catch (err) {
            throw err
        }
    }

    public async get_databases(): Promise<string[]> {
        let url = this.baseurl + '/listDatabases';
        let response = await fetch(url, {
            method: 'get',
            mode: "cors",
            headers: this.authorization
        });
        if (!response.ok) {
            throw new Error('get_databases network error:' + response.status + response.statusText);
        }
        const data = await response.json();
        return data['databases'] as string[];
    }

    listPropertiesForClass(clazz: string): OProperty[] {
        let classes = this.metadata['classes'];
        let fields: OProperty[] = [];
        let props: OProperty[] | undefined;
        try {
            for (let entry in classes) {
                if (clazz.toUpperCase() === classes[entry].name.toUpperCase()) {
                    props = classes[entry]['properties'];
                    if (!props || props.length === 0) continue;
                    for (let f in props) {
                        fields.push(props[f]);
                    };
                    break;
                }
            }
            return fields;
        } catch (err) {
            throw err;
        }
    }

    async getRecord(rid: RID_T): Promise<QueryResultRecord | undefined> {
        const query: CommandQuery = {
            command: `select from ${rid}`,
            parameters: []
        };
        const results = await this.doQuery(query);
        let ret: QueryResultRecord | undefined;
        if (!results.result) {
            return undefined;
        }
        results.result.length ? ret = results.result[0] : undefined;
        return ret;
    }

    async name_for_rid(real_rid: RID_T): Promise<string> {
        const result = await this.getRecord(real_rid);
        let name: string = "No Name";
        if (result === undefined) {
            name = `Query Failed for rid ${real_rid}`;
        } else if (result.name) {
            name = result.name;
        }
        return name;
    }

    make_node(rid: string, node_type: string, name: string): SNodeSchema {
        return {
            id: rid,
            type: node_type,
            // height: 30,
            // width: 120,
            children: [],
            // edges: [],
            // name: name,
            // expanded: false,
            // labels: [
            //     {
            //         id: "label_" + rid,
            //         text: name,
            //         type: 'elklabel',
            //         name: name
            //     }
            // ]
        };
    }


    async doGraphQuery(query: CommandQuery): Promise<GraphQueryResult> {
        query.mode = 'graph';
        let fetchData: RequestInit = {
            method: 'POST',
            body: JSON.stringify(query),
            mode: "cors",
            headers: this.authorization
        };
        const commandurl = `http://${this.dbhost}:2480/command/${this.dbname}/sql/-/-1`;
        const response: Response = await fetch(commandurl, fetchData);
        if (!response.ok) {
            throw new Error('doGraphQuery network error:' + response.status + response.statusText);
        }
        const ret = await response.json();
        return ret;
    }

    async doQuery(query: CommandQuery): Promise<QueryResult> {
        // query.mode = 'graph';
        let fetchData: RequestInit = {
            method: 'POST',
            body: JSON.stringify(query),
            mode: "cors",
            headers: this.authorization
        };
        const commandurl = `http://${this.dbhost}:2480/command/${this.dbname}/sql/-/-1`;
        const response: Response = await fetch(commandurl, fetchData);
        if (!response.ok) {
            throw new Error('doQuery network error:' + response.status + response.statusText);
        }
        const ret = await response.json();
        return ret;
    }

    async getRidByLibraryFunctionNames(library_name: string, function_name: string): Promise<RID_T> {
        const command: CommandQuery = {
            command: "select from `function` where library.name=? and name=? limit 1",
            parameters: [library_name, function_name]
        };

        let fetchData: RequestInit = {
            method: 'POST',
            body: JSON.stringify(command),
            mode: "cors",
            headers: this.authorization
        };

        const raw_data = await (await fetch(this.commandurl, fetchData)).json();
        return raw_data['@rid'];
        // return rid;
    }
}

