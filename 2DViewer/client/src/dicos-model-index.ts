// Copyright 2021, Battelle Energy Alliance, LLC

import { SGraphIndex } from 'sprotty';
import { DiscoNode, DiscoEdge } from './sprotty-model';

export class DiscoModelIndex extends SGraphIndex {
    private id2parent: Map<string, DiscoNode|DiscoEdge|undefined> = new Map();

    add(element: DiscoNode|DiscoEdge): void {
        super.add(element);
        if (element.children !== undefined ) {
            for (const child of element.children) {
                this.id2parent.set(child.id, element);
            }
        }
    }

    remove(element: DiscoNode|DiscoEdge): void {
        if (element.children !== undefined && element.children.constructor === Array) {
            for (const child of element.children) {
                this.id2parent.delete(child.id);
            }
        }
        super.remove(element);
    }

    getContainer(id: string): DiscoNode|DiscoEdge|undefined {
        return this.id2parent.get(id);
    }

    setContainer(parent: DiscoNode, child: DiscoNode) {
        this.id2parent.set(child.id, parent);
    }

    getParentNodes(id: string): DiscoNode[] {
        let parent_nodes: DiscoNode[];
        const node = this.getById(id);
        if (!node) return [];
        if (node instanceof DiscoNode){
            let in_edges = this.getIncomingEdges(node);
            parent_nodes = Array.from(in_edges.map(e => this.getById(e.sourceId)!)) as DiscoNode[];
            return parent_nodes;
        } 
        return [];
    }

    getChildNodes(id: string): DiscoNode[] {
        let parent_nodes: DiscoNode[];
        const node = this.getById(id);
        if (!node) return [];
        if (node instanceof DiscoNode){
            let out_edges = this.getOutgoingEdges(node);
            parent_nodes = Array.from(out_edges.map(e => this.getById(e.targetId)!)) as DiscoNode[];
            return parent_nodes;
        } 
        return [];
    }

    getConnected(id: string):  { edges: DiscoEdge[]; nodes: DiscoNode[]; } {
        const node = this.getById(id) as DiscoNode;
        const ret = { edges: [] as DiscoEdge[],  nodes: [] as DiscoNode[]};
        if (node === undefined){
            return ret;
        }
        let in_edges = Array.from(this.getIncomingEdges(node));
        let parent_nodes: DiscoNode[] = this.getParentNodes(node.id);
        let out_edges = Array.from(this.getOutgoingEdges(node));
        let child_nodes = this.getChildNodes(node.id);
        ret.edges = in_edges.concat(out_edges) as DiscoEdge[];
        ret.nodes = parent_nodes.concat(child_nodes)
        return ret;
    }
}
