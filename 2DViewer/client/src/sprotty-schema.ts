// Copyright 2021, Battelle Energy Alliance, LLC

import {
    IModelLayoutEngine, SEdgeSchema, SGraphSchema, SModelElementSchema, SModelIndex,
    SModelRootSchema, SNodeSchema
} from "sprotty";

export interface PopupSchema extends SModelRootSchema {
    kind: string;
    target: string;
}

export interface DiscoLayoutEngine extends IModelLayoutEngine {
    layout(model: SModelRootSchema, index?: SModelIndex<SModelElementSchema>): Promise<SModelRootSchema>;
}


export interface DiscoGraphSchema extends SGraphSchema {
}

export interface DiscoModelElementSchema extends SModelElementSchema {
    hidden: boolean;
    cls: string;
    name?: string;
};


export interface DiscoNodeSchema extends DiscoModelElementSchema, SNodeSchema {
    hidden: boolean;
    cls: string;
    name: string;
    children: DiscoModelElementSchema[];
}

export interface DiscoEdgeSchema extends DiscoModelElementSchema, SEdgeSchema {
    sourceId: string;
    targetId: string;
}

export type DiscoElement = DiscoNodeSchema | DiscoEdgeSchema;

export function isNode(element?: SModelElementSchema): element is DiscoNodeSchema {
    return element !== undefined && element.type === 'node';
}

export function isEdge(element?: SModelElementSchema): element is DiscoEdgeSchema {
    return element !== undefined && element.type === 'edge';
}
