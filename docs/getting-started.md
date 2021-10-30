
### Prerequisites
Minity requires Minecraft Java Edition 1.18 snapshots or later, and Node JS v16 or later.
### Create a datapack with Minity
````
npx minity@latest
````
Minity's interactive menus will guide you through the process of creating a Minity project, linking it to Minecraft saves and building your datapack. 

If you prefer a command line interface, type `npx minity help` for available commands. You can of course also install Minity on your computer with `npm install -g minity@latest`, and use just `minity` instead of `npx minity` henceforth.

### Enable and test your datapack in Minecraft.
Open your chosen world in Minecraft. 

Type `/datapack list` to see if your datapack is already enabled. If not, type `/datapack enable file/<my_pack>`;

Type `/reload`. Your datapack will load and run.

### Developing your datapack
* **Consult documentation:** Read the full docs [here](syntax/index.md).
* **Try and study the examples:** You can create them with the interative menu, or using `npx minity create`
* **Watch your sources and recompile on change:** Choose the `watch` command in the menu, or use `npx minity watch`. All files in your `src` and `files` directories will be watched, and your datapack rebuilt on every change. Run `/reload` in Minecraft to load the rebuilt pack.
* **Syntax highlighting in IDES**: There is currenty an extension for vscode, which provides syntax highlighting and error checking. You can install it in the extensions tab in vscode by searching for "minity". Its [source code](https://github.com/minity-script/minity-vscode) can be useful for creating extensions for other IDEs. If you create an extension, let us know and we will add it here.
