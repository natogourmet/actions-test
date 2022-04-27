# ConfigureID Typescript Reference Implementation POC

This is a POC (proof of concept) of a ConfigureID Reference implementation using Typescript with modern features.

It wraps the ConfigureUI library and adapts its API to use Promises (async/await) instead of nodejs-style callbacks, preventing excessive nesting.
It also adds advanced typing that catches errors (such as typos and missing/wrong parameters) in compile-time and provides real time documentation inside the IDE.

## Requierements

- Node `v16.10`
- [npm](https://www.npmjs.com/get-npm)

Note: You can use [avn](https://www.npmjs.com/package/avn) for loading the expected node version when switching to the folder of `configure-ui`.

## VS Code Plugins

In order to take advantage of all the tools, the following plugins must be installed:

- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [PostCSS](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
- [PostcssSugarssLanguage](https://marketplace.visualstudio.com/items?itemName=mhmadhamster.postcss-language)
- [ES6 HTML Comments](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html)

Suggested plugins:

- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
- [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)

## Install

- If you are using **Windows**: disable new line conversion to **CRLF** by executing:`git config --local core.autocrlf input`.
- If you didn't install `EditorConfig` plugin, and configure your **IDE** (eg. VS Code) to use `LF` as the new line character and indent using 2 spaces.
- Clone this repo
- Run `npm install`

## Husky

- Enable Git hooks

```
npx husky install
```

- If pre-commit is not executed after commit, make pre-commit.sh executable:

```
chmod ug+x .husky/\*
```

- For WSL2 some issue can be cause by $PATH missing your Linux node installation: [WebStorm WSL2 commit error on pre-commit hook](https://youtrack.jetbrains.com/issue/WEB-46116)

## Develop

- Run `npm run dev`
- Open `http://localhost:3000` on your browser
- Transpilation and linting errors will be shown in the console.
- Any change in HTML, TS or CSS will be automatically applied to the live application
- Enjoy your success! :)
