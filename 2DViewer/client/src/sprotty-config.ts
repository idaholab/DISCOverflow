// Copyright 2021, Battelle Energy Alliance, LLC

import { Container, ContainerModule, interfaces } from "inversify";
import {
    TYPES, SGraphView, ConsoleLogger, LogLevel, SvgExporter, configureModelElement,
    SGraph, SGraphFactory, SLabel, PreRenderedElement, PreRenderedView, HtmlRoot, HtmlRootView, SLabelView, loadDefaultModules
} from "sprotty";
import { elkLayoutModule, ILayoutConfigurator } from 'sprotty-elk';
import { DiscoNodeView, DiscoPortView, DiscoEdgeView, DiscoLabelView, DiscoJunctionView, DiscoIconView } from "./views";
import { DiscoNode, DiscoPort, DiscoEdge, DiscoJunction, Icon } from "./sprotty-model";
import { PopupModelProvider } from "./popup";
import { IGraphGenerator } from "./graph-generator";
import { DiscoModelSource } from "./disco-model-source";
import { DiscoGraphGenerator } from "./disco-graph-generator";
import { DiscoLayoutConfigurator } from './graph-layout';
import { DiscoMouseListener } from './disco-mouse';

class FilteringSvgExporter extends SvgExporter {
    protected isExported(styleSheet: CSSStyleSheet): boolean {
        return styleSheet.href !== null && (styleSheet.href.endsWith('diagram.css') || styleSheet.href.endsWith('sprotty.css'));
    }
}

export default (additionalBindings?: interfaces.ContainerModuleCallBack) => {
    const elkGraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
        bind(IGraphGenerator).to(DiscoGraphGenerator).inSingletonScope();
        bind(TYPES.ModelSource).to(DiscoModelSource).inSingletonScope();
        rebind(ILayoutConfigurator).to(DiscoLayoutConfigurator);
        rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
        rebind(TYPES.SvgExporter).to(FilteringSvgExporter).inSingletonScope();
        bind(TYPES.IPopupModelProvider).to(PopupModelProvider);
        bind(TYPES.MouseListener).to(DiscoMouseListener);

        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'graph', SGraph, SGraphView);
        configureModelElement(context, 'node', DiscoNode, DiscoNodeView);
        configureModelElement(context, 'port', DiscoPort, DiscoPortView);
        configureModelElement(context, 'icon', Icon, DiscoIconView);
        configureModelElement(context, 'label:icon', SLabel, SLabelView);
        configureModelElement(context, 'edge', DiscoEdge, DiscoEdgeView);
        configureModelElement(context, 'label', SLabel, DiscoLabelView);
        configureModelElement(context, 'junction', DiscoJunction, DiscoJunctionView);
        configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
        if (additionalBindings) {
            additionalBindings(bind, unbind, isBound, rebind);
        };
    });

    const container = new Container();
    loadDefaultModules(container);
    container.load(elkLayoutModule, elkGraphModule);
    return container;
}
