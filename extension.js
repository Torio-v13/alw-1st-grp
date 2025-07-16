const vscode = require('vscode');

function activate(context) {
  const openListener = vscode.workspace.onDidOpenTextDocument(async (doc) => {
    if (doc.uri.scheme !== 'file') return;

    // Esperamos un momento para que la pestaña se registre en su grupo
    await new Promise(resolve => setTimeout(resolve, 100));

    // Si ya está en el grupo 1, no hacemos nada
    const alreadyInGroup1 = vscode.window.tabGroups.all.some(group => 
      group.viewColumn === vscode.ViewColumn.One &&
      group.tabs.some(tab => tab.input?.uri?.toString() === doc.uri.toString())
    );

    if (alreadyInGroup1) return;

    try {
      // Mostrar en grupo 1
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.One,
        preview: false,
        preserveFocus: false
      });

      // Esperamos a que VSCode procese el cambio de foco
      await new Promise(resolve => setTimeout(resolve, 200));

      // Cerrar todas las instancias duplicadas en otros grupos
      for (const group of vscode.window.tabGroups.all) {
        if (group.viewColumn === vscode.ViewColumn.One) continue;

        for (const tab of group.tabs) {
          if (tab.input?.uri?.toString() === doc.uri.toString()) {
            await vscode.window.tabGroups.close(tab);
          }
        }
      }
    } catch (e) {
      console.error('Error al mover o cerrar pestaña:', e);
    }
  });

  context.subscriptions.push(openListener);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
