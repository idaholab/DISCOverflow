// Copyright 2021, Battelle Energy Alliance, LLC

import * as snabbdom from "snabbdom-jsx";
import { injectable } from "inversify";
import { VNode } from "snabbdom/vnode";
import {
    RenderingContext, SEdge, IView, PolylineEdgeView, RectangularNodeView, CircularNodeView,
    Point, toDegrees, SLabel, angleOfPoint, SShapeElement
} from "sprotty";
import { DiscoNode, DiscoPort, DiscoJunction, Icon } from "./sprotty-model";

const JSX = { createElement: snabbdom.svg };

@injectable()
export class DiscoNodeView extends RectangularNodeView {
    render(node: DiscoNode, context: RenderingContext): VNode {
        return <g>
            <rect class-elknode={true}
                class-elknode-binary={node['cls'] === "node:library"}
                class-elknode-function={node['cls'] === "node:function"}
                class-elknode-block={node['cls'] === "node:block"}
                class-mouseover={node.hoverFeedback}
                class-selected={node.selected}
                x="0" y="0" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class DiscoPortView extends RectangularNodeView {
    render(port: DiscoPort, context: RenderingContext): VNode {
        return <g>
            <rect class-elkport={true} class-mouseover={port.hoverFeedback} class-selected={port.selected}
                x="0" y="0" width={port.bounds.width} height={port.bounds.height}></rect>
            {context.renderChildren(port)}
        </g>;
    }
}

@injectable()
export class DiscoEdgeView extends PolylineEdgeView {
    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0];
        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }
        return <path class-elkedge={true}
            class-edge-branch_true={edge['cls'] === "edge:branch_true"}
            class-edge-branch_false={edge['cls'] === "edge:branch_false"}
            class-edge-branch_unconditional={edge['cls'] === "edge:branch_unconditional"}
            class-edge-calls={edge['cls'] === "edge:calls"}
            d={path} />;
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-edge={true}
                class-edge-branch_true={edge['cls'] === "edge:branch_true"}
                class-edge-branch_false={edge['cls'] === "edge:branch_false"}
                class-edge-branch_unconditional={edge['cls'] === "edge:branch_unconditional"}
                class-edge-calls={edge['cls'] === "edge:calls"}
                class-arrow={true} d="M 0,0 L 8,-3 L 8,3 Z"
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        ];
    }
}

export class DiscoEdgeTrueView extends PolylineEdgeView {
    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0];
        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }
        return <path class-edge-branch_true={true} d={path} />;
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-edge-branch_true={true} class-arrow={true} d="M 0,0 L 8,-3 L 8,3 Z"
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        ];
    }
}

export class DiscoEdgeCallView extends PolylineEdgeView {
    protected renderLine(edge: SEdge, segments: Point[], context: RenderingContext): VNode {
        const firstPoint = segments[0];
        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length; i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }
        return <path class-edge-calls={true} d={path} />;
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-edge-calls={true} class-arrow={true} d="M 0,0 L 8,-3 L 8,3 Z"
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        ];
    }
}

@injectable()
export class DiscoLabelView implements IView {
    render(label: SLabel, context: RenderingContext): VNode {
        return <text class-elklabel={true}>{label.text}</text>;
    }
}

@injectable()
export class DiscoJunctionView extends CircularNodeView {
    render(node: DiscoJunction, context: RenderingContext): VNode {
        const radius = this.getRadius(node);
        return <g>
            <circle class-elkjunction={true} r={radius}></circle>
        </g>;
    }

    protected getRadius(node: DiscoJunction): number {
        return 2;
    }
}

@injectable()
export class DiscoPopupView extends RectangularNodeView {
    render(model: SShapeElement, context: RenderingContext): VNode {
        const ret = <svg>
            {/* <rect class-sprotty-node={true}
                x={position.x} y={position.y} rx="8" ry="8" width={model.size.width} height={model.size.height}>
            </rect> */}
            {context.renderChildren(model)}
        </svg>
        return ret;
    }
}

@injectable()
export class DiscoIconView implements IView {

    render(element: Icon, context: RenderingContext): VNode {
        const radius = this.getRadius();
        return <g>
            <circle class-sprotty-icon={true} r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(element)}
        </g>;
    }

    getRadius() {
        return 16;
    }
}