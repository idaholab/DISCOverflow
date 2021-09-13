// Copyright 2021, Battelle Energy Alliance, LLC

import { QueryResultRecord, } from './db';
import { DiscoModelIndex } from './dicos-model-index';
import { DiscoNode, DiscoEdge } from './sprotty-model';

export interface IGraphGenerator {

    readonly libnodes: DiscoNode[];
    readonly funcnodes: DiscoNode[];
    readonly blocknodes: DiscoNode[];
    readonly edges: DiscoEdge[];
    readonly index: DiscoModelIndex;

    generateNode(dbname: string, record: QueryResultRecord): DiscoNode;

    generateEdge(dbname: string, record: QueryResultRecord): DiscoEdge | undefined;
}

export const IGraphGenerator = Symbol('IGraphGenerator');