// Copyright 2021, Battelle Energy Alliance, LLC

import { inject, postConstruct } from 'inversify';
import { GraphQueryResult, QueryResultRecord } from './db/db';
import {
    LocalModelSource, ActionHandlerRegistry, SelectAction, SelectAllAction, FitToScreenAction,
    Action,
    SChildElement,
    SModelElement
} from 'sprotty';
import { IGraphGenerator } from './graph-generator';
import { DiscoEdge, DiscoNode } from './sprotty-model';
import { isNode, isEdge } from './sprotty-schema';


export class DiscoModelSource extends LocalModelSource {

    loadIndicator: (loadStatus: boolean) => void = () => { };

    @inject(IGraphGenerator)
    public readonly graphGenerator: IGraphGenerator;

    @postConstruct()
    protected postConstruct(): void {
        this.currentRoot = {
            type: 'graph',
            id: 'npm-dependency-graph',
            children: []
        };
    }

    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(SelectAction.KIND, this);
        registry.register(SelectAllAction.KIND, this);
    }

    select(elementIds: string[]): Promise<void> {
        if (elementIds.length > 0) {
            const connected_id: string[] = [];
            // this.resolveNodes(nodes, nodes.length === 1);
            console.log('nodes selected:', elementIds);
            for (const id of elementIds) {
                let connected = this.graphGenerator.index.getConnected(id);
                connected?.edges.forEach(e => { e.selected = true; connected_id.push(e.id) });
                connected?.nodes.forEach(n => { n.selected = true; connected_id.push(n.id) });
            }
            return this.actionDispatcher.dispatch(new SelectAction(connected_id.filter(id => {
                const element = this.graphGenerator.index.getById(id);
                // return !element.hidden;
                return (isNode(element) || isEdge(element)) && !element.hidden;
            })));
        } else {
            return Promise.resolve();
        }
    }

    async createNode(dbname: string, record: QueryResultRecord): Promise<void> {
        const isNew = this.graphGenerator.index.getById(name) === undefined;
        const node = this.graphGenerator.generateNode(dbname, record);
        if (isNew) {
            this.loadIndicator(true);
            await this.updateModel();
            this.loadIndicator(false);
        }
        this.select([node.id]);
    }

    center(elementIds: string[]): Promise<void> {
        if (elementIds.length > 0) {
            return this.actionDispatcher.dispatch(<FitToScreenAction>{
                kind: 'fit',
                elementIds: elementIds.filter(id => {
                    const element = this.graphGenerator.index.getById(id);
                    return isNode(element) && !element.hidden;
                }),
                padding: 20,
                maxZoom: 1,
                animate: true
            });
        } else {
            return Promise.resolve();
        }
    }

    clear(): Promise<void> {
        const gen = this.graphGenerator;
        gen.blocknodes.forEach(n => gen.index.remove(n));
        gen.blocknodes.splice(0, gen.blocknodes.length);
        gen.funcnodes.forEach(n => gen.index.remove(n));
        gen.libnodes.splice(0, gen.funcnodes.length);
        gen.libnodes.forEach(n => gen.index.remove(n));
        gen.libnodes.splice(0, gen.libnodes.length);
        gen.edges.forEach(e => gen.index.remove(e));
        gen.edges.splice(0, gen.edges.length);
        // this.graphFilter.setFilter('');
        return this.updateModel();
    }

    private filter_edges(edges: DiscoEdge[]): DiscoEdge[] {
        const gen = this.graphGenerator;
        edges.filter(e => {
            const source = gen.index.getById(e.sourceId);
            if (isNode(source) && source.hidden)
                return false;
            const target = gen.index.getById(e.targetId);
            if (isNode(target) && target.hidden)
                return false;
            return true;
        });
        return edges;
    }

    updateModel(): Promise<void> {
        const gen = this.graphGenerator;
        const nodes = gen.libnodes.filter(n => !n.hidden) as SChildElement[];
        let edges = this.filter_edges(gen.edges) as SChildElement[];
        const unique = new Set(nodes.concat(edges));
        this.currentRoot.children = Array.from(unique.values()) as SModelElement[];
        return super.updateModel();
    }


    // async filter(text: string): Promise<void> {
    //     this.loadIndicator(true);

    //     this.graphFilter.setFilter(text);
    //     this.graphFilter.refresh(this.graphGenerator);
    //     this.actionDispatcher.dispatch(new SelectAllAction(false));
    //     const center = this.graphGenerator.nodes.filter(n => !n.hidden).map(c => c.id);
    //     await this.updateModel();

    //     this.loadIndicator(false);
    //     this.center(center);
    // }

    handle(action: Action): void {
        switch (action.kind) {
            case SelectAction.KIND:
                this.handleSelect(action as SelectAction);
                break;
            case SelectAllAction.KIND:
                this.handleSelectAll(action as SelectAllAction);
                break;
            default:
                super.handle(action);
        }
    }

    protected handleSelect(action: SelectAction) {
        const nodes: SModelElement[] = [];
        action.selectedElementsIDs.forEach(id => {
            const element = this.graphGenerator.index.getById(id);
            // if (element && element.type === 'node')
            if (element)
                nodes.push(element as SModelElement);
        });
        if (nodes.length > 0) {
            console.log('nodes selected:', nodes);
        }
    }

    protected handleSelectAll(action: SelectAllAction) {
        if (action.select) {
            const nodes: DiscoNode[] = [];
            this.graphGenerator.index.all().forEach(element => {
                if (element.type === 'node')
                    nodes.push(element as DiscoNode);
            });
            if (nodes.length > 0) {
                console.log('nodes selected:', nodes);
            }
        }
    }

    runCFGDiagram(dbname: string, queryGraph: GraphQueryResult, func_name: string): void {
        console.log('our funcid: ', func_name);
        this.loadIndicator(true);
        let bounding_box: ClientRect | null;
        let sprotty: HTMLElement | null;
        if (!this.currentRoot.children) {
            this.currentRoot.children = [];
        }
        if (document) {
            sprotty = document.getElementById("sprotty");

            if (!sprotty) {
                sprotty = document.createElement("sprotty");
            }
            bounding_box = sprotty.getBoundingClientRect();
            if (!bounding_box) {
                throw "runCFGDiagram(): Could not get a bounding box";
            }
        }
        else {
            throw "runCFGDiagram(): No Document!!!";
        }
        console.log('Found ', queryGraph.graph.vertices.length, ' nodes and ', queryGraph.graph.edges.length, ' edges');
        // add library nodes
        const libs: QueryResultRecord[] = [];
        const funcs: QueryResultRecord[] = [];
        const blocks: QueryResultRecord[] = [];
        for (const record of queryGraph.graph.vertices) {
            const rec_type = record["@class"];
            switch (rec_type) {
                case "library":
                    libs.push(record);
                    break;
                case "function":
                    funcs.push(record);
                    break;
                case "block":
                    blocks.push(record);
                    break;

            }
        }
        const libnodes = {};
        const funcnodes = {};
        const blocknodes = {};
        let n: DiscoNode;
        libs.forEach(l => {
            n = this.graphGenerator.generateNode(dbname, l);
            libnodes[n.id] = n;
        });
        funcs.forEach(l => {
            n = this.graphGenerator.generateNode(dbname, l);
            // console.log('our node: ', n);
            if(func_name == n.name){
                console.log('matched on: ', func_name);
                n.hidden=false;
                console.log(n);
            }else{
                n.hidden=true;
            }
            funcnodes[n.id] = n;
        });
        console.log(funcnodes);
        blocks.forEach(l => {
            n = this.graphGenerator.generateNode(dbname, l);
            blocknodes[n.id] = n;
        });

        for (const edge of queryGraph.graph.edges) {
            this.graphGenerator.generateEdge(dbname, edge);
        }

        this.updateModel().then(() => {
            const center = this.graphGenerator.funcnodes.filter(n => !n.hidden).map(c => c.id);
            this.center(center)
            this.loadIndicator(false);

        })
    }
}
