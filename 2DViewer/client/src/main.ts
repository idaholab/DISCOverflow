// Copyright 2021, Battelle Energy Alliance, LLC

import 'reflect-metadata';
import 'bootstrap';
import * as jQuery from 'jquery';
import * as faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';
import * as faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import * as faGithub from '@fortawesome/fontawesome-free-brands/faGithub';
import * as faBars from '@fortawesome/fontawesome-free-solid/faBars';
import fontawesome from '@fortawesome/fontawesome';
import { TYPES, SGraphSchema } from 'sprotty/lib';
import createContainer from './sprotty-config';
import { AngrDB, GraphQueryResult, DiscoNodeType, DiscoLibrary, RID_T, DiscoFunction } from './db';
import { DiscoModelSource } from './disco-model-source';
import { ElkFactory } from 'sprotty-elk';
import elkFactory from './elk-webworker';
import * as crypto from 'crypto-js'

fontawesome.library.add(faSpinner, faExclamationCircle, faGithub, faBars);

const dbhostInput = jQuery('#dbhost-input');
const dbuserInput = jQuery('#dbuser-input');
const dbpassInput = jQuery('#dbpass-input');
const databaseInput = document.getElementById('select-database') as HTMLSelectElement;
const libraryInput = document.getElementById('select-library') as HTMLSelectElement;
const functionInput = document.getElementById('select-function') as HTMLSelectElement;
const connectButton = jQuery('#button-connect');
const clearButton = jQuery('#button-clear');
const goButton = jQuery('#button-query');
// const errorDiv = jQuery('#error');

const loadingIndicator = jQuery('#loading-indicator');
const errorIndicator = jQuery('#error-indicator');

// Create Sprotty viewer
// const sprottyContainer = createContainer();
const sprottyContainer = createContainer((bind) => {
    bind(ElkFactory).toConstantValue(elkFactory);
});
// sprottyContainer.bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();
const modelSource = sprottyContainer.get<DiscoModelSource>(TYPES.ModelSource);

modelSource.loadIndicator = loading => {
    loadingIndicator.css({ visibility: loading ? 'visible' : 'hidden' });
};

let sprottyGraph: SGraphSchema = {
    id: 'root',
    type: 'graph',
    children: []
}
modelSource.setModel(sprottyGraph);

//---------------------------------------------------------
// Manage the error indicator icon and its popup box
let errorMessageTimeout: number;
let errorVisible = false;
const setErrorMessage = (message: string) => {
    if (errorMessageTimeout)
        window.clearTimeout(errorMessageTimeout);
    errorMessageTimeout = window.setTimeout(() => {
        errorIndicator.attr({ 'data-content': message }).css({ visibility: 'visible' });
        errorVisible = true;
    }, 300);
}
const clearErrorMessage = () => {
    if (errorMessageTimeout)
        window.clearTimeout(errorMessageTimeout);
    if (errorVisible) {
        errorIndicator.css({ visibility: 'hidden' });
        errorIndicator.popover('hide');
        errorVisible = false;
    }
}
errorIndicator.popover({
    trigger: 'hover',
    placement: 'bottom'
});


function refreshLayout() {
    $('#sprotty').css('top', $('#navbar').height() + 'px');
}

interface name_rid {
    name: string;
    rid: RID_T;
}

let USER = 'root';
let PASS = 'root';
let DBHOST = "127.0.0.1";
let DATABASE: string;
let dbconnection: AngrDB;

// let libraries: name_rid[] = [];
// let functions: name_rid[] = [];
dbhostInput.focus();
connectButton.click(() => {
    DBHOST = dbhostInput.val() as string;
    USER = dbuserInput.val() as string;
    PASS = dbpassInput.val() as string;
    dbconnection = new AngrDB(DBHOST, USER, PASS);

    setDBCookieData({DBHOST: DBHOST, USER: USER, PASS: PASS})

    clear_dbinput();
    clear_libinput();
    clear_funcinput();
    // sprottyContainer.get<DiscoGraphGenerator>(IGraphGenerator).db = dbconnection;
    dbconnection.get_databases().then((result: string[]) => {
        createDBSelect(result);
        databaseInput.selectedIndex = 0;
    });
    databaseInput.focus();
});

