// Copyright 2021, Battelle Energy Alliance, LLC

import {
    SNode, RectangularNode, RectangularPort,
    moveFeature, selectFeature, hoverFeedbackFeature, SEdge, editFeature, SShapeElement,
    boundsFeature, layoutContainerFeature, layoutableChildFeature, fadeFeature, Expandable,
    Nameable, Selectable, SLabel
} from "sprotty";
import { RID_T } from "./db";

export class DiscoNode extends RectangularNode implements Expandable, Nameable, Selectable { //, Connectable {
    expanded: boolean = false;
    cls: string;
    hidden: boolean = false;
    name: string;

    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export function DiscoNodeFactory(rid: RID_T, name: string, cls: string) {
    const node = new DiscoNode();
    node.id = rid;
    node.name = name;
    const name_label = new SLabel();
    name_label.text = name;
    name_label.type = 'label';
    name_label.id = `label_${rid}`;
    node.children.push(name_label);
    node.cls = cls;
    node.type = 'node';
    node.size = { height: 30, width: 130 }
    return node;
}


export class DiscoPort extends RectangularPort {
    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export class DiscoEdge extends SEdge {
    cls: string;

    hasFeature(feature: symbol): boolean {
        if (feature === editFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export function DiscoEdgeFactory(rid: RID_T, cls: string, source: RID_T, target: RID_T) {
    const edge = new DiscoEdge();
    edge.id = rid;
    edge.cls = cls;
    edge.sourceId = source;
    edge.targetId = target;
    edge.type = 'edge';
    // this.children = [];
    return edge;
}

export class DiscoJunction extends SNode {
    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature || feature === selectFeature || feature === hoverFeedbackFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export class Icon extends SShapeElement {
    static readonly DEFAULT_FEATURES = [boundsFeature, layoutContainerFeature, layoutableChildFeature, fadeFeature];

    size = {
        width: 32,
        height: 32
    };
}

