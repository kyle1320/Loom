# Loom: Static Site Web Development / Design UI

### To Run Locally
* Ensure you have Node.js >=8 with `npm` installed
* `npm install`
* `npm run dev`

### Basic Code Structore
* `src/main` contains code for the main Electron process. Currently this just starts up the render process.
* `src/common` contains non-UI code; essentially, the "core" features of Loom such as objects, fields, etc.
* `src/renderer` contains UI-related code and plugins. The UI is driven by React. Plugins are what give Loom its usefulness - they register class objects, field names, UI components, etc.