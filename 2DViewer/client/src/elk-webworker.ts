// Copyright 2021, Battelle Energy Alliance, LLC

import ElkConstructor from 'elkjs/lib/elk-api';
import { ElkFactory } from 'sprotty-elk';

const elkFactory: ElkFactory = () => new ElkConstructor({
    workerUrl: 'elk-latest/elk-worker.js',
    algorithms: ['layered'],
    defaultLayoutOptions: { hierarchyHandling: "INCLUDE_CHILDREN" }
});

export default elkFactory;