clearButton.click(() => {
    modelSource.clear();
})

goButton.click(() => {

    const funcname = $("#select-function option:selected").text();
    const funcrid = $("#select-function option:selected").val();
    const ss = $("#select-function option:selected").text();
    console.log('FUNCTION NAME?: ', ss)
    console.log(funcname, funcrid);
    func_selected(funcname, funcrid);
})

function clear_dbinput() {
    while (databaseInput.length) {
        databaseInput.remove(0);
    };
}

function clear_libinput() {
    // libraries = [];
    while (libraryInput.length) {
        libraryInput.remove(0);
    };
}

function clear_funcinput() {
    // functions = [];
    while (functionInput.length) {
        functionInput.remove(0);
    };
}

function sort_by_name(a: DiscoNodeType, b: DiscoNodeType) {
    const a_ = a.name.toUpperCase();
    const b_ = b.name.toUpperCase();
    if (a_ < b_) return -1;
    if (a_ > b_) return 1;
    return 0;
}


dbhostInput.keyup(event => {
    // clearErrorMessage();
    if (event.keyCode === 13 || event.keyCode === 9) {
        connectButton.click();
    }
});

function createDBSelect(databases: string[]) {
    clear_dbinput();
    clear_libinput();
    clear_funcinput();
    for (const dbname of databases.sort()) {
        const opt = new Option(dbname, dbname);
        databaseInput.add(opt);
    };
    jQuery('#select-database').change(() => {
        DATABASE = databaseInput.value as string;
        console.log(DATABASE);
        dbconnection.connect(DATABASE);
        clear_libinput();
        clear_funcinput();
        dbconnection.getLibraries().then((result: DiscoLibrary[]) => {
            let libraries: name_rid[] = [];
            for (const l of result.sort(sort_by_name)) {
                libraries.push({ name: l.name, rid: l["@rid"] });
            }
            createLibSelect(libraries);
            libraryInput.selectedIndex = 0;
            libraryInput.focus();
        });

        let dbinfo = getDBCookieData()
        dbinfo["DATABASE"] = DATABASE
        setDBCookieData(dbinfo)
    });
};


function createLibSelect(libraries: name_rid[]) {
    clear_libinput();
    clear_funcinput();
    // const temp = new Option('', '');
    // libraryInput.add(temp);
    for (const librecord of libraries) {
        const opt = new Option(librecord.name, librecord.rid);
        libraryInput.add(opt);
    };
    libraryInput.selectedIndex = 0;
    libraryInput.focus();
    jQuery('#select-library').ready(() => {
        // const librid = libraries[libraryInput.selectedIndex].rid;
        const librid = libraryInput.value;
        clear_funcinput();
        dbconnection.getFunctions(librid).then((result: DiscoFunction[]) => {
            let functions: name_rid[] = [];
            for (const l of result.sort(sort_by_name)) {
                functions.push({ name: l.name, rid: l["@rid"] });
            }
            
            console.log('setting up functioninput');
            createFuncSelect(functions);
        });


        let cookieData = getDBCookieData()
        cookieData["librid"] = librid
        setDBCookieData(cookieData)
    });
    jQuery('#select-library').change(() => {
        // const librid = libraries[libraryInput.selectedIndex].rid;
        const librid = libraryInput.value;
        clear_funcinput();
        dbconnection.getFunctions(librid).then((result: DiscoFunction[]) => {
            let functions: name_rid[] = [];
            for (const l of result.sort(sort_by_name)) {
                functions.push({ name: l.name, rid: l["@rid"] });
            }
            
            console.log('setting up functioninput');
            createFuncSelect(functions);
        });

        let cookieData = getDBCookieData()
        cookieData["librid"] = librid
        setDBCookieData(cookieData)
        
    });
};


function createFuncSelect(funcs: name_rid[]) {
    while (functionInput.length) {
        functionInput.remove(0);
    };
    // const temp = new Option('', '');
    // functionInput.add(temp);
    for (const funcrecord of funcs) {
        const opt = new Option(funcrecord.name, funcrecord.rid);
        functionInput.add(opt);
    };
    functionInput.selectedIndex = 0;
    functionInput.focus();
};


