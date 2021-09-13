// Copyright 2021, Battelle Energy Alliance, LLC

import { injectable } from 'inversify';
import { LayoutOptions } from 'elkjs/lib/elk-api';
import { SGraphSchema, SModelIndex, SModelElementSchema } from 'sprotty';
import { DefaultLayoutConfigurator } from 'sprotty-elk';

@injectable()
export class DiscoLayoutConfigurator extends DefaultLayoutConfigurator {

    protected graphOptions(sgraph: SGraphSchema, index: SModelIndex<SModelElementSchema>): LayoutOptions {
        return {
            'elk.algorithm': 'layered',
            'elk.direction': 'DOWN',
            // 'elk.edgeRouting': 'POLYLINE'
            "hierarchyHandling": "INCLUDE_CHILDREN",
        }
    }

}
