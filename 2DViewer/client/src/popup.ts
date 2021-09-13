// Copyright 2021, Battelle Energy Alliance, LLC

import { injectable } from "inversify";
import {
    SModelRootSchema, PreRenderedElementSchema, IPopupModelProvider, RequestPopupModelAction, SNodeSchema
} from "sprotty";

@injectable()
export class PopupModelProvider implements IPopupModelProvider {

    getPopupModel(request: RequestPopupModelAction, element?: SNodeSchema): SModelRootSchema | undefined {
        // let label = '';
        if (element !== undefined) {
            // if (element.children){
            //     element.children.forEach(e => {
            //         if (e.type == 'label') {
            //             label += (e as SLabelSchema).text + ' ';
            //         }
            //     })
            // }
            return {
                type: 'html',
                id: 'popup',
                children: [
                    <PreRenderedElementSchema>{
                        type: 'pre-rendered',
                        id: 'popup-title',
                        code: `<div class="sprotty-popup-title">${element['cls'].split(':')[1]}</div>`
                    },
                    <PreRenderedElementSchema>{
                        type: 'pre-rendered',
                        id: 'popup-body',
                        code: `<div class="sprotty-popup-body">${element['name']}</div>`
                    }
                ]
            };
        }
        return undefined;
    }

}