function func_selected(func_name, function_id) {
    console.log(`New FUNCRID: ${function_id}`);
    clearErrorMessage();
    try {
        dbconnection.traverseFromFunction(function_id).then((graph_query_result: GraphQueryResult) => {
            modelSource.runCFGDiagram(DATABASE, graph_query_result, func_name);
        });

        let cookieData = getDBCookieData()
        cookieData['func_name'] = func_name
        cookieData['function_id'] = function_id
        setDBCookieData(cookieData)
    } catch (err) {
        setErrorMessage(err);
        console.error(err);
    }
}

jQuery('#select-database').keyup(event => {
    // clearErrorMessage();
    if (event.keyCode === 13) {
        jQuery('#select-database').change();
    }
});

jQuery('#select-library').keyup(event => {
    // clearErrorMessage();
    if (event.keyCode === 13) {
        jQuery('#select-library').change();
    }
});

jQuery('#select-function').keyup(event => {
    // clearErrorMessage();
    if (event.keyCode === 13) {
        goButton.click();
    }
});


const COOKIE_SECRET = 'apk@djcn4uin^inc(ajnw99haq'

function getDBCookieData() {
    let cookie = decodeURIComponent(document.cookie)
    let cookieString = crypto.AES.decrypt(cookie.substring("dbinfo=".length, cookie.length), COOKIE_SECRET).toString(crypto.enc.Utf8)
    console.log(cookieString)

    let dbinfo = JSON.parse(cookieString)

    return dbinfo
}

function setDBCookieData(data) {
    // Save information in cookie
    let cookieString = crypto.AES.encrypt(JSON.stringify(data), COOKIE_SECRET)
    let expDate = new Date();
    expDate.setTime(expDate.getTime() + (30*24*60*60*1000)) // Set cookie for 30 days
    //console.log(cookieString.toString())
    document.cookie = `dbinfo=${cookieString};expires=${expDate.toUTCString()};path=/;SameSite=Strict;`
    //console.log(decodeURIComponent(document.cookie))
}


window.onload = () => {
    let dbinfo = getDBCookieData()

    dbconnection = new AngrDB(dbinfo.DBHOST, dbinfo.USER, dbinfo.PASS)
    dbconnection.get_databases().then((result: string[]) => {
        createDBSelect(result);
        databaseInput.selectedIndex = 0;
        if (dbinfo.DATABASE) {
            //Get index of database
            for (var i = 0; i < databaseInput.options.length; ++i) {
                if (databaseInput.options[i].value === dbinfo.DATABASE) {
                    databaseInput.selectedIndex = i;
                }
            }
    
            dbconnection.connect(dbinfo.DATABASE)
    
            clear_libinput();
            clear_funcinput();
            dbconnection.getLibraries().then((result: DiscoLibrary[]) => {
                let libraries: name_rid[] = [];
                for (const l of result.sort(sort_by_name)) {
                    libraries.push({ name: l.name, rid: l["@rid"] });
                }
                createLibSelect(libraries);                

                libraryInput.selectedIndex = 0;
                libraryInput.focus();

                if (dbinfo.librid) {
                    for (var i = 0; i < libraryInput.options.length; ++i) {
                        if (libraryInput.options[i].value === dbinfo.librid) {
                            libraryInput.selectedIndex = i
                        }
                    }
                    
                    dbconnection.getFunctions(dbinfo.librid).then((result: DiscoFunction[]) => {
                        let functions: name_rid[] = [];
                        for (const l of result.sort(sort_by_name)) {
                            functions.push({ name: l.name, rid: l["@rid"] });
                        }
                        
                        console.log('setting up functioninput');
                        createFuncSelect(functions);

                        if (dbinfo.func_name && dbinfo.function_id) {
                            
                            for (var i = 0; i < functionInput.options.length; ++i) {
                                if (functionInput.options[i].value === dbinfo.function_id) {
                                    functionInput.selectedIndex = i
                                }
                            }

                            goButton.click()
                        }
                        
                    });
                }
                
            });
        }
    });
    databaseInput.focus();

    
}


$(window).resize(refreshLayout);
$(document).ready(setTimeout(refreshLayout, 50) as any);
