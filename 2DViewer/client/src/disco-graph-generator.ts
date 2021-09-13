// Copyright 2021, Battelle Energy Alliance, LLC

import { injectable } from 'inversify';
import { IGraphGenerator } from "./graph-generator";
import { DiscoModelIndex } from "./dicos-model-index";
import { QueryResultRecord, make_id } from './db';
import { DiscoNode, DiscoEdge, DiscoNodeFactory, DiscoEdgeFactory } from './sprotty-model';



@injectable()
export class DiscoGraphGenerator implements IGraphGenerator {
    libnodes: DiscoNode[] = [];
    funcnodes: DiscoNode[] = [];
    blocknodes: DiscoNode[] = [];
    edges: DiscoEdge[] = [];
    readonly index = new DiscoModelIndex();

    generateNode(dbname: string, record: QueryResultRecord): DiscoNode {
        const rid = make_id(dbname, record["@rid"]!);
        let node = this.index.getById(rid) as DiscoNode;
        if (node === undefined) {
            node = this.createNode(dbname, record);
            this.index.add(node);
            // this.nodes.push(node);
            const rec_type = record["@class"];
            switch (rec_type) {
                case "library":
                    this.libnodes.push(node);
                    // this.index.setParent()
                    break;
                case "function":
                    this.funcnodes.push(node);
                    const lib_id = make_id(dbname, record['library']);
                    let parent = this.index.getById(lib_id) as DiscoNode;
                    if (parent && parent.children) {
                        parent.children.push(node);
                        this.index.setContainer(parent, node);
                    }
                    break;
                case "block":
                    this.blocknodes.push(node);
                    const func_id = make_id(dbname, record['function']);
                    parent = this.index.getById(func_id) as DiscoNode;
                    if (parent && parent.children) {
                        parent.children.push(node);
                        this.index.setContainer(parent, node);
                    }
                    break;
            }
        }
        return node;
    }

    private createNode(dbname: string, record: QueryResultRecord): DiscoNode {
        const name = record.name ? record.name : 'No Name';
        const id = make_id(dbname, record["@rid"]);
        const ret = DiscoNodeFactory(id, name, `node:${record["@class"]}`);
        return ret as DiscoNode;
    }

    generateEdge(dbname: string, record: QueryResultRecord): DiscoEdge | undefined {
        const cls = record["@class"];
        if (cls === 'has_function' || cls === 'has_block') {
            return;
        }
        const rid = make_id(dbname, record["@rid"]!);
        let edge = this.index.getById(rid) as DiscoEdge;
        if (edge === undefined) {
            edge = this.createEdge(dbname, record);
            const target_node = this.index.getById(edge.targetId) as DiscoNode;
            const source_node = this.index.getById(edge.sourceId) as DiscoNode;
            if (!target_node) {
                console.error(`couldn't find call target ${edge.targetId}`);
                return;
            }
            if (!source_node) {
                console.error(`couldn't find call source ${edge.sourceId}`);
                return;
            }
            this.index.add(edge);
            switch (cls) {
                case 'branch_true':
                case 'branch_false':
                case 'branch_unconditional':
                    const parentFunc = this.funcnodes.find((element) => element.children!.find((child) => edge.sourceId === child.id));
                    // console.log(`Branch edge ${edge.id} for func ${parentFunc?.id} ${parentFunc?.name}` );
                    parentFunc?.children?.push(edge);
                    break;
                case 'calls':
                    if (target_node.cls === 'node:function') {
                        console.log(`Call edge ${edge.id}: ${edge.sourceId} into func ${target_node?.id} ${target_node.name}`);
                        this.edges.push(edge);
                        // parentFunc?.children?.push(edge);
                    } else {
                        console.log(`UNHANDLED Call edge ${edge} ${edge.sourceId} into ${target_node.cls}: ${target_node?.id} ${target_node.name} `);
                    }
                    break;
                default:
                    console.log(`Default edge ${edge.id} into ${target_node.cls}: ${target_node?.id} ${target_node.name}`);
                    this.edges.push(edge);
            }
        }
        return edge;
    }

    private createEdge(dbname: string, record: QueryResultRecord): DiscoEdge {
        // const name = record.name ? record.name : 'No Name';
        const id = make_id(dbname, record["@rid"]);
        const out_id = make_id(dbname, record.out!);
        const in_id = make_id(dbname, record.in!);
        const cls = `edge:${record["@class"]}`
        const edge = DiscoEdgeFactory(id, cls, out_id, in_id);
        return edge as DiscoEdge;
    }
}