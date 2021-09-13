// Copyright 2021, Battelle Energy Alliance, LLC

import { QueryResultRecord, RID_T } from './db';
import { SShapeElementSchema, SEdgeSchema, Point, Dimension, SModelElementSchema, ModelLayoutOptions } from 'sprotty';


export class DiscoSprottyNode implements SShapeElementSchema {
    // rid: RID_T;
    name: string;
    cls: string;
    position?: Point | undefined;
    size?: Dimension | undefined;
    children?: SModelElementSchema[] | undefined;
    layoutOptions?: ModelLayoutOptions | undefined;
    type: string;
    id: string;
    cssClasses?: string[] | undefined;

    constructor(rid: RID_T, name: string, cls: string) {
        this.id = rid;
        this.name = name;
        this.cls = cls;
        this.type = 'node';
        this.children = [];
        this.size = { height: 30, width: 130 }
    }

}

export class DiscoSprottyEdge implements SEdgeSchema {
    cls: string;
    sourceId: string;
    targetId: string;
    routerKind?: string | undefined;
    routingPoints?: Point[] | undefined;
    selected?: boolean | undefined;
    hoverFeedback?: boolean | undefined;
    opacity?: number | undefined;
    type: string;
    id: string;
    children?: SModelElementSchema[] | undefined;
    cssClasses?: string[] | undefined;

    constructor(rid: RID_T, cls: string, source: RID_T, target: RID_T) {
        this.id = rid;
        this.cls = cls;
        this.sourceId = source;
        this.targetId = target;
        this.type = 'edge';
        this.children = [];
    }
}

export function format_rid(rid: RID_T): string {
    return rid.replace('#', '').replace(':', '_');
}

// export function unformat_rid(ridlike: string): RID_T | undefined {
//     let ret: RID_T | undefined;
//     ridlike.indexOf('N_') === 0 ? ret = ridlike.replace('N_', '#').replace('_', ':') : ret = undefined;
//     ridlike.indexOf('E_') === 0 ? ret = ridlike.replace('E_', '#').replace('_', ':') : ret = undefined;
//     return ret;
// }

export function make_id(dbname, rid: RID_T): string {
    return `${dbname}_${format_rid(rid)}`;
}

export function queryVertex_to_json(dbname: string, record: QueryResultRecord): DiscoSprottyNode {
    const name = record.name ? record.name : 'No Name';
    const id = make_id(dbname, record["@rid"]);
    const ret = new DiscoSprottyNode(id, name, `node:${record["@class"]}`);
    return ret;
}

export function queryEdge_to_json(dbname: string, record: QueryResultRecord): DiscoSprottyEdge {
    const id = make_id(dbname, record["@rid"]);
    const out_id = make_id(dbname, record.out!);
    const in_id = make_id(dbname, record.in!);
    const cls = `edge:${record["@class"]}`
    return new DiscoSprottyEdge(id, cls, out_id, in_id);
}


