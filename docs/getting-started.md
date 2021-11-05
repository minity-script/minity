
### Prerequisites
Minity requires Minecraft Java Edition 1.18 snapshots or later, and Node JS v16 or later.
### Create a datapack with Minity
````
$ npm install -g minity@latest
$ minity
````
Minity's interactive menus will guide you through the process of creating a Minity project, linking it to Minecraft saves and building your datapack. 

If you prefer a command line interface, type `minity help` for available commands. 

!> **UPDATE REGULARLY**<br>Minity is in active development, and bugs are ironed out daily. Run `nmp install -g minity@latest` to update to the latest version. Please report any bugs that you find on Github issues or on Discord.

!> **Note on Windows:**<br>The interactive menus don't play nicely with most Windows terminals, so you might have to use the command line interface instead. `minity help` is a good places to start.<br>Also, Minity uses symbolic links for linking datapacks to Minecraft saves. Symbolic links are restricted to administrators by default on Windows, unless developer mode is enabled. See [this post on Windows developers blog](https://blogs.windows.com/windowsdeveloper/2016/12/02/symlinks-windows-10/) for more information. <br>If you don't want to enable developer mode or un minity with administrator privileges, you can build your datapacks directly in your Minecraft save directory. See the `--target` option in `minity help build` and `minity help watch`.

### Enable and test your datapack in Minecraft.
Open your chosen world in Minecraft. 

Type `/datapack list` to see if your datapack is already enabled. If not, type `/datapack enable file/<my_pack>`;

Type `/reload`. Your datapack will load and run.

### Developing your datapack
* **Consult documentation:** Read the full docs [here](syntax/basics).
* **Try and study the examples:** You can create them with the interative menu, or using `npx minity create`
* **Watch your sources and recompile on change:** Choose the `watch` command in the menu, or use `npx minity watch`. All files in your `src` and `files` directories will be watched, and your datapack rebuilt on every change. Run `/reload` in Minecraft to load the rebuilt pack.
* **Syntax highlighting in IDES**: There is currenty an extension for vscode, which provides syntax highlighting and error checking. You can install it in the extensions tab in vscode by searching for "minity". Its [source code](https://github.com/minity-script/minity-vscode) can be useful for creating extensions for other IDEs. If you create an extension, let us know and we will add it here.
