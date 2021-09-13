// Copyright 2021, Battelle Energy Alliance, LLC

import { SModelElement, Action, findParentByFeature, isSelectable, ButtonHandlerRegistry, SButton, SModelRoot, isCtrlOrCmd, SRoutableElement, SelectAction, SwitchEditModeAction, SelectMouseListener, FitToScreenAction } from "sprotty";
import { inject, optional } from "inversify";
import { toArray } from "sprotty/lib/utils/iterable";
import { DiscoEdge, DiscoNode } from './sprotty-model'


export class DiscoMouseListener extends SelectMouseListener {
    wasSelected = false;
    hasDragged = false;
    constructor(@inject(ButtonHandlerRegistry) @optional() protected buttonHandlerRegistry: ButtonHandlerRegistry) {
        super();
    }
    mouseDown(target: SModelElement, event: WheelEvent): Action[] {
        const result: Action[] = [];
        if (event.button === 0) {
            if (this.buttonHandlerRegistry !== undefined && target instanceof SButton && target.enabled) {
                const buttonHandler = this.buttonHandlerRegistry.get(target.type);
                if (buttonHandler !== undefined)
                    return buttonHandler.buttonPressed(target);
            }

            const selectableTarget = findParentByFeature(target, isSelectable);
            if (selectableTarget !== undefined || target instanceof SModelRoot) {
                this.hasDragged = false;
                let deselect: SModelElement[] = [];
                // multi-selection?
                if (!isCtrlOrCmd(event)) {
                    deselect = toArray(target.root.index.all()
                        .filter(element => isSelectable(element) && element.selected
                            && !(selectableTarget instanceof SRoutableElement && element === selectableTarget.parent as SModelElement)));
                }
                if (selectableTarget !== undefined) {
                    if (!selectableTarget.selected) {
                        this.wasSelected = false;
                        result.push(new SelectAction([selectableTarget.id], deselect.map(e => e.id)));
                        if (selectableTarget instanceof DiscoEdge) {
                            result.push(new SelectAction([selectableTarget.sourceId], []));
                            result.push(new SelectAction([selectableTarget.targetId], []));
                            // selectableTarget.target.selected = true;
                        } else if (selectableTarget instanceof DiscoNode) {
                            for (const e of Array.from(selectableTarget.incomingEdges)) {
                                result.push(new SelectAction([e.id], []));
                                if (e !== undefined && e.source !== undefined) {
                                    result.push(new SelectAction([e.sourceId], []));
                                }
                            }
                            for (const e of Array.from(selectableTarget.outgoingEdges)) {
                                result.push(new SelectAction([e.id], []));
                                if (e !== undefined && e.target !== undefined) {
                                    result.push(new SelectAction([e.targetId], []));
                                }
                            }
                        }
                        const routableDeselect = deselect.filter(e => e instanceof SRoutableElement).map(e => e.id);
                        if (selectableTarget instanceof SRoutableElement)
                            result.push(new SwitchEditModeAction([selectableTarget.id], routableDeselect));
                        else if (routableDeselect.length > 0)
                            result.push(new SwitchEditModeAction([], routableDeselect));
                    } else if (isCtrlOrCmd(event)) {
                        this.wasSelected = false;
                        result.push(new SelectAction([], [selectableTarget.id]));
                        if (selectableTarget instanceof SRoutableElement)
                            result.push(new SwitchEditModeAction([], [selectableTarget.id]));
                    } else {
                        this.wasSelected = true;
                    }
                } else {
                    result.push(new SelectAction([], deselect.map(e => e.id)));
                    const routableDeselect = deselect.filter(e => e instanceof SRoutableElement).map(e => e.id);
                    if (routableDeselect.length > 0)
                        result.push(new SwitchEditModeAction([], routableDeselect));
                }
            }
        }
        return result;
    }

    doubleClick(target: SModelElement, event: WheelEvent): Action[] {
        const result: Action[] = [];
        const selectableTarget = findParentByFeature(target, isSelectable);
        if (selectableTarget === undefined) return [];
        // let result = this.mouseDown(selectableTarget, event);
        const selected = toArray(selectableTarget.root.index.all()
            .filter(element => isSelectable(element) && element.selected
                && !(selectableTarget instanceof SRoutableElement)))
            .map(e => e.id);
        // result.push(new FitToScreenAction(selected, 20, 3, true));
        result.push(new FitToScreenAction(selected, 0, 3, true));
        return result;
    }
}