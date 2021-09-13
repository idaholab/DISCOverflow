<!--- Copyright 2021, Battelle Energy Alliance, LLC
# Known Issues with Discoverflow
-->

# 3DViewer

- Requires CORS Everywhere extension or something similar for browsers.
- 3DViewer has a multi step build process.
- 3DViewer could include arrows, some effort has been made to attempt this was never fully complete and is commented out.
- 3DViewer lines (edges) could be widened/boldened and colorized based on the TYPE (@class) of the edge.  This has been attempted but currently commented out.
- 3DViewer pull from database directly - might be a big effort as it is set up to load positions/names/edges from locally stored files.
- largegraph_data and smallgraph_data should get created if they don't exist to avoid commiting a blank folder
- getData.js hard coded credentials
- Fix deps to be installed succinctly from a singly package.json file.

# 2DViewer

- Requires CORS Everywhere extension or something similar for browsers.
- Handle authentication differently (possibly as a popup).
- Once authentication happens, populate the lists.
- Upon connecting to a database the first library is shown but the functions are not. Currently you have to select a different library then go back to the first one. This is React so it's some sort of state/prop loading that needs fixed.
- When selecting a function, only display that function.Current built populates all functions int he list, but does not display the Control Flow Graph within the function. They are 'empty'
- Mod 2D/3DViewer to only use yarn or NPM not both
